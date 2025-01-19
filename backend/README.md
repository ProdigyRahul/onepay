# OnePay Backend

A TypeScript-based Express backend with Prisma ORM.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
# Copy the example env file
cp .env.example .env

# Update the .env file with your configurations:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (your secret key)
# - Other configurations as needed
```

3. **Database Setup**
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to manage data
npx prisma studio
```

4. **Run the Application**

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production/test) | development |
| PORT | Server port | 5000 |
| DATABASE_URL | PostgreSQL connection URL | - |
| JWT_SECRET | JWT signing key | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| CORS_ORIGIN | Allowed CORS origin | * |
| API_PREFIX | API route prefix | /api |

## API Endpoints

### Health Check
- GET `/health` - Check API status

### User Routes
- POST `/api/users` - Create user
- GET `/api/users` - Get all users

## Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Custom middleware
│   ├── routes/        # API routes
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── app.ts         # Express app setup
│   └── server.ts      # Server initialization
├── prisma/
│   └── schema.prisma  # Database schema
├── .env              # Environment variables
├── .env.example      # Example environment file
└── tsconfig.json     # TypeScript configuration
```

## Contributing

1. Create a feature branch
2. Commit changes
3. Push your branch
4. Create a Pull Request

## License

MIT 