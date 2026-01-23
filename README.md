# E-Shop SoulCaller - Backend

A simple e-commerce API built with Node.js, Express, and MySQL.

---

## What It Does

This backend provides everything needed for an online store:
- User login & registration
- Product & category management
- Shopping orders
- Stripe payment processing
- Admin features for store management

---

## Tech Stack

- **Node.js** - Server runtime
- **Express** - Web framework
- **MySQL** - Database
- **Sequelize** - Database ORM
- **JWT** - User authentication
- **Bcrypt** - Password encryption
- **Stripe** - Payment processing

---

## Project Structure

```
src/
├── app.js                      # Main app configuration
├── controller/                 # Business logic
│   ├── authController.js       # Login & registration
│   ├── userController.js       # User management
│   ├── productsController.js   # Product operations
│   ├── categoriesController.js # Category operations
│   ├── ordersController.js     # Order operations
│   └── adminController.js      # Admin functions
├── routes/                     # API endpoints
├── middleware/                 # Authentication & error handling
├── models/                     # Database schemas
└── utils/                      # Helper functions
```

---

## Features Roadmap

### 🔴 Critical (Do First)
- [x] **Product Search & Filtering** - Filter by price, rating, category

- [ ] **Better Error Handling** - Improve validation and error messages

### 🟡 High Priority (Next)

- [ ] **Order Tracking** - Better order status updates

### 🟢 Medium Priority (Later)

- [ ] **Cloud** - Cloud database using docker for live deployment

- [ ] **Email Notifications** - Order confirmations, shipping updates

- [ ] **Admin Dashboard Enhancements** - Statistics and analytics

- [ ] **Product Images** - Upload and manage product images

### ⚪ Low Priority (Polish)
- [ ] **Advanced Analytics** - Sales reports, customer insights

- [ ] **Performance Optimization** - Caching, query optimization

- [ ] **Additional Payment Methods** - Alternative to Stripe

---

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```
   DB_NAME=eshop_soulcaller_db
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=root
   DB_DIALECT=mysql
   JWT_SECRET=your_secret_key
   STRIPE_SECRET_KEY=your_stripe_key
   PORT=8080
   CLIENT_URL=http://127.0.0.1:5173
   ```

3. **Create database:**
   ```sql
   CREATE DATABASE eshop_soulcaller_db;
   ```

---

## Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:8080 and http://127.0.0.1:5173"`

---

## Main API Routes

| Feature | Endpoints |
|---------|-----------|
| **Auth** | POST /auth/login, POST /auth/register |
| **Users** | GET /users/:id, PUT /users/:id |
| **Products** | GET /products, POST /products, PUT /products/:id, DELETE /products/:id |
| **Categories** | GET /categories, POST /categories |
| **Orders** | GET /orders, POST /orders, GET /orders/:id |
| **Admin** | GET /admin/dashboard, GET /admin/users |

---

## Database Tables

- **Users** - User accounts with roles (admin/user)
- **Products** - Items for sale
- **Categories** - Product categories
- **Orders** - Customer orders
- **OrderItems** - Items in each order

---

## Security

✅ Passwords hashed with bcrypt  
✅ JWT authentication tokens  
✅ Role-based access (admin/user)  
✅ CORS enabled for frontend  
✅ Secure Stripe integration  

---

## Key Features

- User login with secure JWT tokens
- Product management (admin only)
- Shopping cart & orders
- Payment processing with Stripe
- Admin dashboard
- Automatic database setup

---

**Backend for E-Shop SoulCaller**
