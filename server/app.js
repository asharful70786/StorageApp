import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import crypto from "crypto";
import { exec } from "child_process";

const GITHUB_SECRET = "Bitto0000"; 

function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto
    .createHmac("sha256", GITHUB_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  const expected = `sha256=${hmac}`;
  return signature === expected;
}

app.post("/github-webhook", (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send("Invalid signature");
  }

  exec("bash /home/ubuntu/client-deployment.sh", (err, stdout, stderr) => {
    if (err) {
      console.error("Deploy error:", stderr);
      return res.status(500).send("Deploy failed");
    }

    console.log(stdout);
    res.send("Deploy triggered");
  });
});










await connectDB();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Hello from StorageApp!" });
});

app.get("/err", (req, res) => {
  console.log("process exited with error");
  process.exit(1);
});

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/subscriptions", checkAuth, subscriptionRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/", userRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  // res.status(err.status || 500).json({ error: "Something went wrong!" });
  res.json(err);
});

app.get("/err" , (req , res)=> {
console.log('error occered');
process.exit(1);
});



app.listen(PORT, () => {
  console.log(`Server Started ${PORT}`);
});
