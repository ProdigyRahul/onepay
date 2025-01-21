"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const userValidations_1 = require("../validations/userValidations");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/profile', userController_1.userController.getProfile);
router.patch('/profile', (0, validate_1.validate)(userValidations_1.updateProfileValidation), userController_1.userController.updateProfile);
router.post('/kyc', (0, validate_1.validate)(userValidations_1.updateKYCValidation), userController_1.userController.updateKYC);
router.get('/kyc', userController_1.userController.getKYCStatus);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map