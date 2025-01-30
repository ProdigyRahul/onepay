"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginValidation = void 0;
const zod_1 = require("zod");
exports.adminLoginValidation = zod_1.z.object({
    phoneNumber: zod_1.z.string({
        required_error: "Phone number is required",
        invalid_type_error: "Phone number must be a string"
    })
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number cannot exceed 15 digits')
        .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
    password: zod_1.z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string"
    })
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});
//# sourceMappingURL=authValidations.js.map