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
		return nil
	}
	parsedTime, err := time.Parse("2006-01-02T15:04:05.000000", s)
	if err != nil {
		log.Println("error parsing time:", err)
		return err
	}
	*t = isoTime(parsedTime)
	return nil
}

func (t *isoTime) MarshalJSON() ([]byte, error) {
	if *t == isoTime(time.Time{}) {
		return []byte("null"), nil
	}
	return []byte(t.Format("\"2006-01-02T15:04:05.000000\"")), nil
}

func (t *isoTime) Format(s string) string {
	timeObj := time.Time(*t)
	return timeObj.Format(s)
}

func (t *isoTime) Unix() int64 {
	return time.Time(*t).Unix()
}

func (t *isoTime) String() string {
	return t.Format(time.RFC3339)
}

type isoDate time.Time

func (d *isoDate) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	if s == "null" {
		*d = isoDate(time.Time{})
		return nil
	}
	parsedDate, err := time.Parse("2006-01-02", s)
	if err != nil {
		log.Println("error parsing time:", err)
		return err
	}
	*d = isoDate(parsedDate)
	return nil
}

func (d *isoDate) MarshalJSON() ([]byte, error) {
	if *d == isoDate(time.Time{}) {
		return []byte("null"), nil
	}
	return []byte(d.Format("\"2006-01-02\"")), nil
}

func (d *isoDate) Format(s string) string {
	timeObj := time.Time(*d)
	return timeObj.Format(s)
}

func (d *isoDate) String() string {
	return d.Format("2006-01-02")
}
