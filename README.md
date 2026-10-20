# Bloomify - Web Application Dockerization

Aplikasi web statis Bloomify yang di-containerize menggunakan Nginx dan Docker Compose.

## Prerequisites
- Docker Desktop / Docker Engine
- Docker Compose

## Cara Menjalankan Aplikasi
1. Clone repositori:
   git clone https://github.com/nikitazebua1202/group5-isapmd.git
   cd group5-isapmd

2. Buat file `.env` dari `.env.example`:
   cp .env.example .env

3. Jalankan container dengan Docker Compose:
   docker compose up -d

4. Akses aplikasi melalui browser di: `http://localhost:8081`

## Cek Status & Log
- Cek status container: `docker compose ps`
- Cek log aplikasi: `docker compose logs`

## Mematikan Aplikasi
- Hentikan container: `docker compose down`
