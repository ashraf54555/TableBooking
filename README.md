# FoodExpress - Food Delivery Website

A modern food delivery website built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features
- User authentication (login/register)
- Restaurant listing and search
- Food ordering system
- Rating system
- Responsive design

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the server: `npm start`

## API Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/restaurants - Get all restaurants
- POST /api/orders - Create new order
- GET /api/orders/my-orders - Get user orders

## Contact
- Email: ashrafonly1995@gmail.com
- Phone: (+91) 8700531231
