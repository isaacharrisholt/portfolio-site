package main

type formMessage struct {
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	Message   string  `json:"message"`
	ID        string  `json:"id,omitempty"`
	CreatedAt isoTime `json:"created_at"`
}
