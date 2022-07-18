package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/pubsub"
)

func main() {
	ctx := context.Background()

	projectID := "isaac-harris-holt-portfolio"

	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	defer client.Close()

	s := server{router: http.NewServeMux(), pubsubClient: client}
	s.routes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
		log.Printf("Defaulting to port %s", port)
	}

	log.Printf("Listening on port %s", port)
	if err = http.ListenAndServe(":"+port, s.router); err != nil {
		log.Fatal(err)
	}
}
