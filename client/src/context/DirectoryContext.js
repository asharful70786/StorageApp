import { createContext, useContext } from "react";

export const DirectoryContext = createContext(null);

export function useDirectoryContext() {
  return useContext(DirectoryContext);
}
