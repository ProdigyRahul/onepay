# OnePay Backend Knowledge Base

## Project Overview
OnePay is a comprehensive financial inclusion solution targeting underbanked communities. The backend is built with Node.js/Express using TypeScript, following clean architecture principles.

## Current Implementation Status

### Completed Features
1. Authentication System
   - Phone OTP verification
   - Session management
   - Rate limiting
   - Phone number validation
   - Error handling

2. User Management & KYC
   - Profile management
   - Document upload and verification
   - Status tracking
   - Admin verification system
   - Field validation

3. Wallet System
   - Balance management
   - Transaction history
   - Fund transfers
   - Multiple currency support
   - Transaction categories

4. Budget Management
   - Budget creation/tracking
   - Expense analytics
   - Category-wise tracking
   - Time period settings

### Pending Features
1. Learning Module
   - Course content management
   - Progress tracking
   - Achievement system

2. Gamification System
   - Points/tokens system
   - Levels and badges
   - Rewards tracking

3. AI/ML Features
   - Financial advisor
   - Fraud detection
   - Smart recommendations

## Architecture & Design Principles

### Code Organization
```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Custom middleware
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── utils/         # Helper functions
│   └── types/         # TypeScript types
├── tests/             # Unit & integration tests
└── prisma/           # Database schema & migrations
```

### Naming Conventions
- Controllers: `name.controller.ts` (e.g., `user.controller.ts`)
- Services: camelCase with 'Service' suffix (e.g., `auth.service.ts`)
- Models: camelCase singular (e.g., `user.model.ts`)
- Routes: camelCase (e.g., `user.routes.ts`)

### Best Practices
1. Clean Architecture
   - Clear separation of concerns
   - Dependency injection for better testability
   - Service layer for business logic
   - Controller layer for request handling

2. API Design
   - RESTful principles
   - Proper error handling
   - Input validation
   - Rate limiting
   - Authentication middleware

3. Security
   - OTP-based authentication
   - Session management
   - Data encryption
   - Input sanitization
   - Rate limiting

4. Database
   - Using Prisma ORM
   - Clear schema design
   - Proper indexing
   - Transaction support

5. Testing
   - Unit tests
   - Integration tests
   - Test coverage tracking

## Development Guidelines
1. Always follow TypeScript best practices
2. Write comprehensive tests for new features
3. Use proper error handling and logging
4. Document new APIs and changes
5. Follow existing naming conventions
6. Never commit sensitive data
7. Use environment variables for configuration

## Environment Setup
- Node.js environment
- PostgreSQL database
- Redis for caching
- Environment variables in `.env`
- Test environment in `.env.test`

## Prisma Database Management

### Common Prisma Commands

1. Generate Prisma Client
```bash
npx prisma generate
```

2. Create and Apply Migrations
```bash
# Create a new migration
npx prisma migrate dev --name add_wallet_features

# Apply migrations to production
npx prisma migrate deploy
```

3. Reset Database (Development Only)
```bash
npx prisma migrate reset
```

4. View Database in Prisma Studio
```bash
npx prisma studio
```

### Migration Steps for Wallet System

1. Create migration for new wallet features:
```bash
npx prisma migrate dev --name add_wallet_features
```

This will:
- Add account number to wallets
- Add UPI ID support
- Create bank account model
- Update transaction model
- Create necessary indexes

2. If migration fails:
```bash
# Reset the database (WARNING: This will delete all data)
npx prisma migrate reset

# Then create a fresh migration
npx prisma migrate dev --name add_wallet_features
```

3. After migration, update the Prisma Client:
```bash
npx prisma generate
```

### Database Maintenance

1. Regular Backups
```bash
# Using pg_dump (PostgreSQL)
pg_dump -U username -d database_name > backup.sql
```

2. Database Optimization
```sql
-- Analyze tables
ANALYZE wallets;
ANALYZE transactions;
ANALYZE bank_accounts;

-- Update statistics
VACUUM ANALYZE;
```

