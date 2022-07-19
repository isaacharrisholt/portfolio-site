package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/pubsub"
)

type server struct {
	router       *http.ServeMux
	pubsubClient *pubsub.Client
}

func decodeBody(r *http.Request, v interface{}) error {
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(r.Body)
	return json.NewDecoder(r.Body).Decode(v)
}

func encodeBody(w http.ResponseWriter, v interface{}) error {
	return json.NewEncoder(w).Encode(v)
}

func respond(w http.ResponseWriter, status int, data interface{}) {
	w.WriteHeader(status)
	if data != nil {
		err := encodeBody(w, data)
		if err != nil {
			log.Println("response failed:", err)
			return
		}
	}
}

func respondErr(w http.ResponseWriter, status int, args ...interface{}) {
	respond(w, status, map[string]interface{}{
		"error": map[string]interface{}{
			"message": fmt.Sprint(args...),
		},
	})
}

// dbGetRequest makes a request to the DB microservice and returns the response bytes
func dbGetRequest(endpoint string) ([]byte, error) {
	urlBase := os.Getenv("DB_HOST")
	if urlBase == "" {
		urlBase = "http://localhost:8000"
	}

	url := urlBase + endpoint
	dbResponse, err := http.Get(url)
	if err != nil {
		log.Println("error making GET request:", err)
		return nil, errors.New(fmt.Sprint("error making GET request: ", err))
	} else if dbResponse.StatusCode != http.StatusOK {
		log.Println("failed GET request:", dbResponse.StatusCode)
		return nil, errors.New(fmt.Sprint("failed GET request: ", dbResponse.StatusCode))
	}

	dbData, err := ioutil.ReadAll(dbResponse.Body)
	if err != nil {
		log.Println("error reading DB response:", err)
		return nil, errors.New(fmt.Sprint("error reading DB response: ", err))
	}
	return dbData, nil
}

// dbPostRequest makes a POST request to the DB microservice and returns the response bytes
func dbPostRequest(endpoint string, data interface{}) ([]byte, error) {
	urlBase := os.Getenv("DB_HOST")
	if urlBase == "" {
		urlBase = "http://localhost:8000"
	}

	url := urlBase + endpoint
	reqBody, err := json.Marshal(data)
	if err != nil {
		log.Println("error marshalling request body:", err)
		return nil, errors.New(fmt.Sprint("error marshalling request body: ", err))
	}

	dbResponse, err := http.Post(url, "application/json", bytes.NewReader(reqBody))
	if err != nil {
		log.Println("error making POST request:", err)
		return nil, errors.New(fmt.Sprint("error making POST request: ", err))
	} else if dbResponse.StatusCode != http.StatusOK {
		log.Println("failed POST request:", dbResponse.StatusCode)
		return nil, errors.New(fmt.Sprint("failed POST request: ", dbResponse.StatusCode))
	}

	dbData, err := ioutil.ReadAll(dbResponse.Body)
	if err != nil {
		log.Println("error reading DB response:", err)
		return nil, errors.New(fmt.Sprint("error reading DB response: ", err))
	}
	return dbData, nil
}

// publishPubSubRequest publishes a JSON message on the specified Pub/Sub topic
func (s *server) publishPubSubRequest(topic string, message interface{}) (string, error) {
	ctx := context.Background()
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return "", err
	}
	t := s.pubsubClient.Topic(topic)
	result := t.Publish(
		ctx,
		&pubsub.Message{
			Data: jsonMessage,
		},
	)
	return result.Get(ctx)
}

