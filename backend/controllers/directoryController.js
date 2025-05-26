import { rm } from "fs/promises";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import mongoose, { Mongoose, Schema } from "mongoose";

export const getDirectory = async (req, res) => {
  const user = req.user;
  //soft deleted apply
  if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ message: "Your account has been blocked. Please contact the admin." });
  }
  const _id = req.params.id || user.rootDirId.toString();
  const directoryData = await Directory.findOne({ _id }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = await File.find({ parentDirId: directoryData._id }).lean();
  const directories = await Directory.find({ parentDirId: _id }).lean();
  return res.status(200).json({
    ...directoryData,
    files: files.map((dir) => ({ ...dir, id: dir._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
};

export const createDirectory = async (req, res, next) => {
  const user = req.user;
  //soft deleted apply
   if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ message: "Your account has been blocked. Please contact the admin." });
  }
  const parentDirId = req.params.parentDirId || user.rootDirId.toString();
  const dirname = req.body.dirname || "New Folder";


  try {
    const parentDir = await Directory.findById(parentDirId).lean();
    if (!parentDir) {
      return res.status(404).json({ message: "Parent Directory Does not exist!" });
    }
    const newDirectory = await Directory.create({
      name: dirname,
      parentDirId: new mongoose.Types.ObjectId(parentDirId),
      userId: new mongoose.Types.ObjectId(user._id),
    });

    return res.status(201).json({ message: "Directory Created!", directory: newDirectory });
  } catch (err) {
    console.error("Error in createDirectory:", err);
    if (err.name === "StrictModeError" || err.code === 121) {
      return res.status(400).json({ error: "Invalid input, please enter valid details" });
    }
    return res.status(500).json({ error: "Something went wrong!" });
  }
};


export const renameDirectory = async (req, res, next) => {
  const user = req.user;
  //soft deleted apply
  if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ message: "Your account has been blocked. Please contact the admin." });
  }
  const { id } = req.params;
  const { newDirName } = req.body;
  try {
    await Directory.findOneAndUpdate(
      {
        _id: id,
        userId: user._id,
      },
      { name: newDirName }
    );
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};

export const deleteDirectory = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  //soft deleted apply
  if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ message: "Your account has been blocked. Please contact the admin." });
  }
  try {
    const directoryData = await Directory.findOne({
      _id: id,
      userId: req.user._id,
    })
      .select("_id")
      .lean();

    if (!directoryData) {
      return res.status(404).json({ error: "Directory not found!" });
    }

    async function getDirectoryContents(id) {
      let files = await File.find({ parentDirId: id })
        .select("extension")
        .lean();
      let directories = await Directory.find({ parentDirId: id })
        .select("_id")
        .lean();

      for (const { _id } of directories) {
        const { files: childFiles, directories: childDirectories } =
          await getDirectoryContents(_id);

        files = [...files, ...childFiles];
        directories = [...directories, ...childDirectories];
      }

      return { files, directories };
    }

    const { files, directories } = await getDirectoryContents(id);

    for (const { _id, extension } of files) {
      await rm(`./storage/${_id.toString()}${extension}`);
    }

    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });

    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), id] },
    });
  } catch (err) {
    next(err);
  }
  return res.json({ message: "Files deleted successfully" });
};
