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
