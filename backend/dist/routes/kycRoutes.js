"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const kycController_1 = require("../controllers/kycController");
const auth_1 = require("../middleware/auth");
const multer_1 = require("../config/multer");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/upload/pan', multer_1.upload.single('panCard'), (0, asyncHandler_1.asyncHandler)(kycController_1.kycController.uploadPanCard));
router.get('/status', (0, asyncHandler_1.asyncHandler)(kycController_1.kycController.getKycStatus));
router.post('/admin/update-status', (0, asyncHandler_1.asyncHandler)(kycController_1.kycController.updateKycStatus));
exports.default = router;
//# sourceMappingURL=kycRoutes.js.map