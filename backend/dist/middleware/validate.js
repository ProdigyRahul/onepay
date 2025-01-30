"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => async (req, res, next) => {
    var _a;
    try {
        console.log('Validating request body:', req.body);
        const result = await schema.parseAsync(req.body);
        console.log('Validation successful:', result);
        return next();
    }
    catch (error) {
        console.error('Validation error:', error);
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                error: ((_a = error.errors[0]) === null || _a === void 0 ? void 0 : _a.message) || 'Validation failed',
                details: error.errors
            });
        }
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
        });
    }
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map