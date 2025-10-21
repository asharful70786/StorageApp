import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
// import { createUserIdIndex } from "./config/createRedisIndex.js";


await connectDB();

// (async () => {
//   await createUserIdIndex();
// })();

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

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/", userRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  // res.status(err.status || 500).json({ error: "Something went wrong!" });
  res.json(err);
});

app.listen(PORT, () => {
  console.log(`Server Started`);
});


// https://stackoverflow.com/questions/18367824/how-to-cancel-http-upload-from-data-events