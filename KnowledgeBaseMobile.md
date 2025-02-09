# Authentication Flow

## API Endpoints
- OTP Generation: `/auth/otp/generate`
- OTP Verification: `/auth/otp/verify`

## Screens
1. LoginScreen
   - Handles phone number input (10 digits)
   - Formats number with +91 prefix
   - Uses loading states during API calls
   - Proper error handling with user-friendly messages

2. OTPScreen
   - 6-digit OTP verification
   - 60-second resend timer
   - Handles loading states
   - Error handling for invalid OTPs
   - Navigation logic based on onboarding status

## Error Handling
- API calls wrapped in try/catch blocks
- Specific error messages for different failure cases
- Loading states properly managed in try/catch/finally blocks
- User-friendly error messages displayed via Alert

## Error Handling Patterns

### API Service Layer
All API service methods follow this error handling pattern:
```typescript
try {
  const response = await apiClient.request(...);
  return response.data;
} catch (error) {
  console.error('Operation name error:', error);
  throw error; // Re-throw for component layer handling
}
```

Benefits:
- Consistent error logging across all API calls
- Error details preserved for UI layer handling
- Clear error context in logs for debugging

### Component Layer
Components should handle API errors by:
1. Using try/catch blocks around API calls
2. Dispatching error state to Redux if needed
3. Showing user-friendly error messages via Alert
4. Setting loading states appropriately

Example:
```typescript
try {
  dispatch(setLoading(true));
  await api.someOperation();
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Operation failed';
  dispatch(setError(errorMessage));
  Alert.alert('Error', errorMessage);
} finally {
  dispatch(setLoading(false));
}
```

## Navigation Flow
1. Login → OTP Screen
2. After OTP verification:
   - If onboarding complete → Home
   - If onboarding incomplete → Age Screen
   - Fallback to Age Screen if status check fails

## Navigation Routes
1. Authentication Flow:
   - 'Login' - Phone number input
   - 'OTP' - OTP verification

2. Onboarding Flow:
   - 'OnboardingAge' - Age verification
   - 'OnboardingProfile' - User profile
   - 'OnboardingPurpose' - User goals
   - 'OnboardingIncome' - Income range
   - 'OnboardingSpending' - Spending habits
   - 'OnboardingSavings' - Savings goals
   - 'OnboardingKyc' - KYC information
   - 'OnboardingKycDocument' - Document upload
   - 'OnboardingKycStatus' - KYC status

3. Main App:
   - 'Home' - Main dashboard

## Navigation Types
- All routes defined in `navigation/types.ts`
- Type-safe navigation using `RootStackParamList`
- Screen props typed with `RootStackScreenProps`

## Dashboard Screen
1. Components
   - Balance Card
     - Shows current wallet balance
     - Quick action buttons
   - Recent Transactions
     - List of latest transactions
     - Transaction type indicators
   - Quick Actions
     - Send Money
     - Request Money
     - Scan QR
     - View History

2. API Integration
   - GET /api/wallet/balance for wallet info
   - Transaction history endpoint for recent activities
   - User profile data for personalization

3. Redux Integration
   - Wallet slice for balance management
   - Transaction slice for history
   - Loading states management

4. Navigation
   - Tab navigation root
   - Stack navigation for action flows
   - Modal screens for quick actions

5. Error Handling
   - Balance fetch retry mechanism
   - Transaction list error states
   - Offline mode indicators
   - Refresh functionality

## API Request Body Structure

### Onboarding API
The backend validation middleware expects request data in this format:
```typescript
{
  body: {
    // request data here
  }
}
```

The middleware automatically wraps the request data in a `body` object, so the frontend should send data directly:

✅ Correct way:
```typescript
// Frontend API call
apiClient.post('/onboarding/age', { age: 21 });

// Backend receives:
{
  body: {
    age: 21
  }
}
```

❌ Wrong way:
```typescript
// Frontend API call
apiClient.post('/onboarding/age', { body: { age: 21 } });

// Backend receives:
{
  body: {
    body: {
      age: 21  // Extra nesting causes validation error!
    }
  }
}
```

Examples of correct API calls:

1. Profile Update:
```typescript
apiClient.post('/onboarding/profile', {
  firstName: string,
  lastName: string,
  email: string,
  panNumber: string // Format: ABCDE1234F
});
```

2. Age Update:
```typescript
apiClient.post('/onboarding/age', {
  age: number // between 18 and 60
});
```

3. Primary Goal:
```typescript
apiClient.post('/onboarding/primary-goal', {
  primaryGoal: UserGoal // enum value
});
```

4. Income Range:
```typescript
apiClient.post('/onboarding/income-range', {
  incomeRange: IncomeRange // enum value
});
```

5. Spending Habits:
```typescript
apiClient.post('/onboarding/spending-habits', {
  spendingHabit: SpendingHabit, // enum value
  targetSpendingPercentage: number // 0-100
});
```

## Redux Store Structure
1. Store Configuration (`src/store/store.ts`):
   - Configures Redux store with reducers
   - Exports typed hooks: useAppDispatch, useAppSelector
   - Exports RootState and AppDispatch types

2. Auth Slice (`src/store/slices/authSlice.ts`):
   - Manages authentication state
   - Actions: setCredentials, setLoading, setError, logout
   - Stores user data and token

3. Onboarding Slice (`src/store/slices/onboardingSlice.ts`):
   - Manages onboarding flow state
   - Tracks completion of onboarding steps

4. Usage in Components:
   - Import hooks from store: `import { useAppDispatch, useAppSelector, RootState } from '../../store/store'`
   - Import actions from slices: `import { setCredentials, setLoading } from '../../store/slices/authSlice'`
   - Type state in selectors: `useAppSelector((state: RootState) => state.auth)`
