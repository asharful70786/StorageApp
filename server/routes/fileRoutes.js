import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import {
  deleteFile,
  getFile,
  renameFile,
  uploadFile,
} from "../controllers/fileController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.post("/:parentDirId?", uploadFile);

router.get("/:id", getFile);

router.patch("/:id", renameFile);

router.delete("/:id", deleteFile);

export default router;