// handleIndex returns an OK response as a health check
func (s *server) handleIndex() http.HandlerFunc {
	type response struct {
		Message string `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("received health check")
		w.WriteHeader(http.StatusOK)
		respond(w, http.StatusOK, response{Message: "OK!"})
	}
}

// handleFormMessages handles all requests to the form-messages endpoint
func (s *server) handleFormMessages() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var f http.HandlerFunc
		switch r.Method {
		case http.MethodGet:
			f = s.handleFormMessagesGet()
		case http.MethodPost:
			f = s.handleFormMessagesPost()
		case http.MethodOptions:
			f = func(w http.ResponseWriter, r *http.Request) {
				w.Header().Add("Access-Control-Allow-Methods", "GET")
				w.Header().Add("Access-Control-Allow-Methods", "POST")
				respond(w, http.StatusOK, nil)
			}
		}
		f(w, r)
	}
}

// handleFormMessagesGet handles GET requests to the form-messages endpoint
func (s *server) handleFormMessagesGet() http.HandlerFunc {
	type response struct {
		Message []formMessage `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("got form-messages GET request")
		dbData, err := dbGetRequest("/form-messages")
		if err != nil {
			log.Println("error requesting from DB:", err)
			respondErr(w, http.StatusInternalServerError, err)
			return
		}

		messages := make([]formMessage, 0)
		err = json.Unmarshal(dbData, &messages)
		if err != nil {
			log.Println("error unmarshalling response data:", err, dbData)
			respondErr(w, http.StatusInternalServerError, err, dbData)
			return
		}
		respond(w, http.StatusOK, response{Message: messages})
	}
}

// handleFormMessagesPost handles POST requests to the form-messages endpoint
func (s *server) handleFormMessagesPost() http.HandlerFunc {
	type response struct {
		// This is a slice because for some reason Go wasn't marshalling the created_at field when it was just the
		// formMessages object
		Message []formMessage `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("got form-messages POST request")
		var requestMessage formMessage
		err := decodeBody(r, &requestMessage)
		if err != nil {
			log.Println("error unmarshalling request data:", err)
			respondErr(w, http.StatusInternalServerError, err)
			return
		}
		dbData, err := dbPostRequest("/form-message", requestMessage)
		if err != nil {
			log.Println("error POSTing to DB:", err)
			respondErr(w, http.StatusInternalServerError, err)
			return
		}
		var responseMessage formMessage
		err = json.Unmarshal(dbData, &responseMessage)
		if err != nil {
			log.Println("error unmarshalling DB data:", err)
			respondErr(w, http.StatusInternalServerError, err)
			return
		}
		_, err = s.publishPubSubRequest("email-request", responseMessage)
		if err != nil {
			log.Println("error publishing to Pub/Sub:", err)
			respondErr(w, http.StatusInternalServerError, err)
			return
		}
		respond(w, http.StatusOK, response{Message: []formMessage{responseMessage}})
	}
}

// handleWorkExperience handles GET requests for the work-experience endpoint
func (s *server) handleWorkExperience() http.HandlerFunc {
	type response struct {
		Message []workExperience `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("got work-experience GET request")
		dbData, err := dbGetRequest("/work-experience")
		if err != nil {
			log.Println("error requesting from DB:", err)
			respondErr(w, http.StatusInternalServerError, err)
			return
		}
		messages := make([]workExperience, 0)
		err = json.Unmarshal(dbData, &messages)
		if err != nil {
			log.Println("error unmarshalling data:", err, string(dbData))
			respondErr(w, http.StatusInternalServerError, err, string(dbData))
			return
		}
		respond(w, http.StatusOK, response{Message: messages})
	}
}

// handlePersonalProjects handles GET requests for the personal-projects endpoint
func (s *server) handlePersonalProjects() http.HandlerFunc {
	type response struct {
		Message []personalProject `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("got personal-projects GET request")
		dbData, err := dbGetRequest("/personal-projects")
		if err != nil {
			log.Println("error requesting from DB:", err)
			respondErr(w, http.StatusInternalServerError, err)
			return
		}
		messages := make([]personalProject, 0)
		err = json.Unmarshal(dbData, &messages)
		if err != nil {
			log.Println("error unmarshalling data:", err, string(dbData))
			respondErr(w, http.StatusInternalServerError, err, string(dbData))
			return
		}
		respond(w, http.StatusOK, response{Message: messages})
	}
}
