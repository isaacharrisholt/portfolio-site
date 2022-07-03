package main

type formMessage struct {
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	Message   string  `json:"message"`
	ID        string  `json:"id"`
	CreatedAt isoTime `json:"created_at"`
}

type workExperience struct {
	Company     string  `json:"company"`
	Position    string  `json:"position"`
	Description string  `json:"description"`
	StartDate   isoDate `json:"start_date"`
	EndDate     isoDate `json:"end_date"`
	ID          string  `json:"id"`
}

type personalProject struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Skills      []string `json:"skills"`
	Url         string   `json:"url"`
}
