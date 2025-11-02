import express from "express";
import { createSubscription } from "../controllers/subscriptionControllers.js";
import checkAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create" ,checkAuth,   createSubscription)

export default router