# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy go module files first for layer caching.
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code.
COPY . .

# Build the relay binary.
RUN CGO_ENABLED=0 GOOS=linux go build -o /relay .

# Runtime stage
FROM alpine:3.20

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /relay /app/relay

EXPOSE 8080

CMD ["/app/relay"]