## API Documentation

### Wallet API

#### Endpoints
1. `POST /api/wallet`
   - Create a new wallet
   - Requires PIN and optional limits
   - Returns wallet details

2. `GET /api/wallet/balance`
   - Quick balance check
   - Returns basic wallet info and user name
   - Perfect for balance widgets and mini-views
   - Response includes:
     ```typescript
     {
       id: string;
       balance: number;
       currency: string;
       dailyLimit: number;
       monthlyLimit: number;
       isActive: boolean;
       isBlocked: boolean;
       blockedUntil?: Date;
       firstName: string;
       lastName: string;
     }
     ```

3. `GET /api/wallet/stats`
   - Get wallet statistics
   - Returns monthly income/expenses
   - Recent transactions
   - Full user profile
   - QR code for receiving money

4. `POST /api/wallet/transfer`
   - Transfer money between wallets
   - Requires PIN verification
   - Validates balance and limits

### Security Measures

#### PIN Security
1. **Storage**
   - PINs are hashed using bcrypt
   - Failed attempts are tracked
   - Temporary blocking after multiple failures

2. **QR Code Security**
   - QR codes are regenerated on each request
   - Data is base64 encoded
   - Only essential information is included
   - QR codes are tied to specific wallets

## Wallet System Implementation

### Core Features
1. Digital Wallet
   - Unique account number for each wallet
   - UPI ID support (format: user@onepay)
   - PIN-based security with attempt limits
   - Daily and monthly transaction limits
   - Multi-currency support (default: INR)
   - Real-time balance tracking

2. Transaction System
   - 12-character unique transaction ID
   - UPI transaction reference tracking
   - Multiple transaction types
   - Bank transfer support
   - Real-time status updates
   - Transaction history with metadata

### Database Schema

```prisma
model Wallet {
  id                String        @id @default(uuid())
  userId            String        @unique
  accountNumber     String        @unique @default(uuid())
  upiId            String?       @unique
  balance          Float         @default(0)
  pin              String        // Hashed using bcrypt
  pinAttempts      Int          @default(0)
  isBlocked        Boolean       @default(false)
  blockedUntil     DateTime?
  dailyLimit       Float         @default(10000)
  monthlyLimit     Float         @default(100000)
  currency         String        @default("INR")
  type             String        @default("SAVINGS")
  isActive         Boolean       @default(true)
  // Relations
  user             User          @relation(fields: [userId], references: [id])
  transactions     Transaction[]
}

model Transaction {
  id               String        @id @default(uuid())
  transactionId    String       @unique  // Generated 12-char unique ID
  type             TransactionType
  amount           Float
  description      String?
  status           TransactionStatus @default(PENDING)
  metadata         Json?
  // Relations
  walletId         String
  senderWalletId   String?
  receiverWalletId String?
  wallet           Wallet        @relation(fields: [walletId], references: [id])
  senderWallet     Wallet?       @relation("SenderWallet")
  receiverWallet   Wallet?       @relation("ReceiverWallet")
}
```

### Type System Updates

### Wallet Types
```typescript
enum WalletType {
  SAVINGS = 'SAVINGS',   // Default personal wallet
  CURRENT = 'CURRENT',   // Business transactions
  BUSINESS = 'BUSINESS'  // Enterprise accounts
}

interface WalletStats {
  id: string;
  balance: number;
  currency: string;
  type: WalletType;
  isActive: boolean;
  blockedUntil?: Date;
  dailyLimit: number;
  monthlyLimit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: RecentTransaction[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    kycStatus: KYCStatus;
  };
  qrCodeData: string;
}
```

### Transaction Types
```typescript
interface TransactionDTO {
  amount: number;
  type: TransactionType;
  description?: string;
  metadata?: Record<string, any>;
}

interface TransferDTO extends TransactionDTO {
  toWalletId: string;
  pin: string;
}
```

## Recent Changes

### 2025-01-30: Added Quick Balance Endpoint & Type Fixes

