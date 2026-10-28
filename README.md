# ProJenius Admin Frontend

A modular React + Vite administration interface for the ProJenius 3D Printing website. It connects to the shared REST API; it does not include the backend or database.

## Requirements
- Node.js 20.19+ (recommended)
- The ProJenius Express API running at `http://localhost:5000`

## Setup
1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the API base URL.
2. Run `npm install`.
3. Run `npm run dev`. Open `http://localhost:5174`.
4. Create the first administrator using the backend's documented bootstrap command. No default password is shipped.

## Build
`npm run build`

## API contract
The frontend expects cookie-based authentication (`/auth/login`, `/auth/me`, `/auth/logout`) and resource endpoints under `/api`. Requests use `credentials: include`; configure the API CORS policy to allow this origin and credentials. Missing API endpoints show a visible error and are not filled with demo records.

## Structure
Pages are route-level modules; reusable dashboard and product UI is split into focused component folders. Global tokens and base styles live in `src/styles/`.
