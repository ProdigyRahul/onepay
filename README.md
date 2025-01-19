# OnePay - Financial Inclusion Solution

Bridging the gap for underserved communities through innovative financial technology.

## Vision
OnePay aims to address financial exclusion by providing accessible, user-friendly financial tools to the 1.7 billion unbanked adults globally. Our solution integrates AI-powered insights, secure payment systems, and personalized financial literacy tools to empower users with the resources they need for economic independence.

## Target Users
- Street vendors and small business owners
- Daily wage workers
- First-time banking users
- Rural entrepreneurs
- Migrant workers

## Core Features

### Smart Onboarding
- Step-by-step guided process
- AI-powered KYC verification
- Personalized user preferences

### Secure Payments
- QR code-based transactions
- Peer-to-peer transfers
- Bill payment integrations

### AI Financial Assistant
- Natural Language Processing for queries
- Automated expense categorization
- Real-time financial advice
- Budget optimization

### Financial Education
- Gamified, interactive tutorials
- Adaptive learning paths
- Achievement system
- Progress tracking

### Budgeting Tools
- Easy budget creation and tracking
- Real-time alerts
- Detailed analytics
- Spending pattern insights

### Additional Features
- Community savings groups
- Emergency fund alerts
- Dynamic goal setting
- Micro-tasks for rewards
- Financial health scoring
- Predictive assistance
- Gamified savings challenges

## Project Structure

```
.
├── mobile/              # React Native Expo frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── screens/    # Screen components
│   │   ├── navigation/ # Navigation configuration
│   │   ├── services/   # API and business logic
│   │   ├── utils/      # Helper functions
│   │   ├── hooks/      # Custom React hooks
│   │   ├── store/      # State management
│   │   └── assets/     # Images, fonts, etc.
│   └── ...
│
└── backend/            # Express.js Node.js backend
    ├── src/
    │   ├── controllers/# Route controllers
    │   ├── models/     # Database models
    │   ├── routes/     # API routes
    │   ├── services/   # Business logic
    │   ├── utils/      # Helper functions
    │   └── middleware/ # Custom middleware
    └── ...
```

## Tech Stack

### Mobile App (Frontend)
- React Native with Expo
- TypeScript
- React Navigation for routing
- Redux Toolkit for state management
- Axios for API calls
- i18next for internationalization
- React Native Paper for UI components
- Jest for testing

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL for structured data
- Redis for caching
- JWT for authentication
- OpenAI integration for AI features
- Jest for testing
- ESLint and Prettier for code quality

### DevOps & Tools
- Git for version control
- GitHub Actions for CI/CD
- Docker for containerization
- AWS for cloud infrastructure
- Sentry for error tracking
- Swagger for API documentation

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL
- Redis
- Mobile device or emulator

### Installation

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

#### Mobile Setup
```bash
cd mobile
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

## Branch Strategy

### Main Branches
- `main` - Production branch, very stable
- `development` - Integration branch for features and fixes

### Development Workflow
1. All feature/bugfix branches should be created from `development` branch
2. Create a new branch with appropriate prefix:
   - `feat/` for new features
   - `fix/` for bug fixes
   - `chore/` for maintenance tasks
   - `style/` for styling changes
   - `refactor/` for code refactoring
3. Submit Pull Request to merge into `development`
4. Add @ProdigyRahul as reviewer
5. After review and approval, code will be merged

⚠️ **Important:**
- Never push directly to `main` or `development` branches
- All changes must go through Pull Request review process

## Git Commit Guidelines

### Commit Message Format
```
<type>: <subject>

[optional body]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Build process or auxiliary tool changes
- `style`: Code style/formatting changes
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `docs`: Documentation changes

### Rules
- Use lowercase in commit messages
- Be descriptive but concise
- Use present tense ("add feature" not "added feature")

Example:
```
feat: add user authentication
fix: resolve login screen crash
chore: update dependencies
style: format user profile component
refactor: optimize database queries
```

## Contributing
1. Create a new branch from `development`
2. Make your changes
3. Follow commit message guidelines
4. Push your branch
5. Create Pull Request
6. Add @ProdigyRahul as reviewer
7. Address review comments if any
8. Merge after approval

## Development Tasks

- Project setup and architecture
- Basic authentication flows
- Core UI components
- Wallet system
- Transaction management
- Payment features
- Budget management
- AI assistant integration
- Learning modules
- Gamification features
- Community features
- Performance optimization
- Testing and documentation

## License
This project is proprietary and confidential.

## Contact
For any queries, please reach out to the project maintainers.
