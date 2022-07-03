package main

func (s *server) routes() {
	s.router.HandleFunc("/", s.handleIndex())
	s.router.HandleFunc("/form-messages", s.handleFormMessages())
	s.router.HandleFunc("/work-experience", s.handleWorkExperience())
	s.router.HandleFunc("/personal-projects", s.handlePersonalProjects())
}
