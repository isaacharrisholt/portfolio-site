package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
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

func respondHTTPErr(w http.ResponseWriter, r *http.Request, status int) {
	respondErr(w, r, status, http.StatusText(status))
}

// handleIndex returns an OK response as a health check
func (s *server) handleIndex() http.HandlerFunc {
	type response struct {
		Message string `json:"message"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received health check")
		w.WriteHeader(http.StatusOK)
		err := json.NewEncoder(w).Encode(response{Message: "OK!"})
		if err != nil {
			log.Println("response failed: err")
			return
		}
	}
}
