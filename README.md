# ObserveFlow - Polyglot E-Commerce Microservices

A distributed e-commerce application built with polyglot microservices architecture, designed for observability with OpenTelemetry and ADOT.

## Architecture

| Service | Language | Port | Description |
|---------|----------|------|-------------|
| frontend-service | JavaScript (React + Vite) | 3000 | E-commerce UI |
| product-service | JavaScript (Node.js + Express) | 4000 | Product catalog |
| cart-service | JavaScript (Node.js + Express) | 4001 | Shopping cart |
| order-service | JavaScript (Node.js + Express) | 4002 | Order processing |
| user-service | Python (Flask) | 4003 | User profiles |
| notification-service | Go | 4004 | Event notifications |
| inventory-service | Java (Spring Boot) | 4005 | Stock management |

## Running with Docker Compose

```bash
docker-compose up --build
```

Access the frontend at http://localhost:3000.

## Running Services Individually

### Product Service (Node.js)

```bash
cd product-service
npm install
npm start
```

### Cart Service (Node.js)

```bash
cd cart-service
npm install
npm start
```

### Order Service (Node.js)

```bash
cd order-service
npm install
npm start
```

### User Service (Python)

```bash
cd user-service
pip install -r requirements.txt
python app.py
```

### Notification Service (Go)

```bash
cd notification-service
go run main.go
```

### Inventory Service (Java)

```bash
cd inventory-service
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend-service
npm install
npm run dev
```

## API Endpoints

### Product Service — :4000

- `GET /products` — List all products
- `GET /products/:id` — Get a single product
- `GET /health` — Health check

### Cart Service — :4001

- `GET /cart/:userId` — Get cart for a user
- `POST /cart/:userId/items` — Add item to cart
- `DELETE /cart/:userId/items/:itemId` — Remove item from cart
- `GET /health` — Health check

### Order Service — :4002

- `POST /orders` — Create order from cart
- `GET /orders/:userId` — Get orders for a user
- `GET /health` — Health check

### User Service — :4003

- `GET /users` — List all users
- `GET /users/:userId` — Get user profile
- `POST /users` — Create user
- `PUT /users/:userId/profile` — Update profile
- `GET /health` — Health check

### Notification Service — :4004

- `GET /notifications/:userId` — Get notifications for user
- `POST /notifications` — Create notification
- `PUT /notifications/:userId/:notifId/read` — Mark as read
- `GET /health` — Health check

### Inventory Service — :4005

- `GET /inventory` — Get all inventory
- `GET /inventory/:productId` — Get stock for product
- `POST /inventory/:productId/reserve` — Reserve stock
- `POST /inventory/:productId/release` — Release reserved stock
- `POST /inventory/:productId/restock` — Add stock
- `GET /health` — Health check
