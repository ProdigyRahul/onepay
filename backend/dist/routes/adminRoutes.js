"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const adminController_1 = require("../controllers/adminController");
const validate_1 = require("../middleware/validate");
const adminValidations_1 = require("../validations/adminValidations");
const adminAuth_1 = require("../middleware/adminAuth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use(adminAuth_1.adminAuth);
router.get('/kyc/pending', (0, asyncHandler_1.asyncHandler)(adminController_1.adminController.getPendingKycApplications));
router.post('/kyc/:userId/verify', (0, validate_1.validate)(adminValidations_1.updateKycStatusValidation), (0, asyncHandler_1.asyncHandler)(adminController_1.adminController.updateKycStatus));
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map