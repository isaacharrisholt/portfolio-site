package main

func (s *server) routes() {
	s.router.HandleFunc("/", s.handleIndex())
	s.router.HandleFunc("/form-messages", s.withCORS(s.handleFormMessages()))
	s.router.HandleFunc("/work-experience", s.withCORS(s.handleWorkExperience()))
	s.router.HandleFunc("/personal-projects", s.withCORS(s.handlePersonalProjects()))
}
