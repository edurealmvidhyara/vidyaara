# Udemy Clone

A full-stack Udemy clone built with React (Vite) frontend and Express.js backend.

## Project Structure

```
vidhyara/
├── frontend/          # React + Vite frontend (runs on port 3000)
├── backend/           # Express.js backend (runs on port 5000)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for backend)

### Installation

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Set up environment variables:
   - Create `.env` file in the `backend` folder
   - Add your MongoDB connection string and JWT secret

### Running the Application

#### Frontend (Vite)

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:3000

#### Backend (Express)

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:5000

#### Production

Build frontend:

```bash
cd frontend
npm run build
```

Start backend:

```bash
cd backend
npm start
```

## Features

- User authentication (login/signup)
- Course browsing and search
- Wishlist management
- Responsive design with Material-UI

## Tech Stack

### Frontend

- React 18
- Vite (build tool)
- Redux (state management)
- React Router (routing)
- Material-UI (UI components)
- Axios (HTTP client)

### Backend

- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs (password hashing)
- Nodemailer (email functionality)

## API Endpoints

The backend provides RESTful API endpoints for:

- User authentication
- Course management
- Wishlist operations

## Development Notes

- Each folder (frontend/backend) is independent and has its own `node_modules`
- Frontend uses Vite for fast development and building
- Backend uses nodemon for auto-restart during development
- Frontend proxies API calls to backend during development
# vidhyara
