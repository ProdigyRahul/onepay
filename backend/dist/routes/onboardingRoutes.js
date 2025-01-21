"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const onboardingController_1 = require("../controllers/onboardingController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const onboardingValidations_1 = require("../validations/onboardingValidations");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/profile', (0, validate_1.validate)(onboardingValidations_1.profileValidation), onboardingController_1.onboardingController.updateProfile);
router.post('/age', (0, validate_1.validate)(onboardingValidations_1.ageValidation), onboardingController_1.onboardingController.updateAge);
router.post('/primary-goal', (0, validate_1.validate)(onboardingValidations_1.primaryGoalValidation), onboardingController_1.onboardingController.updatePrimaryGoal);
router.post('/income-range', (0, validate_1.validate)(onboardingValidations_1.incomeRangeValidation), onboardingController_1.onboardingController.updateIncomeRange);
router.post('/spending-habits', (0, validate_1.validate)(onboardingValidations_1.spendingHabitsValidation), onboardingController_1.onboardingController.updateSpendingHabits);
router.post('/financial-profile', (0, validate_1.validate)(onboardingValidations_1.financialProfileValidation), onboardingController_1.onboardingController.updateFinancialProfile);
router.get('/status', onboardingController_1.onboardingController.getStatus);
exports.default = router;
//# sourceMappingURL=onboardingRoutes.js.map