import { createWriteStream, Dir } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";


export const uploadFile = async (req, res, next) => {
  const user = req.user;
  if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ message: "Your account has been blocked. Please contact the admin." });
  }
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  const parentDirData = await Directory.findOne({
    _id: parentDirId,
    userId: req.user._id,
  });

  // Check if parent directory exists
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory not found!" });
  }

  const filename = req.headers.filename || "untitled";
  const extension = path.extname(filename);

  try {
    const insertedFile = await File.insertOne({
      extension,
      name: filename,
      parentDirId: parentDirData._id,
      userId: req.user._id,
    });
    const fileId = insertedFile.id
    const fullFileName = `${fileId}${extension}`;

    const writeStream = createWriteStream(`./storage/${fullFileName}`);
    req.pipe(writeStream);

    req.on("end", async () => {
      return res.status(201).json({ message: "File Uploaded" });
    });

    req.on("error", async () => {
      await File.deleteOne({ _id: insertedFile.insertedId });
      return res.status(404).json({ message: "Could not Upload File" });
    });
  } catch (err) {
    console.log(err);
    // Clean up the file if an error occurs
    const filePath = `./storage/${req.params.id}${extension}`;
    try {
      await rm(filePath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    err.status = 500;
    next(err);
  }
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  //soft deleted apply
   if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ message: "Your account has been blocked. Please contact the admin." });
  }
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  });
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // If "download" is requested, set the appropriate headers
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  //soft deleted apply
   if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ message: "Your account has been blocked. Please contact the admin." });
  }
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  });
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }
  try {
    fileData.name = req.body.newFilename;
    await fileData.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};


export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  //soft deleted apply
   if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ message: "Your account has been blocked. Please contact the admin." });
  }
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).lean();

  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    await rm(`./storage/${id}${fileData.extension}`);
    await File.deleteOne({ _id: fileData._id });
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
