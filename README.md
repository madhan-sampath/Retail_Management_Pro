# Retail Management System

A comprehensive full-stack retail management system built with **Angular 20** frontend and **Node.js/Express** backend. This system provides complete retail operations management including inventory, orders, customers, products, and reporting capabilities.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Usage](#-usage)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Core Modules
- **Dashboard** - Real-time overview of key metrics and recent activities
- **Products Management** - Complete CRUD operations for product catalog
- **Orders Management** - Order processing, tracking, and status management
- **Customers Management** - Customer database and relationship management
- **Inventory Management** - Stock tracking, alerts, and warehouse management
- **Reports & Analytics** - Comprehensive reporting and business intelligence
- **User Management** - Role-based access control and user administration
- **Audit Logging** - Complete activity tracking and audit trail

### Key Features
- ✅ **JWT Authentication** - Secure user authentication and authorization
- ✅ **Role-based Access Control** - Admin, Manager, and User roles
- ✅ **Real-time Dashboard** - Live statistics and key performance indicators
- ✅ **Advanced Search & Filtering** - Powerful search across all modules
- ✅ **Responsive Design** - Mobile-first, fully responsive interface
- ✅ **Inventory Alerts** - Low stock and out-of-stock notifications
- ✅ **Order Processing** - Complete order lifecycle management
- ✅ **Customer Analytics** - Customer behavior and spending analysis
- ✅ **Sales Reporting** - Comprehensive sales and revenue reports
- ✅ **Data Export** - Export functionality for all major data types
- ✅ **Audit Trail** - Complete activity logging and tracking

## 🏗️ Architecture

### Backend Architecture
- **Framework**: Express.js with MVC pattern
- **Database**: JSON file-based storage (localStorage simulation)
- **Authentication**: JWT-based with bcrypt password hashing
- **API Design**: RESTful API with comprehensive error handling
- **Security**: CORS, rate limiting, input validation, and sanitization

### Frontend Architecture
- **Framework**: Angular 20 with standalone components
- **UI Library**: Bootstrap 5 with custom styling
- **Icons**: FontAwesome 7.0.1
- **State Management**: RxJS observables and services
- **Routing**: Angular Router with lazy loading

### Data Flow
```
Frontend (Angular) ↔ API Service ↔ Backend (Express) ↔ LocalModel ↔ JSON Files
```

## 🛠️ Technology Stack

### Backend
- **Node.js** (v18+)
- **Express.js** (v4.21.2)
- **JWT** (v9.0.2) - Authentication
- **bcryptjs** (v2.4.3) - Password hashing
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Helmet** (v7.1.0) - Security headers
- **Express Rate Limit** (v7.4.1) - Rate limiting
- **Express Validator** (v7.2.0) - Input validation
- **UUID** (v10.0.0) - Unique identifier generation

### Frontend
- **Angular** (v20.3.0)
- **TypeScript** (v5.9.2)
- **Bootstrap** (v5.3.8) - UI framework
- **FontAwesome** (v7.0.1) - Icons
- **RxJS** (v7.8.0) - Reactive programming
- **Angular Router** - Navigation and routing
- **Angular HttpClient** - HTTP client for API communication

### Development Tools
- **Nodemon** (v3.1.7) - Backend development
- **Angular CLI** (v20.3.0) - Frontend development
- **Concurrently** (v8.2.2) - Run both servers simultaneously
- **Jest** (v29.7.0) - Testing framework

## 📁 Project Structure

```
retail-management-system/
├── backend/                           # Node.js Backend
│   ├── data/                         # JSON data files
│   │   ├── Users.json               # User data
│   │   ├── Products.json            # Product catalog
│   │   ├── Orders.json              # Order records
│   │   ├── OrderItems.json          # Order line items
│   │   ├── Customers.json           # Customer database
│   │   ├── Categories.json          # Product categories
│   │   ├── Suppliers.json           # Supplier information
│   │   ├── Inventory.json           # Inventory records
│   │   ├── Payments.json            # Payment records
│   │   ├── Reports.json             # Report definitions
│   │   └── AuditLogs.json           # Audit trail
│   ├── src/
│   │   ├── controllers/             # API controllers
│   │   │   ├── authController.js    # Authentication
│   │   │   ├── productController.js # Product management
│   │   │   ├── orderController.js   # Order processing
│   │   │   ├── customerController.js # Customer management
│   │   │   ├── inventoryController.js # Inventory management
│   │   │   ├── reportController.js  # Reporting
│   │   │   ├── userController.js    # User management
│   │   │   ├── categoryController.js # Category management
│   │   │   ├── supplierController.js # Supplier management
│   │   │   ├── paymentController.js # Payment processing
│   │   │   └── auditLogController.js # Audit logging
│   │   ├── models/                  # Data models
│   │   │   ├── User.js              # User model
│   │   │   ├── Product.js           # Product model
│   │   │   ├── Order.js             # Order model
│   │   │   ├── Customer.js          # Customer model
│   │   │   ├── Category.js          # Category model
│   │   │   ├── Supplier.js          # Supplier model
│   │   │   ├── Inventory.js         # Inventory model
│   │   │   ├── OrderItem.js         # Order item model
│   │   │   ├── Payment.js           # Payment model
│   │   │   ├── Report.js            # Report model
│   │   │   └── AuditLog.js          # Audit log model
│   │   ├── routes/                  # API routes
│   │   │   ├── authRoutes.js        # Authentication routes
│   │   │   ├── productRoutes.js     # Product routes
│   │   │   ├── orderRoutes.js       # Order routes
│   │   │   ├── customerRoutes.js    # Customer routes
│   │   │   ├── inventoryRoutes.js   # Inventory routes
│   │   │   ├── reportRoutes.js      # Report routes
│   │   │   ├── userRoutes.js        # User routes
│   │   │   ├── categoryRoutes.js    # Category routes
│   │   │   ├── supplierRoutes.js    # Supplier routes
│   │   │   ├── paymentRoutes.js     # Payment routes
│   │   │   └── auditLogRoutes.js    # Audit log routes
│   │   ├── middleware/              # Middleware functions
│   │   │   └── auth.js              # Authentication middleware
│   │   └── utils/                   # Utility functions
│   │       └── LocalModel.js        # Custom ORM-like class
│   ├── server.js                    # Main server file
│   └── package.json                 # Backend dependencies
├── frontend-new/                     # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/          # Angular components
│   │   │   │   ├── dashboard/       # Dashboard module
│   │   │   │   │   └── dashboard.component.ts
│   │   │   │   ├── products/        # Products module
│   │   │   │   │   └── products.component.ts
│   │   │   │   ├── orders/          # Orders module
│   │   │   │   │   └── orders.component.ts
│   │   │   │   ├── customers/       # Customers module
│   │   │   │   │   └── customers.component.ts
│   │   │   │   ├── reports/         # Reports module
│   │   │   │   │   └── reports.component.ts
│   │   │   │   └── shared/          # Shared components
│   │   │   │       ├── navbar/      # Navigation bar
│   │   │   │       │   └── navbar.component.ts
│   │   │   │       └── sidebar/     # Sidebar navigation
│   │   │   │           └── sidebar.component.ts
│   │   │   ├── services/            # Angular services
│   │   │   │   └── api.service.ts   # API service
│   │   │   ├── environments/        # Environment configuration
│   │   │   │   ├── environment.ts   # Development environment
│   │   │   │   └── environment.prod.ts # Production environment
│   │   │   ├── app.component.ts     # Main app component
│   │   │   └── app.routes.ts        # Application routes
│   │   ├── main.ts                  # Application entry point
│   │   ├── index.html               # Main HTML file
│   │   └── styles.scss              # Global styles
│   ├── angular.json                 # Angular configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── package.json                 # Frontend dependencies
├── package.json                      # Root package.json
└── README.md                         # This file
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Angular CLI** (v20+)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retail-management-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start both backend and frontend**
   ```bash
   npm run start:all
   ```

4. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

### Individual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run dev  # Starts on port 5000
```

#### Frontend Setup
```bash
cd frontend-new
npm install
npm start    # Starts on port 4200
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:4200
API_PREFIX=/api
```

### Frontend Environment
Update `frontend-new/src/app/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  appName: 'Retail Management System',
  version: '1.0.0'
};
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change password

### Product Endpoints
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/search` - Search products
- `GET /products/low-stock` - Get low stock products
- `GET /products/top-selling` - Get top selling products

### Order Endpoints
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `PUT /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Delete order
- `GET /orders/stats` - Get order statistics
- `GET /orders/search` - Search orders

### Customer Endpoints
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer
- `PUT /customers/:id/status` - Update customer status
- `DELETE /customers/:id` - Delete customer
- `GET /customers/stats` - Get customer statistics
- `GET /customers/top` - Get top customers
- `GET /customers/search` - Search customers

### Report Endpoints
- `GET /reports/dashboard` - Get dashboard statistics
- `GET /reports/sales` - Get sales report
- `GET /reports/inventory` - Get inventory report
- `GET /reports/customers` - Get customer report
- `GET /reports/products` - Get product report
- `GET /reports/revenue` - Get revenue report

## 💻 Usage

### Default Login Credentials
- **Admin**: admin@retail.com / password
- **Manager**: manager@retail.com / password
- **User**: user@retail.com / password

### Key Features Usage

#### Dashboard
- View real-time statistics
- Monitor recent orders
- Check inventory alerts
- Access quick actions

#### Product Management
- Add/edit/delete products
- Manage product categories
- Track inventory levels
- Set up low stock alerts

#### Order Processing
- Create new orders
- Track order status
- Process payments
- Manage order fulfillment

#### Customer Management
- Maintain customer database
- Track customer orders
- Analyze customer behavior
- Manage customer relationships

#### Reporting
- Generate sales reports
- Analyze inventory status
- Track customer metrics
- Export data for analysis

## 🖼️ Screenshots

### Dashboard
- Real-time statistics cards
- Recent orders table
- Top products list
- Quick action buttons

### Products Management
- Product catalog with search/filter
- Add/edit product forms
- Inventory level indicators
- Category management

### Orders Management
- Order list with status tracking
- Order creation workflow
- Payment processing
- Order status updates

### Customer Management
- Customer database
- Customer analytics
- Order history tracking
- Contact management

### Reports & Analytics
- Sales performance reports
- Inventory analysis
- Customer insights
- Revenue tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v1.0.0** - Initial release
  - Complete retail management system
  - Angular 20 frontend
  - Node.js/Express backend
  - Full CRUD operations
  - Comprehensive reporting
  - Role-based authentication

---

**Built with ❤️ using Angular 20 and Node.js**
