FROM golang:1.16-alpine AS builder

RUN mkdir /build

COPY go.mod /build
COPY go.sum /build
WORKDIR /build
RUN go mod download

ENV GOOS=linux
ENV CGO_ENABLED=0
COPY *.go /build/
RUN go build -o api .

FROM alpine
RUN apk add --no-cache ca-certificates && update-ca-certificates
WORKDIR /
COPY --from=builder /build/api /
COPY service-account.json /
CMD [ "./api" ]