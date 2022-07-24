FROM golang:1.16-alpine AS builder

RUN mkdir /build

COPY go.mod /build
COPY go.sum /build
WORKDIR /build
RUN go mod download

ENV GOOS=linux
ENV CGO_ENABLED=0
COPY *.go /build/
RUN go build -o email .

FROM scratch
WORKDIR /
COPY --from=builder /build/email /
CMD [ "./email" ]