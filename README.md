# Rent-Ride

# Rent Ride — Backend API Services

[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-6.0+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-API-red?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Deployed on Render](https://img.shields.io/badge/Render-Hosted-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Cron-Job](https://img.shields.io/badge/Keep--Alive-Cron--Job.org-4C8BF5?style=for-the-badge&logo=clockify&logoColor=white)](https://cron-job.org/)

The core RESTful API backend for **Rent Ride**, an end-to-end car rental platform. Built using **Django REST Framework (DRF)**, this service manages stateful user authentication, concurrency-safe car bookings, deferred payment state machines, Cloudinary media storage, and live GPS geolocation tracking.

---

## 🌟 Key Technical Features

* **Concurrency Control & Data Integrity:** Uses atomic database transactions (`transaction.atomic()`) with row-level locking (`select_for_update()`) to eliminate race conditions and prevent double-booking issues.
* **Stateless JWT Authentication:** Implements `SimpleJWT` for secure token-based user authentication and role-based access logic (User vs Driver).
* **Deferred Payment State Machine:** Implements a *Book First, Pay Later* workflow transitioning state safely from `PENDING` to `PAID` with generated transaction records.
* **Cloudinary Media Management:** Integrated cloud storage for dynamic asset uploads and automatic cloud deletion on asset removal.
* **Polyglot Query & Filtering:** Dynamic search backends (`filters.SearchFilter`) filtering cars by name, brand, fuel type, and transmission.
* **Live GPS Tracking Endpoint:** Geolocation API endpoints updating and fetching real-time latitude/longitude coordinates for active vehicle rides.
* **Zero Cold-Start Keep-Alive Strategy:** Automated external heartbeat cron service via [cron-job.org](https://cron-job.org/) pinging the health-check endpoint every 10 minutes to prevent Render free-tier instance inactivity spin-down.
---

## 🏗 System Architecture

```text
       ┌────────────────────────┐
       │   React.js Frontend    │ (Hosted on Vercel)
       └───────────┬────────────┘
                   │ HTTPS / REST API (JWT Header)
                   ▼
       ┌────────────────────────┐
       │  Django REST Framework │ (Hosted on Render WSGI)
       └─────┬────────────┬─────┘
             │            │
             ▼            ▼
 ┌──────────────┐   ┌─────────────────┐
 │ PostgreSQL / │    │    Cloudinary API  │
 │     MySQL    │    │    (Media Assets)  │
 └──────────────┘   └─────────────────┘

---

## 🏗  High-Availability & Cold-Start Optimization
Render free web services automatically spin down into a dormant state after 15 minutes of inbound network inactivity, causing a 50+ second cold-start latency delay on incoming user traffic.

To ensure near-instantaneous response times for the frontend:

```text
  ┌─────────────────┐       GET /api/health/ (Every 10 mins)       ┌────────────────────────┐
  │  cron-job.org   │ ───────────────────────────────────────────> │  Django API (Render)   │
  │  (Cloud Pinger) │ <─────────────────────────────────────────── │  (Returns 200 OK)      │
  └─────────────────┘              Keep-Alive Active               └────────────────────────┘
