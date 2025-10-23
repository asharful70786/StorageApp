import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import { clound_Front_Get_Url, creteUploadSignedUrl, get_S3_File_Meta_Data } from "../config/s3.js";

export async function updateDirectoriesSize(parentId, deltaSize) {
  while (parentId) {
    const dir = await Directory.findById(parentId);
    dir.size += deltaSize;
    await dir.save();
    parentId = dir.parentDirId;
  }
}

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const filesize = req.headers.filesize;

    const user = await User.findById(req.user._id);
    const rootDir = await Directory.findById(req.user.rootDirId);

    const remainingSpace = user.maxStorageInBytes - rootDir.size;

    if (filesize > remainingSpace) {
      console.log("File too large");
      return res.destroy();
    }

    const extension = path.extname(filename);

    const insertedFile = await File.insertOne({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
    });

    const fileId = insertedFile.id;

    const fullFileName = `${fileId}${extension}`;
    const filePath = `./storage/${fullFileName}`;

    const writeStream = createWriteStream(filePath);

    let totalFileSize = 0;
    let aborted = false;
    let fileUploadCompleted = false;

    req.on("data", async (chunk) => {
      if (aborted) return;
      totalFileSize += chunk.length;
      if (totalFileSize > filesize) {
        aborted = true;
        writeStream.close();
        await insertedFile.deleteOne();
        await rm(filePath);
        return req.destroy();
      }
      writeStream.write(chunk);
    });

    req.on("end", async () => {
      fileUploadCompleted = true;
      await updateDirectoriesSize(parentDirId, totalFileSize);
      return res.status(201).json({ message: "File Uploaded" });
    });

    req.on("close", async () => {
      if (!fileUploadCompleted) {
        try {
          await insertedFile.deleteOne();
          await rm(filePath);
          console.log("file cleaned");
        } catch (err) {
          console.error("Error cleaning up aborted upload:", err);
        }
      }
    });
    
    req.on("error", async () => {
      await File.deleteOne({ _id: insertedFile.insertedId });
      return res.status(404).json({ message: "Could not Upload File" });
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).lean();

  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }


  if (req.query.action === "download") {
    let signedUrl =await  clound_Front_Get_Url({
      key : `${id}${fileData.extension}` , 
      download : true , fileName : fileData.name
    });
    return res.redirect(signedUrl);
  }


   let signedUrl =await  clound_Front_Get_Url({
      key : `${id}${fileData.extension}`,fileName : fileData.name}
    );
    return res.redirect(signedUrl);
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
    await file.deleteOne();
    await updateDirectoriesSize(file.parentDirId, -file.size);
    await rm(`./storage/${id}${file.extension}`);
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};


export const HandleFileInit = async(req , res) => {

  //insert to DB 

   const parentDirId = req.body.parentDirId || req.user.rootDirId;
  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.body.filename || "untitled";
    const filesize = req.body.filesize; 

    const user = await User.findById(req.user._id);
    const rootDir = await Directory.findById(req.user.rootDirId);

    const remainingSpace = user.maxStorageInBytes - rootDir.size;

    if (filesize > remainingSpace) {
      console.log("File too large");
      return res.status(507).json({ error: "You have reached your storage limit !" });
    }

    const extension = path.extname(filename);


  const insertedFile =  await File.insertOne({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
      isUploading: true,
    });

  const url = await creteUploadSignedUrl({
    Key: `${insertedFile._id}${extension}`,
    ContentType: req.body.contentType
  });
  return res.status(200).json({upload_File_Url : url , fileId : insertedFile.id});
  
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error while creating file!" });
  }
}

export const upload_Complete = async(req , res) => {
   try {
  const file = await File.findOne({  _id : req.body.fileId  });
  if (!file)return res.status(404).json({ error: "File not found!" });


  const s3MetaData = await get_S3_File_Meta_Data({
    Key : `${file._id}${file.extension}`
  });

  if(!s3MetaData) return res.status(404).json({ error: "File not  properly uploaded" });  
  if(s3MetaData.ContentLength !== file.size) {
    //here will be if the file Big then delete from S3 
    return res.status(404).json({ error: "file size not matched " });
  }


  await File.findByIdAndUpdate(file._id , {isUploading : false});
  await updateDirectoriesSize(file.parentDirId, file.size);
  console.log("Done")

    return res.status(200).json({ message: "File Uploaded Successfully" });
  } catch (err) {
    next(err);
  }

}