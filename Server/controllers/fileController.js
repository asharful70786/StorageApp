import { createWriteStream, write } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import manipulateDirSize from "../utils/Manipulate_DirSize.js";
import User from "../models/userModel.js";

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;



  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const filesize = parseInt(req.headers.filesize, 10);

    if (isNaN(filesize)) {
      return res.status(400).json({ error: "Invalid file size" });
    }

    const root_ParentDir = await Directory.findOne({
      _id: req.user.rootDirId,
    });

    // can upload the max storage here 1 gb check
    const userInfo = await User.findOne({ _id: req.user._id }).lean();

    if (root_ParentDir.size + filesize > userInfo.maxStorageInBytes) {
      console.log("Storage limit exceeded");
      res.status(400).json({ error: "Storage limit exceeded" });
      req.destroy();
      return;
    }
    if (filesize > 50 * 1024 * 1024) {
      res.status(400).json({ error: "File size is too large" });
      req.destroy();
      return
    }

    const extension = path.extname(filename);

    const insertedFile = await File.create({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
    });
    const fileId = insertedFile._id;


    const fullFileName = `${fileId}${extension}`;
    const filePath = `./storage/${fullFileName}`;
    const writeStream = createWriteStream(filePath);

    let totalFileSize = 0;

    req.on("data", async (chunk) => {
      totalFileSize += chunk.length;
      if (totalFileSize > filesize) {
        writeStream.close();
        await File.deleteOne({ _id: insertedFile.insertedId });
        await rm(filePath);
        return req.destroy();
      }
      writeStream.write(chunk);
    });

    req.on("end", async () => {
      writeStream.end();
      await manipulateDirSize(parentDirId, totalFileSize);
      return res.status(201).json({ message: "File Uploaded" });
    });

    req.on("error", async () => {
      await File.deleteOne({ _id: insertedFile.insertedId });
      return res.status(500).json({ message: "Could not upload file" });
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).lean();
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
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  // Check if file exists
  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    file.name = req.body.newFilename;
    await file.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    await rm(`./storage/${id}${file.extension}`);
    await file.deleteOne();
    await manipulateDirSize(file.parentDirId, -file.size);
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
