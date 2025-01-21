"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/generate-otp', authController_1.generateOTP);
router.post('/verify-otp', authController_1.verifyOTP);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map