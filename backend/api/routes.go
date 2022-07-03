package main

func (s *server) routes() {
	s.router.HandleFunc("/", s.handleIndex())
	s.router.HandleFunc("/form-messages", s.handleFormMessagesGet())
}
