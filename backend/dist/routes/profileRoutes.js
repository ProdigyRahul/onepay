"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const userValidations_1 = require("../validations/userValidations");
const rateLimit_1 = require("../middleware/rateLimit");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use(rateLimit_1.generalLimiter);
router.get('/', profileController_1.profileController.getProfile);
router.patch('/', (0, validate_1.validate)(userValidations_1.updateProfileValidation), profileController_1.profileController.updateProfile);
exports.default = router;
//# sourceMappingURL=profileRoutes.js.map