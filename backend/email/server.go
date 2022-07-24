package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	mailjet "github.com/mailjet/mailjet-apiv3-go"
)

type server struct {
	router                  *http.ServeMux
	pubsubVerificationToken string
	emailClient             *mailjet.Client
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

// handleEmailPost sends emails via Mailjet when a POST request is sent to the /email endpoint
func (s *server) handleEmailPost() http.HandlerFunc {
	type request struct {
		Message struct {
			Attributes map[string]string `json:"attributes"`
			// Data contains a list due to issues with the API service
			Data []byte `json:"data"`
			ID   string `json:"message_id"`
		} `json:"message"`
		Subscription string `json:"subscription"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
		}
		log.Println("got email POST request")
		msg := &request{}
		if err := decodeBody(r, &msg); err != nil {
			log.Printf("could not decode body: %v", err)
			respondErr(w, http.StatusBadRequest, fmt.Sprintf("could not decode body: %v", err))
			return
		}
		data := make(map[string]interface{})
		if err := json.Unmarshal(msg.Message.Data, &data); err != nil {
			log.Printf("could not decode data: %v", err)
			respondErr(w, http.StatusBadRequest, fmt.Sprintf("could not decode data: %v", err))
			return
		}
		name := data["name"].(string)
		email := data["email"].(string)
		contactMessage := data["message"].(string)
		log.Println("sending notification email")
		err := s.sendNotificationEmail(name, email, contactMessage)
		if err != nil {
			log.Printf("could not send notification email: %v", err)
			respondErr(w, http.StatusInternalServerError, fmt.Sprintf("could not send notification email: %v", err))
			return
		}
		log.Println("done sending notification email")
		log.Println("sending thank you email")
		err = s.sendThankYouEmail(name, email)
		if err != nil {
			log.Printf("could not send thank you email: %v", err)
			respondErr(w, http.StatusInternalServerError, fmt.Sprintf("could not send thank you email: %v", err))
			return
		}
		log.Println("done sending thank you email")
		w.WriteHeader(http.StatusOK)
	}
}

func (s *server) sendThankYouEmail(toName, toEmail string) error {
	if len(toName) == 0 {
		return fmt.Errorf("invalid name: %v", toName)
	}
	names := strings.Split(toName, " ")
	firstName := names[0]
	messagesInfo := []mailjet.InfoMessagesV31{
		{
			From: &mailjet.RecipientV31{
				Email: "isaac@harris-holt.com",
				Name:  "Isaac Harris-Holt",
			},
			To: &mailjet.RecipientsV31{
				mailjet.RecipientV31{
					Email: toEmail,
					Name:  toName,
				},
			},
			TemplateID:       4082854,
			TemplateLanguage: true,
			Subject:          "I'll get back to you soon, [[data:firstname:\"\"]]!",
			Variables: map[string]interface{}{
				"firstname": firstName,
			},
		},
	}
	messages := mailjet.MessagesV31{Info: messagesInfo}
	_, err := s.emailClient.SendMailV31(&messages)
	return err
}

func (s *server) sendNotificationEmail(fromName, fromEmail, message string) error {
	messagesInfo := []mailjet.InfoMessagesV31{
		{
			From: &mailjet.RecipientV31{
				Email: fromEmail,
				Name:  fromName,
			},
			To: &mailjet.RecipientsV31{{
				Email: "isaac@harris-holt.com",
				Name:  "Isaac Harris-Holt"},
			},
			TemplateID:       4082906,
			TemplateLanguage: true,
			Subject:          "New email from [[data:name:\"\"]] on ihh.dev",
			Variables: map[string]interface{}{
				"name":    fromName,
				"email":   fromEmail,
				"message": message,
			},
		},
	}
	messages := mailjet.MessagesV31{Info: messagesInfo}
	_, err := s.emailClient.SendMailV31(&messages)
	return err
}
