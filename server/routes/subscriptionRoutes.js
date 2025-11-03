import express from "express";
import { cancelSubscription, createSubscription, getAllSubscriptions, pauseSubscription, resumeSubscription } from "../controllers/subscriptionController.js";
import checkAuth from "../middlewares/authMiddleware.js";


const router = express.Router();


router.get("/all",checkAuth, getAllSubscriptions);
router.post("/", checkAuth, createSubscription);
router.post ("/pause", checkAuth, pauseSubscription);
router.post ("/resume",checkAuth,  resumeSubscription);
router.post ("/cancel",checkAuth , cancelSubscription);

export default router;
