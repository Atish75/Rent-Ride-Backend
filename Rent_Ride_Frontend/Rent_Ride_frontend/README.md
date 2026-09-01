
# 🚗 Rent Ride — Frontend Web Application

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Hosted-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

The modern Single Page Application (SPA) frontend for **Rent Ride**, an intuitive car rental and real-time vehicle booking system. Built using **React** and **Vite**, this application provides a responsive UI, JWT-based session persistence, real-time vehicle filtering, deferred payment checkout modals, and live vehicle GPS tracking interfaces.

---

## 🌟 Key Features

* **Dynamic Vehicle Discovery & Filtering:** Real-time client-side search across car models, brands, fuel types, and transmission modes.
* **Book First, Pay Later Workflow:** Interactive date-selection flow creating instant booking states with a deferred payment mechanism.
* **Custom Interactive Payment Modal:** Form-based UPI and Card checkout simulation generating verified transaction records and updating real-time backend state.
* **JWT Auth Persistence & Context:** Centralized `AuthContext` handling JWT token management, session retention across page reloads, and protected route access.
* **Role-Based Dynamic Routing:** Conditional navigation tailored for standard customers versus driver user profiles (`/role-select`).
* **Live GPS Tracking Interface:** Dedicated view querying real-time vehicle latitude/longitude coordinates.

---

## 🏗 System Architecture

```text
       ┌────────────────────────┐
       │   React.js Frontend    │ (Hosted on Vercel)
       └───────────┬────────────┘
                   │
                   │ REST APIs / HTTPS (Bearer Token Auth)
                   ▼
       ┌────────────────────────┐
       │  Django REST Framework │ (Hosted on Render)
       └────────────────────────┘
