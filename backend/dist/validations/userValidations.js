"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKYCValidation = exports.updateProfileValidation = void 0;
const zod_1 = require("zod");
exports.updateProfileValidation = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must not exceed 50 characters'),
        lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must not exceed 50 characters'),
        email: zod_1.z.string().email('Invalid email address'),
    }),
});
exports.updateKYCValidation = zod_1.z.object({
    body: zod_1.z.object({
        panNumber: zod_1.z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
        dateOfBirth: zod_1.z.string().datetime('Invalid date format'),
        address: zod_1.z.string().min(10, 'Address must be at least 10 characters'),
        city: zod_1.z.string().min(2, 'City must be at least 2 characters'),
        state: zod_1.z.string().min(2, 'State must be at least 2 characters'),
        pincode: zod_1.z.string().regex(/^[0-9]{6}$/, 'Invalid pincode format'),
    }),
});
//# sourceMappingURL=userValidations.js.map