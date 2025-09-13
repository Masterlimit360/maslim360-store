# MasLim360 Store

A full-featured, production-ready e-commerce web application built with modern technologies.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maslim360-store
   ```

2. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Start development servers**
   ```bash
   pnpm dev
   ```

### Alternative: Docker Setup

```bash
# Start all services with Docker
docker-compose -f infra/docker-compose.yml up

# Or start only database services
docker-compose -f infra/docker-compose.yml up postgres redis
```

## 📁 Project Structure

```
maslim360-store/
├── apps/
│   ├── backend/          # NestJS API server
│   └── frontend/         # Next.js web application
├── packages/
│   ├── ui/              # Shared UI components
│   └── db/              # Database schemas and types
├── infra/               # Docker and deployment configs
├── scripts/             # Utility scripts
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + OAuth (Google, Facebook)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker
- **Database**: PostgreSQL
- **Cache**: Redis
- **Development**: Docker Compose

## 🔧 Development

### Backend Commands

```bash
cd apps/backend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run database migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# Open Prisma Studio
pnpm prisma studio

# Run tests
pnpm test
```

### Frontend Commands

```bash
cd apps/frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/featured` - Get featured products

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/tree` - Get category tree
- `GET /api/categories/:id` - Get category by ID

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item

### Users
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/me/orders` - Get user orders
- `GET /api/users/me/addresses` - Get user addresses

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - User accounts and profiles
- **Products** - Product catalog with variants and images
- **Categories** - Hierarchical product categories
- **Orders** - Order management and tracking
- **Cart** - Shopping cart functionality
- **Reviews** - Product reviews and ratings
- **Payments** - Payment processing and tracking

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/maslim360
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_algolia_search_key
```

## 🚀 Deployment

### Production Build

```bash
# Build all applications
pnpm build

# Start production servers
pnpm start
```

### Docker Deployment

```bash
# Build and start all services
docker-compose -f infra/docker-compose.yml up --build

# Run in background
docker-compose -f infra/docker-compose.yml up -d
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run backend tests
pnpm --filter backend test

# Run frontend tests
pnpm --filter frontend test

# Run with coverage
pnpm test:cov
```

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:4000/api/docs
- **API Schema**: http://localhost:4000/api/docs-json

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:

1. Check the [documentation](docs/)
2. Search existing [issues](issues/)
3. Create a new [issue](issues/new)
4. Contact the team at support@maslim360.com

---

**Happy Coding! 🎉**
