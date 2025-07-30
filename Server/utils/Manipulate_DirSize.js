import Directory from "../models/directoryModel.js";

export default async function manipulateDirSize(parentDirId, deltaSize) {
  while (parentDirId) {
    const dir = await Directory.findById(parentDirId);
    if (!dir) break;
    dir.size += deltaSize;
    await dir.save();
    parentDirId = dir.parentDirId;
  }
}
