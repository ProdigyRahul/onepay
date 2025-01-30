"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const apiError_1 = require("../utils/apiError");
const client_1 = require("@prisma/client");
const adminAuth = async (req, _res, next) => {
    try {
        if (req.user.role !== client_1.Role.ADMIN) {
            throw new apiError_1.ApiError(403, 'Access denied. Admin privileges required.');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.adminAuth = adminAuth;
//# sourceMappingURL=adminAuth.js.map