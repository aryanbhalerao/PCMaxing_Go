FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/pcmaxing ./backend/main.go

FROM alpine:latest

WORKDIR /app

# Install ca-certificates for potential HTTPS requests
RUN apk --no-cache add ca-certificates

# Copy the binary and necessary files
COPY --from=builder /app/pcmaxing .
COPY --from=builder /app/backend/schema.sql ./backend/schema.sql
COPY --from=builder /app/backend/schema.sql ./schema.sql

# Create data directory for sqlite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Run the executable
CMD ["./pcmaxing"]
