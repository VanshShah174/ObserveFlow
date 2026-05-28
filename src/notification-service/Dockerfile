FROM golang:1.22-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o notification-service .

FROM alpine:3.19

WORKDIR /app
COPY --from=build /app/notification-service .

EXPOSE 4004

CMD ["./notification-service"]