#### New Balance Endpoint
Added a lightweight endpoint for quick balance checks:
- Path: `GET /api/wallet/balance`
- Returns basic wallet info and user details
- Optimized for frequent balance checks
- No rate limiting for better UX

Response Format:
```typescript
{
  success: true,
  data: {
    id: string;
    balance: number;
    currency: string;
    dailyLimit: number;
    monthlyLimit: number;
    isActive: boolean;
    isBlocked: boolean;
    blockedUntil?: Date;
    firstName: string;
    lastName: string;
  }
}
```

#### Type Safety Improvements
- Fixed nullable date handling in wallet responses
- Improved type definitions for wallet status fields
- Added proper null checks for optional fields
- Enhanced TypeScript type safety for API responses

### 2025-01-30: Simplified Wallet System

#### Removed Bank Account Integration
- Removed BankAccount model and BankAccountType enum from schema
- Removed bank account related endpoints from wallet routes
- Removed bank account related methods from wallet controller
- Removed bank account related types and interfaces
- Simplified the codebase to focus on core wallet functionality

#### Core Wallet Features
The wallet system now focuses on essential functionality:
1. **Wallet Creation**
   - Secure PIN-based authentication
   - Configurable daily and monthly limits
   - Multiple currency support

2. **Wallet Operations**
   - Get wallet details and balance
   - View transaction history
   - Track monthly income and expenses
   - Generate QR codes for easy transfers

3. **Money Transfers**
   - Direct wallet-to-wallet transfers
   - PIN verification for security
   - Real-time balance updates
   - Atomic transactions with rollback support

4. **Security Features**
   - PIN-based authentication
   - Transaction limits enforcement
   - Account blocking on suspicious activity
   - QR code regeneration for each request

## Profile and QR Code API

### Profile Endpoints

#### GET /api/profile
Get user profile with wallet info and QR code

```typescript
Response:
{
  success: true,
  data: {
    id: string;
    balance: number;
    currency: string;
    type: WalletType;
    isActive: boolean;
    blockedUntil?: Date;
    dailyLimit: number;
    monthlyLimit: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    recentTransactions: Array<{
      id: string;
      type: TransactionType;
      amount: number;
      status: TransactionStatus;
      createdAt: Date;
    }>;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      kycStatus: KYCStatus;
    };
    qrCodeData: string; // Base64 encoded QR code data
  }
}
```

#### PATCH /api/profile
Update user profile (email only)

```typescript
Request:
{
  email: string;
}

Response:
{
  success: true,
  data: {
    email: string;
  }
}
```

### QR Code Implementation

The QR code system is implemented in the backend for several reasons:
1. Security: Control over what data is exposed
2. Consistency: Ensure all clients generate the same format
3. Simplicity: Reduce client-side dependencies
4. Maintainability: Easy to update QR format across all clients

#### QR Code Data Format
```typescript
{
  walletId: string;
  userId: string;
  name: string;
  type: 'ONEPAY_WALLET';
}
```

#### QR Code Usage in Frontend
```typescript
// React Native example
import QRCode from 'react-native-qrcode-svg';

const ProfileQRCode = () => {
  const { data } = useProfile();
  
  return (
    <QRCode
      value={data.qrCodeData}
      size={200}
      level="H" // High error correction
    />
  );
};
```

### Best Practices

1. **Profile Updates**
   - Email updates require uniqueness validation
   - Other profile fields are read-only or managed through specific endpoints
   - KYC status is managed through the KYC process

2. **QR Code Security**
   - QR codes are regenerated on each request
   - Data is base64 encoded
   - Only essential information is included
   - QR codes are tied to specific wallets

3. **Rate Limiting**
   - Profile endpoints use general rate limiting
   - QR code generation is included in rate limits
   - Prevents abuse and DoS attacks

4. **Error Handling**
   - Proper validation of email format
   - Clear error messages for invalid data
   - Appropriate HTTP status codes

### Wallet API Security Best Practices

