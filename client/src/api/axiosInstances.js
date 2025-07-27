import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const axiosWithCreds = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosWithoutCreds = axios.create({
  baseURL: BASE_URL,
});
