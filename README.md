# AuraByShenoi Website

A modern, responsive web application that combines an elegant art gallery with streamlined e-commerce functionality.

## Features

- **Gallery**: Browse paintings in a responsive grid layout
- **Shopping Cart**: Add paintings to cart and checkout securely
- **Admin Dashboard**: Manage artwork inventory and orders
- **Payment Processing**: Secure payments via Stripe
- **Email Notifications**: Order confirmations and updates

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS with custom color palette
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose
- JWT authentication
- Stripe for payments
- SendGrid for emails

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for all packages:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your actual configuration values.

4. Start the development servers:
   ```bash
   npm run dev
   ```

This will start:
- Frontend development server on http://localhost:3000
- Backend API server on http://localhost:5000

### Project Structure

```
├── frontend/          # React TypeScript frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express TypeScript backend
│   ├── src/
│   │   ├── config/    # Database and other configurations
│   │   ├── models/    # MongoDB schemas
│   │   ├── routes/    # API endpoints
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Custom middleware
│   │   └── utils/     # Helper functions
│   └── package.json
└── package.json       # Root package for scripts
```

## Development

- Frontend runs on port 3000 with hot reload
- Backend runs on port 5000 with nodemon
- API requests from frontend are proxied to backend

## Color Palette

The design uses a warm, natural color scheme:
- **Sage Green**: #9CAF88 (primary)
- **Brown**: #8B6F47 (secondary)
- **Cream**: #FAF8F5 (background)
- **Warm Gray**: #E8E6E1 (neutral)

## License

This project is licensed under the MIT License.