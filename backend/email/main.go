package main

import (
	"log"
	"net/http"
	"os"

	mailjet "github.com/mailjet/mailjet-apiv3-go"
)

func main() {
	pubsubVerificationToken := os.Getenv("PUBSUB_VERIFICATION_TOKEN")
	mailjetClient := mailjet.NewMailjetClient(os.Getenv("MJ_APIKEY_PUBLIC"), os.Getenv("MJ_APIKEY_PRIVATE"))
	s := server{
		router:                  http.NewServeMux(),
		pubsubVerificationToken: pubsubVerificationToken,
		emailClient:             mailjetClient,
	}
	s.routes()
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
		log.Printf("Defaulting to port %s", port)
	}
	log.Printf("Listening on port %s", port)
	if err := http.ListenAndServe(":"+port, s.router); err != nil {
		log.Fatal(err)
	}
}