### Authentication & Authorization
1. All wallet routes require authentication via JWT token
2. Wallet operations are restricted to the wallet owner
3. PIN verification for sensitive operations (transfers, limit updates)

### Input Validation
```typescript
// Amount validation
amount: z.number()
  .min(1, 'Amount must be at least 1')
  .max(1000000, 'Amount must not exceed 1000000')

// Currency validation
currency: z.enum(['INR', 'USD'])

// Wallet type validation
type: z.enum(['SAVINGS', 'CURRENT', 'BUSINESS'])

// Payment method validation
paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING'])
```

### Rate Limiting
```typescript
// Implement rate limiting for sensitive operations
app.use('/api/wallets/:walletId/transfer', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
}));
```

### Transaction Security
1. All transactions are atomic using Prisma transactions
2. Proper error handling and rollback
3. Transaction limits (daily/monthly) enforcement
4. Transaction logging for audit trails

### API Endpoints

#### POST /api/wallets
Create a new wallet
```typescript
Request:
{
  "type": "SAVINGS" | "CURRENT" | "BUSINESS",
  "currency": "INR" | "USD",
  "pin": "string" // 4-6 digits
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "balance": number,
    "currency": string,
    "dailyLimit": number,
    "monthlyLimit": number,
    "isActive": boolean
  }
}
```

#### POST /api/wallets/:walletId/transfer
Transfer money between wallets
```typescript
Request:
{
  "amount": number,
  "toWalletId": "uuid",
  "description": string,
  "pin": "string"
}

Response:
{
  "success": true,
  "message": "Transfer completed successfully"
}
```

### Security Checklist
1. **Authentication**
   - JWT token validation
   - Token expiration handling
   - Refresh token mechanism

2. **Authorization**
   - Wallet ownership verification
   - PIN verification for sensitive operations
   - Role-based access control

3. **Input Validation**
   - Amount limits
   - Currency validation
   - Payment method validation
   - Description length limits

4. **Rate Limiting**
   - API endpoint rate limits
   - Failed attempt tracking
   - IP-based blocking

5. **Transaction Security**
   - Atomic transactions
   - Balance verification
   - Limit enforcement
   - Audit logging

6. **Error Handling**
   - Proper error codes
   - Informative messages
   - Security error masking
   - Transaction rollback

7. **Data Protection**
   - PIN hashing
   - Sensitive data masking
   - No sensitive data in logs

### Best Practices
1. **PIN Management**
   - Store hashed PINs only
   - Implement PIN attempt limits
   - Temporary blocking after failed attempts

2. **Transaction Processing**
   - Verify sufficient balance
   - Check transaction limits
   - Validate receiver wallet
   - Generate unique transaction IDs
   - Maintain detailed transaction logs

3. **Error Handling**
   - Use appropriate HTTP status codes
   - Provide clear error messages
   - Log detailed errors internally
   - Return sanitized errors to clients

4. **Performance**
   - Index frequently queried fields
   - Optimize database queries
   - Implement caching where appropriate
   - Use proper database transactions

### Security Measures

1. PIN Protection
   - Encrypted PIN storage
   - Maximum attempt limits
   - Temporary blocking on multiple failures
   - PIN reset functionality

2. Transaction Security
   - OTP verification for large transactions
   - Daily and monthly limits
   - Fraud detection system
   - Real-time monitoring

3. Bank Account Security
   - Two-factor verification for linking
   - Penny-drop verification
   - IFSC code validation
   - Primary account protection

## Authentication System

### OTP Management

#### OTP Lifecycle
1. **Creation**
   - Generated when user requests verification
   - 6-digit numeric code
   - Stored with expiration time (10 minutes)
   - Associated with user's phone number

2. **Verification**
   - User submits OTP code
   - System checks validity and expiration
   - On successful verification:
     - OTP marked as used and deleted
     - User marked as verified
     - JWT token generated

3. **Cleanup**
   - Automatic deletion after successful verification
   - Scheduled cleanup of expired OTPs (10-minute window)
   - Background job removes unused and expired OTPs

