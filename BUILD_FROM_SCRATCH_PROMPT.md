# Single Prompt to Build Retail Management System from Scratch

Use this comprehensive prompt with any AI coding assistant to build the entire retail management system from scratch:

---

**"Create a complete retail management system with the following specifications:**

**Backend (Node.js/Express):**
- Set up Express server with CORS, JWT authentication, and JSON file-based storage
- Create MVC architecture with controllers, models, routes, and middleware
- Implement 12 core modules: Users, Roles, Products, Categories, Orders, OrderItems, Inventory, Customers, Suppliers, Payments, Reports, and AuditLogs
- Use a custom LocalModel class that simulates Sequelize ORM with JSON file storage
- Include comprehensive CRUD operations for all entities
- Add authentication middleware with JWT tokens
- Implement role-based access control (admin, manager, user)
- Create audit logging system for all operations
- Add advanced features like product search, low stock alerts, top-selling products, and price range filtering
- Set up proper error handling and validation
- Include health check endpoint and API documentation

**Frontend (Angular 20):**
- Create Angular 20 application with standalone components
- Implement responsive design using Bootstrap 5 and FontAwesome icons
- Build 5 main components: Dashboard, Products, Orders, Customers, Reports
- Create shared components: Navbar with authentication, Sidebar with navigation
- Set up Angular routing with proper navigation
- Implement API service with HttpClient for all backend communication
- Add JWT token handling and authentication state management
- Create modern, professional UI with cards, tables, forms, and charts
- Include responsive design for mobile and desktop
- Add proper error handling and loading states

**Key Features:**
- Complete CRUD operations for all entities
- Real-time dashboard with statistics and charts
- Product catalog with categories and inventory management
- Order processing workflow with order items
- Customer management system
- Sales reporting and analytics
- User authentication and role management
- Audit trail for all operations
- Low stock alerts and inventory tracking
- Search and filtering capabilities
- Responsive design for all devices

**Technical Requirements:**
- Backend: Node.js, Express, JWT, bcrypt, CORS
- Frontend: Angular 20, TypeScript, Bootstrap 5, FontAwesome
- Data Storage: JSON files (simulating database)
- Authentication: JWT-based with role management
- Architecture: MVC pattern with proper separation of concerns
- Code Quality: Proper error handling, validation, and documentation

**Project Structure:**
- Root package.json with workspace configuration
- Backend with src/ directory containing controllers, models, routes, middleware, utils
- Frontend with Angular components, services, and routing
- Data directory with JSON files for all entities
- Environment configuration for both frontend and backend
- Comprehensive README with setup instructions

**Additional Requirements:**
- Include sample data for all entities
- Add proper TypeScript interfaces and types
- Implement proper error handling and user feedback
- Create professional, modern UI design
- Add comprehensive documentation and comments
- Include package.json files with all necessary dependencies
- Set up development scripts for easy startup
- Add proper CORS configuration for development and production

**Sample Data Requirements:**
- 3 users (admin, manager, user) with different roles
- 10+ products across different categories
- 10+ customers with complete information
- 10+ orders with order items
- Inventory records for all products
- Payment records for orders
- Audit logs for system activities
- Categories and suppliers data

**UI/UX Requirements:**
- Modern, professional design with gradients and shadows
- Responsive layout that works on all devices
- Intuitive navigation with sidebar and navbar
- Loading states and error handling
- Search and filtering functionality
- Data tables with sorting and pagination
- Modal dialogs for forms
- Status badges and indicators
- Charts and statistics visualization

**Security Requirements:**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Security headers

The system should be production-ready with proper error handling, validation, security, and a professional user interface. Include all necessary files, dependencies, and configuration to run the complete system with a single command."**

---

This prompt contains all the technical specifications, architecture details, and requirements needed to recreate the entire retail management system from scratch. It's comprehensive enough to generate the complete system with all features, proper structure, and professional implementation.
