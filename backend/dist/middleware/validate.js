"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => async (req, res, next) => {
    var _a;
    try {
        console.log('=== Validation Start ===');
        console.log('Raw request body:', req.body);
        console.log('Request headers:', req.headers);
        console.log('Validation schema:', schema);
        if (!req.body) {
            console.error('Request body is undefined');
            return res.status(400).json({
                success: false,
                error: 'Request body is required',
            });
        }
        console.log('Data to validate:', req.body);
        const result = await schema.parseAsync(req.body);
        console.log('Validation successful:', result);
        req.body = result;
        console.log('Updated request body:', req.body);
        console.log('=== Validation End ===');
        return next();
    }
    catch (error) {
        console.error('=== Validation Error ===');
        console.error('Error details:', error);
        if (error instanceof zod_1.ZodError) {
            console.error('Zod validation errors:', {
                errors: error.errors,
                formattedErrors: error.format(),
            });
            return res.status(400).json({
                success: false,
                error: ((_a = error.errors[0]) === null || _a === void 0 ? void 0 : _a.message) || 'Validation failed',
                details: error.errors
            });
        }
        console.error('Non-Zod error:', error);
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
        });
    }
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map