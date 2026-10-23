# Bloomify - Web Application Dockerization

Bloomify static web application containerized using Nginx and Docker Compose.

## Prerequisites
- Docker Desktop / Docker Engine
- Docker Compose

## How to Run the Application
1. Clone repositori:
   git clone https://github.com/nikitazebua1202/group5-isapmd.git
   cd group5-isapmd

2. Create `.env` file from `.env.example`:
   cp .env.example .env

3. Run the container using Docker Compose:
   docker compose up -d

4. Access the application in your browser at: `http://localhost:8081`

## Check Status & Logs
- Check container status: `docker compose ps`
- Check application logs: `docker compose logs`

## Stopping the Application
- Stop the container: `docker compose down`
