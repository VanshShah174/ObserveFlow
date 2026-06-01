import json
import time
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# OTel API for trace correlation in logs
try:
    from opentelemetry import trace
except ImportError:
    trace = None

app = Flask(__name__)
CORS(app)

# In-memory user storage
users = {
    "user-1": {
        "id": "user-1",
        "name": "John Doe",
        "email": "john@observeflow.dev",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        "memberSince": "2024-01-15T00:00:00Z",
        "tier": "gold"
    },
    "user-2": {
        "id": "user-2",
        "name": "Jane Smith",
        "email": "jane@observeflow.dev",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        "memberSince": "2024-03-22T00:00:00Z",
        "tier": "silver"
    },
    "user-3": {
        "id": "user-3",
        "name": "Bob Wilson",
        "email": "bob@observeflow.dev",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        "memberSince": "2024-06-10T00:00:00Z",
        "tier": "bronze"
    }
}


def log_request(method, path, status_code, duration_ms):
    # Extract trace context from OTel auto-instrumentation
    trace_id = ""
    span_id = ""
    if trace:
        span = trace.get_current_span()
        ctx = span.get_span_context()
        if ctx.trace_id:
            trace_id = format(ctx.trace_id, '032x')
            span_id = format(ctx.span_id, '016x')

    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "user-service",
        "method": method,
        "path": path,
        "statusCode": status_code,
        "durationMs": duration_ms,
        "traceId": trace_id,
        "spanId": span_id
    }
    print(json.dumps(log_entry), flush=True)


@app.before_request
def before_request():
    request._start_time = time.time()


@app.after_request
def after_request(response):
    duration = (time.time() - request._start_time) * 1000
    log_request(request.method, request.path, response.status_code, round(duration, 2))
    return response


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "user-service", "language": "python"})


@app.route("/users", methods=["GET"])
def get_users():
    return jsonify(list(users.values()))


@app.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    user = users.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)


@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("email"):
        return jsonify({"error": "name and email are required"}), 400

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    user = {
        "id": user_id,
        "name": data["name"],
        "email": data["email"],
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={data['name'].split()[0].lower()}",
        "memberSince": datetime.utcnow().isoformat() + "Z",
        "tier": "bronze"
    }
    users[user_id] = user
    return jsonify(user), 201


@app.route("/users/<user_id>/profile", methods=["PUT"])
def update_profile(user_id):
    user = users.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if data.get("name"):
        user["name"] = data["name"]
    if data.get("email"):
        user["email"] = data["email"]

    return jsonify(user)


if __name__ == "__main__":
    print(json.dumps({
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "user-service",
        "message": "User service running on port 4003"
    }), flush=True)
    app.run(host="0.0.0.0", port=4003)