#### Security Measures
- Rate limiting on OTP generation
- Maximum retry attempts
- Expiration time enforcement
- Automatic cleanup of used/expired codes

## KYC System

### Admin KYC Management

#### API Endpoints

1. **Get Pending KYC Applications**
   ```
   GET /api/admin/kyc/pending
   ```
   Returns list of pending KYC applications with user details

2. **Approve KYC Application**
   ```
   POST /api/admin/kyc/:kycId/approve
   ```
   Marks KYC as approved and updates user verification status

3. **Reject KYC Application**
   ```
   POST /api/admin/kyc/:kycId/reject
   ```
   Marks KYC as rejected with mandatory remarks

#### Response Types
```typescript
interface KYCApplication {
  id: string;
  userId: string;
  panNumber: string;
  dateOfBirth: Date;
  panCardPath: string;
  status: KYCStatus;
  remarks?: string;
  verifiedAt?: Date;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }
}

enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
```

#### Admin Actions
1. **Review Application**
   - View submitted documents
   - Verify PAN card details
   - Check user information
   - Review previous applications

2. **Approve Application**
   - Update KYC status to APPROVED
   - Set verification timestamp
   - Optional remarks
   - Trigger user notification

3. **Reject Application**
   - Update KYC status to REJECTED
   - Mandatory rejection remarks
   - Trigger user notification
   - Allow resubmission after fixes

## Authentication System

### Admin Authentication

#### Admin Login
```http
POST /api/auth/admin/login
```

Request body:
```json
{
  "phoneNumber": "9999999999",
  "password": "Admin@123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "phoneNumber": "9999999999",
      "email": "admin@onepay.dev",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isVerified": true
    }
  }
}
```

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

#### Security Measures
- Password is hashed using bcrypt
- Failed login attempts are logged
- Only active admin accounts can login
- JWT token expires in 24 hours
- Role-based access control (RBAC)

## Future Enhancements

### Planned Features
1. Learning Module Integration
   - Financial literacy courses
   - Progress tracking
   - Achievement rewards

2. Gamification System
   - Points for transactions
   - Badges for milestones
   - Rewards tracking

3. AI/ML Features
   - Smart spending analysis
   - Fraud detection
   - Personalized recommendations

## Wallet Types and Transactions

### Wallet Types
The system supports three types of wallets:
```typescript
enum WalletType {
  SAVINGS = 'SAVINGS',   // Default personal wallet
  CURRENT = 'CURRENT',   // Business transactions
  BUSINESS = 'BUSINESS'  // Enterprise accounts
}

interface WalletStats {
  id: string;
  balance: number;
  currency: string;
  type: WalletType;
  isActive: boolean;
  blockedUntil?: Date;
  dailyLimit: number;
  monthlyLimit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: RecentTransaction[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    kycStatus: KYCStatus;
  };
  qrCodeData: string;
}
```

### Transaction System

#### Transaction IDs
- Format: 12-character alphanumeric (e.g., "AB12CD34EF56")
- Generated using nanoid for uniqueness
- Case-sensitive and collision-resistant

#### Account Numbers
- Format: 16-digit numeric (e.g., "1234567890123456")
- Generated using nanoid with numeric-only charset
- Unique across the system

#### Transfer Process
1. **Validation**
   - Verify sender's wallet exists and is active
   - Check PIN validity
   - Validate sufficient balance
   - Check daily/monthly limits

2. **Transaction Flow**
   ```typescript
   interface TransferDTO {
     toWalletId: string;    // Recipient's wallet ID
     amount: number;        // Transfer amount
     description?: string;  // Optional description
     pin: string;          // Sender's PIN for verification
   }
   ```

3. **Security Measures**
   - PIN verification before each transfer
   - Rate limiting on transfer attempts
   - Transaction logging
   - Automatic blocking after multiple failed attempts

