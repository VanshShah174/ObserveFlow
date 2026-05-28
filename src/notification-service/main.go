package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/rs/cors"
)

type LogEntry struct {
	Timestamp  string `json:"timestamp"`
	Service    string `json:"service"`
	Method     string `json:"method"`
	Path       string `json:"path"`
	StatusCode int    `json:"statusCode"`
	DurationMs int64  `json:"durationMs"`
}

type Notification struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	Type      string `json:"type"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	Read      bool   `json:"read"`
	CreatedAt string `json:"createdAt"`
}

type NotificationRequest struct {
	UserID  string `json:"userId"`
	Type    string `json:"type"`
	Title   string `json:"title"`
	Message string `json:"message"`
}

var (
	notifications = make(map[string][]Notification)
	mu            sync.RWMutex
	counter       int64
)

func structuredLog(method, path string, statusCode int, duration time.Duration) {
	entry := LogEntry{
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		Service:    "notification-service",
		Method:     method,
		Path:       path,
		StatusCode: statusCode,
		DurationMs: duration.Milliseconds(),
	}
	data, _ := json.Marshal(entry)
	fmt.Println(string(data))
}

func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, statusCode: 200}
		next(rw, r)
		structuredLog(r.Method, r.URL.Path, rw.statusCode, time.Since(start))
	}
}

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":   "ok",
		"service":  "notification-service",
		"language": "go",
	})
}

func getNotificationsHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	if userID == "" {
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "userId is required"})
		return
	}

	mu.RLock()
	userNotifs := notifications[userID]
	mu.RUnlock()

	if userNotifs == nil {
		userNotifs = []Notification{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userNotifs)
}

func createNotificationHandler(w http.ResponseWriter, r *http.Request) {
	var req NotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if req.UserID == "" || req.Title == "" {
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "userId and title are required"})
		return
	}

	mu.Lock()
	counter++
	notif := Notification{
		ID:        fmt.Sprintf("notif-%d-%d", time.Now().UnixMilli(), counter),
		UserID:    req.UserID,
		Type:      req.Type,
		Title:     req.Title,
		Message:   req.Message,
		Read:      false,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}
	notifications[req.UserID] = append(notifications[req.UserID], notif)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(notif)
}

func markReadHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	notifID := r.PathValue("notifId")

	mu.Lock()
	defer mu.Unlock()

	userNotifs, exists := notifications[userID]
	if !exists {
		w.WriteHeader(404)
		json.NewEncoder(w).Encode(map[string]string{"error": "no notifications found"})
		return
	}

	for i := range userNotifs {
		if userNotifs[i].ID == notifID {
			userNotifs[i].Read = true
			notifications[userID] = userNotifs
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(userNotifs[i])
			return
		}
	}

	w.WriteHeader(404)
	json.NewEncoder(w).Encode(map[string]string{"error": "notification not found"})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4004"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", loggingMiddleware(healthHandler))
	mux.HandleFunc("GET /notifications/{userId}", loggingMiddleware(getNotificationsHandler))
	mux.HandleFunc("POST /notifications", loggingMiddleware(createNotificationHandler))
	mux.HandleFunc("PUT /notifications/{userId}/{notifId}/read", loggingMiddleware(markReadHandler))

	handler := cors.AllowAll().Handler(mux)

	startLog, _ := json.Marshal(map[string]string{
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"service":   "notification-service",
		"message":   fmt.Sprintf("Notification service running on port %s", port),
	})
	fmt.Println(string(startLog))

	log.Fatal(http.ListenAndServe(":"+port, handler))
}
