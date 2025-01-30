"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validate_1 = require("../middleware/validate");
const authValidations_1 = require("../validations/authValidations");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = express_1.default.Router();
router.use('/admin/login', (req, _res, next) => {
    console.log('Debug - Request body:', req.body);
    console.log('Debug - Content-Type:', req.headers['content-type']);
    next();
});
router.post('/otp/generate', (0, asyncHandler_1.asyncHandler)(authController_1.generateOTP));
router.post('/otp/verify', (0, asyncHandler_1.asyncHandler)(authController_1.verifyOTP));
router.post('/generate-otp', (0, asyncHandler_1.asyncHandler)(authController_1.generateOTP));
router.post('/verify-otp', (0, asyncHandler_1.asyncHandler)(authController_1.verifyOTP));
router.post('/admin/login', (0, validate_1.validate)(authValidations_1.adminLoginValidation), (0, asyncHandler_1.asyncHandler)(authController_1.adminLogin));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map