4. **Error Handling**
   - Insufficient balance
   - Invalid PIN
   - Daily/monthly limit exceeded
   - Blocked wallet
   - Invalid recipient

### Best Practices

1. **PIN Management**
   - Store hashed PINs only (using bcrypt)
   - Implement PIN attempt limits
   - Temporary blocking after failed attempts

2. **Transaction Security**
   - Use unique transaction IDs
   - Implement proper rollback mechanisms
   - Log all transaction attempts
   - Rate limit transfer requests

3. **Data Validation**
   - Validate all input data
   - Check balance before transfers
   - Verify wallet status
   - Validate transfer limits

4. **Performance**
   - Index frequently queried fields
   - Optimize transaction queries
   - Cache wallet statistics
   - Use proper database transactions

### Database Schema Updates

### Wallet Schema
```prisma
model Wallet {
  id                String        @id @default(uuid())
  userId            String        @unique
  accountNumber     String        @unique @default(uuid())
  upiId            String?       @unique
  balance          Float         @default(0)
  pin              String        // Hashed using bcrypt
  pinAttempts      Int          @default(0)
  isBlocked        Boolean       @default(false)
  blockedUntil     DateTime?
  dailyLimit       Float         @default(10000)
  monthlyLimit     Float         @default(100000)
  currency         String        @default("INR")
  type             String        @default("SAVINGS")
  isActive         Boolean       @default(true)
  // Relations
  user             User          @relation(fields: [userId], references: [id])
  transactions     Transaction[]
}
```

### Transaction Schema
```prisma
model Transaction {
  id               String        @id @default(uuid())
  transactionId    String       @unique  // Generated 12-char unique ID
  type             TransactionType
  amount           Float
  description      String?
  status           TransactionStatus @default(PENDING)
  metadata         Json?
  // Relations
  walletId         String
  senderWalletId   String?
  receiverWalletId String?
  wallet           Wallet        @relation(fields: [walletId], references: [id])
  senderWallet     Wallet?       @relation("SenderWallet")
  receiverWallet   Wallet?       @relation("ReceiverWallet")
}
```

### Type System Updates

### Wallet Types
```typescript
enum WalletType {
  SAVINGS = 'SAVINGS',   // Default personal wallet
  CURRENT = 'CURRENT',   // Business transactions
  BUSINESS = 'BUSINESS'  // Enterprise accounts
}

interface WalletStats {
  id: string;
  balance: number;
  currency: string;
  type: WalletType;
  isActive: boolean;
  blockedUntil?: Date;
  dailyLimit: number;
  monthlyLimit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: RecentTransaction[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    kycStatus: KYCStatus;
  };
  qrCodeData: string;
}
```

### Transaction Types
```typescript
interface TransactionDTO {
  amount: number;
  type: TransactionType;
  description?: string;
  metadata?: Record<string, any>;
}

interface TransferDTO extends TransactionDTO {
  toWalletId: string;
  pin: string;
}
```

## API Updates

### Transfer Money
```typescript
POST /api/wallets/transfer
Body: {
  toWalletId: string;
  amount: number;
  description?: string;
  pin: string;
}
```

### Get Wallet Stats
```typescript
GET /api/wallets/stats
Response: {
  success: true,
  data: WalletStats;
}
```

## Security Improvements

1. **PIN Management**
   - PINs are now hashed using bcrypt
   - PIN attempts are tracked
   - Automatic blocking after multiple failed attempts

2. **Transaction Security**
   - All transfers are executed in database transactions
   - Proper balance validation before transfers
   - Transaction IDs are unique and randomly generated

3. **Type Safety**
   - Strict TypeScript types for all operations
   - Runtime validation using Zod
   - Proper error handling with custom ApiError class

## Authentication System

### User Authentication

#### Generate OTP
New Endpoint:
```http
POST /api/auth/otp/generate
```

Legacy Endpoint (for backward compatibility):
```http
POST /api/auth/generate-otp
```

