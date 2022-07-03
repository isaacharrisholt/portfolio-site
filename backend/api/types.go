package main

type formMessage struct {
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	Message   string  `json:"message"`
	ID        string  `json:"id,omitempty"`
	CreatedAt isoTime `json:"created_at,omitempty"`
}

type workExperience struct {
	Company     string  `json:"company"`
	Position    string  `json:"position"`
	Description string  `json:"description"`
	StartDate   isoDate `json:"start_date"`
	EndDate     isoDate `json:"end_date,omitempty"`
	ID          string  `json:"id,omitempty"`
}

type personalProject struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Skills      []string `json:"skills"`
	Url         string   `json:"url,omitempty"`
}
