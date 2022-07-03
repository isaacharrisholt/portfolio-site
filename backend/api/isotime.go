package main

import (
	"log"
	"strings"
	"time"
)

type isoTime time.Time

func (t *isoTime) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	if s == "null" {
		*t = isoTime(time.Time{})
	}
	parsedTime, err := time.Parse("2006-01-02T15:04:05.000000", s)
	if err != nil {
		log.Println("error parsing time:", err)
		return err
	}
	log.Println(parsedTime)
	*t = isoTime(parsedTime)
	return nil
}

func (t *isoTime) MarshalJSON() ([]byte, error) {
	return []byte(t.Format("\"2006-01-02T15:04:05.000000\"")), nil
}

func (t *isoTime) Format(s string) string {
	timeObj := time.Time(*t)
	return timeObj.Format(s)
}

func (t *isoTime) String() string {
	return t.Format(time.RFC3339)
}
