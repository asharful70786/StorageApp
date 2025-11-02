import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import { webHookEvent } from "../controllers/webHookController.js";

const router = express.Router();

router.post("/razorpay" ,   webHookEvent)

export default router;


//https://widespread-uncriticizingly-whitley.ngrok-free.dev/webhook/razorpay