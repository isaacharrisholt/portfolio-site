package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

type server struct {
	router *http.ServeMux
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

func encodeBody(w http.ResponseWriter, r *http.Request, v interface{}) error {
	return json.NewEncoder(w).Encode(v)
}

func respond(w http.ResponseWriter, r *http.Request, status int, data interface{}) {
	w.WriteHeader(status)
	if data != nil {
		err := encodeBody(w, r, data)
		if err != nil {
			log.Println("response failed:", err)
			return
		}
	}
}

func respondErr(w http.ResponseWriter, r *http.Request, status int, args ...interface{}) {
	respond(w, r, status, map[string]interface{}{
		"error": map[string]interface{}{
			"message": fmt.Sprint(args...),
		},
	})
}

func requestFromDB(endpoint string) ([]byte, error) {
	urlBase, ok := os.LookupEnv("DB_HOST")
	if !ok {
		urlBase = "http://localhost:8000"
	}
	url := urlBase + endpoint
	dbResponse, err := http.Get(url)
	if err != nil || dbResponse.StatusCode != http.StatusOK {
		log.Println("error making GET request:", err)
		return nil, errors.New(fmt.Sprint("error making GET request:", err))
	}
	dbData, err := ioutil.ReadAll(dbResponse.Body)
	if err != nil {
		log.Println("error reading DB response:", err)
		return nil, errors.New(fmt.Sprint("error reading DB response:", err))
	}
	return dbData, nil
}

// handleIndex returns an OK response as a health check
func (s *server) handleIndex() http.HandlerFunc {
	type response struct {
		Message string `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received health check")
		w.WriteHeader(http.StatusOK)
		respond(w, r, http.StatusOK, response{Message: "OK!"})
	}
}

// handleFormMessages handles GET requests to the form-messages endpoint
func (s *server) handleFormMessages() http.HandlerFunc {
	type response struct {
		Message []formMessage `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		dbData, err := requestFromDB("/form-messages")
		if err != nil {
			log.Println("error requesting from DB:", err)
			respondErr(w, r, http.StatusInternalServerError, err)
			return
		}
		messages := make([]formMessage, 0)
		err = json.Unmarshal(dbData, &messages)
		if err != nil {
			log.Println("error unmarshalling data:", err, dbData)
			respondErr(w, r, http.StatusInternalServerError, err, dbData)
			return
		}
		respond(w, r, http.StatusOK, response{Message: messages})
	}
}

// handleWorkExperience handles GET requests for the work-experience endpoint
func (s *server) handleWorkExperience() http.HandlerFunc {
	type response struct {
		Message []workExperience `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		dbData, err := requestFromDB("/work-experience")
		if err != nil {
			log.Println("error requesting from DB:", err)
			respondErr(w, r, http.StatusInternalServerError, err)
			return
		}
		messages := make([]workExperience, 0)
		err = json.Unmarshal(dbData, &messages)
		if err != nil {
			log.Println("error unmarshalling data:", err, string(dbData))
			respondErr(w, r, http.StatusInternalServerError, err, string(dbData))
			return
		}
		respond(w, r, http.StatusOK, response{Message: messages})
	}
}

// handlePersonalProjects handles GET requests for the personal-projects endpoint
func (s *server) handlePersonalProjects() http.HandlerFunc {
	type response struct {
		Message []personalProject `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		dbData, err := requestFromDB("/personal-projects")
		if err != nil {
			log.Println("error requesting from DB:", err)
			respondErr(w, r, http.StatusInternalServerError, err)
			return
		}
		messages := make([]personalProject, 0)
		err = json.Unmarshal(dbData, &messages)
		if err != nil {
			log.Println("error unmarshalling data:", err, string(dbData))
			respondErr(w, r, http.StatusInternalServerError, err, string(dbData))
			return
		}
		respond(w, r, http.StatusOK, response{Message: messages})
	}
}
