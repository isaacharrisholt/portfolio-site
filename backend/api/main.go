package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	s := server{router: http.NewServeMux()}
	s.routes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
		log.Printf("Defaulting to port %s", port)
	}

	log.Printf("Listening on port %s", port)
	if err := http.ListenAndServe(":"+port, s.router); err != nil {
		log.Fatal(err)
	}
}
