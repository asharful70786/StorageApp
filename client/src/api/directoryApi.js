import { axiosWithCreds } from "./axiosInstances";

export const getDirectoryItems = async (dirId = "") => {
  const { data } = await axiosWithCreds.get(`/directory/${dirId}`);
  return data;
};

export const createDirectory = async (dirId = "", newDirname) => {
  const { data } = await axiosWithCreds.post(
    `/directory/${dirId}`,
    {},
    { headers: { dirname: newDirname } }
  );
  return data;
};

export const deleteDirectory = async (id) => {
  const { data } = await axiosWithCreds.delete(`/directory/${id}`);
  return data;
};

export const renameDirectory = async (id, newDirName) => {
  const { data } = await axiosWithCreds.patch(`/directory/${id}`, {
    newDirName,
  });
  return data;
};