Request body:
```json
{
  "phoneNumber": "+919876543210"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+919876543210"
  },
  "message": "Verification code request initiated"
}
```

#### Verify OTP
New Endpoint:
```http
POST /api/auth/otp/verify
```

Legacy Endpoint (for backward compatibility):
```http
POST /api/auth/verify-otp
```

Request body:
```json
{
  "phoneNumber": "+919876543210",
  "code": "123456"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "phoneNumber": "+919876543210",
      "email": null,
      "firstName": "",
      "lastName": "",
      "role": "USER",
      "isVerified": false
    }
  }
}
```

Note: Both new and legacy endpoints provide identical functionality. The legacy endpoints are maintained for backward compatibility with existing mobile apps.
# Authentication System

## API Routes
- `/auth/otp/generate` - Generate OTP for phone number
- `/auth/otp/verify` - Verify OTP and return user token
- Legacy routes maintained for backward compatibility:
  - `/auth/generate-otp`
  - `/auth/verify-otp`

## Controllers
1. authController
   - generateOTP: Handles OTP generation and rate limiting
   - verifyOTP: Validates OTP and creates/updates user
   - adminLogin: Separate flow for admin authentication

## Error Handling
- asyncHandler wrapper for consistent error handling
- Specific error messages for different failure cases
- Proper HTTP status codes for different scenarios

## User Management
- Users created/updated during OTP verification
- Stores phone number and verification status
- Token generated upon successful verification

## Onboarding Flow Requirements

### KYC and Age Update
1. KYC record must be created first with PAN number (via profile update)
2. Age can only be updated after KYC record exists
3. Date of birth is calculated from age:
   - Uses July 1st as the birth date
   - Year is calculated as: currentYear - age
   - Valid age range: 18-60 years

### Error Handling
- 400 Error if trying to update age before KYC record exists
- 500 Error for database operations or invalid date calculations
- All errors include descriptive messages for debugging

## TypeScript Error Handling Patterns

### Null Checks and Type Safety
1. Always check for nullable fields before access:
```typescript
if (!user?.kyc) {
  throw new ApiError(400, 'Required data missing');
}
```

2. Add runtime checks even after TypeScript checks:
```typescript
// TypeScript might know it exists from previous checks
// but add runtime check for safety
if (!data.someField) {
  throw new ApiError(500, 'Expected data missing');
}
```

3. Use type guards and assertions judiciously:
```typescript
if (error instanceof ApiError) {
  // Handle ApiError specifically
} else {
  // Handle unknown errors
}
```

### Database Operations
1. Check existence before updates:
```typescript
const existing = await prisma.model.findUnique({
  where: { id },
  include: { relations: true },
});

if (!existing) {
  throw new ApiError(404, 'Record not found');
}
```

2. Validate related records:
```typescript
if (!existing.relation) {
  throw new ApiError(400, 'Related record required');
}
```

3. Use transactions for multi-step operations:
```typescript
await prisma.$transaction(async (tx) => {
  // Multiple database operations
});
```

## Deployment Considerations

### ESM Compatibility
When using ES Modules in Vercel deployments:

1. Use dynamic imports for ESM-only packages:
```typescript
// Instead of static import
import { something } from 'esm-package';

// Use dynamic import
const { something } = await import('esm-package');
```

2. For frequently used ESM modules, initialize once and cache:
```typescript
let cachedFunction: Function;

const initializeFunction = async () => {
  const { something } = await import('esm-package');
  cachedFunction = something;
};

// Initialize on startup
initializeFunction().catch(console.error);

export const useFunction = async () => {
  if (!cachedFunction) {
    await initializeFunction();
  }
  return cachedFunction();
};
```

3. Update tsconfig.json settings if needed:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Common ESM-only Packages
- nanoid
- chalk (v5+)
- execa (v6+)
- strip-ansi (v7+)

Always check the package documentation for ESM compatibility.

## Security
- Rate limiting for OTP generation (60 seconds)
- Phone number format validation
- Secure token generation
- Admin authentication separate from regular users
