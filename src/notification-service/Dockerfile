FROM --platform=$BUILDPLATFORM golang:1.22-alpine AS build

ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o notification-service .

FROM alpine:3.19

RUN apk add --no-cache wget

WORKDIR /app
COPY --from=build /app/notification-service .

EXPOSE 4004

CMD ["./notification-service"]
