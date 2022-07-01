package main

func (s *server) routes() {
	s.router.HandleFunc("/", s.handleIndex())
}
