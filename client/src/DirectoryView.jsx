import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import { DirectoryContext } from "./context/DirectoryContext";

import {
  getDirectoryItems,
  createDirectory,
  deleteDirectory,
  renameDirectory,
} from "./api/directoryApi";

import {
  deleteFile,
  renameFile,
  uploadComplete,
  uploadInitiate,
} from "./api/fileApi";
import DetailsPopup from "./components/DetailsPopup";
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";

function DirectoryView() {
  const { dirId } = useParams();
  const navigate = useNavigate();

  const [directoryName, setDirectoryName] = useState("Storage cloud  Drivee");
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const fileInputRef = useRef(null);

  // Single-file upload state
  const [uploadItem, setUploadItem] = useState(null); // { id, file, name, size, progress, isUploading }
  const xhrRef = useRef(null);

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const openDetailsPopup = (item) => setDetailsItem(item);
  const closeDetailsPopup = () => setDetailsItem(null);

  const loadDirectory = async () => {
    try {
      const data = await getDirectoryItems(dirId);
      setDirectoryName(dirId ? data.name : "Storage cloud  Drivee");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    loadDirectory();
    setActiveContextMenu(null);
  }, [dirId]);

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "🖼️";
      case "mp4":
      case "mov":
      case "avi":
        return "🎬";
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return "📦";
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return "💻";
      default:
        return "📎";
    }
  }

  function handleRowClick(type, id) {
    if (type === "directory") navigate(`/directory/${id}`);
    else window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL}/file/${id}`;
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadItem?.isUploading) {
      setErrorMessage("An upload is already in progress. Please wait.");
      setTimeout(() => setErrorMessage(""), 3000);
      e.target.value = "";
      return;
    }

    const tempItem = {
      file,
      name: file.name,
      size: file.size,
      id: `temp-${Date.now()}`,
      isUploading: true,
      progress: 0,
    };

    try {
      const data = await uploadInitiate({
        name: file.name,
        size: file.size,
        contentType: file.type,
        parentDirId: dirId,
      });

      const { uploadSignedUrl, fileId } = data;

      // Optimistically show the file in the list
      setFilesList((prev) => [tempItem, ...prev]);
      setUploadItem(tempItem);
      e.target.value = "";

      startUpload({ item: tempItem, uploadUrl: uploadSignedUrl, fileId });
    } catch (err) {
      setErrorMessage(err.response.data.error);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  }

  function startUpload({ item, uploadUrl, fileId }) {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open("PUT", uploadUrl);

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setUploadItem((prev) => (prev ? { ...prev, progress } : prev));
      }
    });

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const fileUploadResponse = await uploadComplete(fileId);
        console.log(fileUploadResponse);
      } else {
        console.log(xhr.response);
        console.log(xhr.responseText);
        setErrorMessage("File not uploaded");
        setTimeout(() => setErrorMessage(""), 3000);
      }
      setUploadItem(null);
      loadDirectory();
    };

    xhr.onerror = () => {
      setErrorMessage("Something went wrong!");
      // Remove temp item from the list
      setFilesList((prev) => prev.filter((f) => f.id !== item.id));
      setUploadItem(null);
      setTimeout(() => setErrorMessage(""), 3000);
    };

    xhr.send(item.file);
  }

  function handleCancelUpload(tempId) {
    if (uploadItem && uploadItem.id === tempId && xhrRef.current) {
      xhrRef.current.abort();
    }
    // Remove temp item and reset state
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    setUploadItem(null);
  }

  async function confirmDelete(item) {
    try {
      if (item.isDirectory) await deleteDirectory(item.id);
      else await deleteFile(item.id);
      setDeleteItem(null);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    try {
      await createDirectory(dirId, newDirname);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    try {
      if (renameType === "file") await renameFile(renameId, renameValue);
      else await renameDirectory(renameId, renameValue);

      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  useEffect(() => {
    const handleDocumentClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  // For compatibility with children expecting these values:
  const isUploading = !!uploadItem?.isUploading;
  const progressMap = uploadItem
    ? { [uploadItem.id]: uploadItem.progress || 0 }
    : {};

  return (
    <div className="min-h-screen bg-white">
      {/* Status Bar (iPhone-style) */}
      <div className="bg-white pt-8 px-4 pb-2 border-b border-gray-100">
       
        
        <DirectoryContext.Provider
          value={{
            handleRowClick,
            activeContextMenu,
            handleContextMenu: (e, id) => {
              e.stopPropagation();
              e.preventDefault();
              setActiveContextMenu((prev) => (prev === id ? null : id));
            },
            getFileIcon,
            isUploading,
            progressMap,
            handleCancelUpload,
            setDeleteItem,
            openRenameModal,
            openDetailsPopup,
          }}
        >
          <div className="mx-2 md:mx-4">
            {errorMessage &&
              errorMessage !==
                "Directory not found or you do not have access to it!" && (
                <div className="error-message bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center mb-4 shadow-sm">
                  {errorMessage}
                </div>
              )}

            <DirectoryHeader
              directoryName={directoryName}
              onCreateFolderClick={() => setShowCreateDirModal(true)}
              onUploadFilesClick={() => fileInputRef.current.click()}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              disabled={
                errorMessage ===
                "Directory not found or you do not have access to it!"
              }
            />

            {showCreateDirModal && (
              <CreateDirectoryModal
                newDirname={newDirname}
                setNewDirname={setNewDirname}
                onClose={() => setShowCreateDirModal(false)}
                onCreateDirectory={handleCreateDirectory}
              />
            )}

            {showRenameModal && (
              <RenameModal
                renameType={renameType}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                onClose={() => setShowRenameModal(false)}
                onRenameSubmit={handleRenameSubmit}
              />
            )}

            {detailsItem && (
              <DetailsPopup item={detailsItem} onClose={closeDetailsPopup} />
            )}

            {/* Storage Summary */}
            

            {combinedItems.length === 0 ? (
              errorMessage ===
              "Directory not found or you do not have access to it!" ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚫</span>
                  </div>
                  <p className="text-gray-600 font-medium">Directory not found</p>
                  <p className="text-gray-400 text-sm mt-1">You don't have access to this folder</p>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <span className="text-3xl">📁</span>
                  </div>
                  <p className="text-gray-600 font-medium">This folder is empty</p>
                  <p className="text-gray-400 text-sm mt-1">Upload files or create folders to get started</p>
                </div>
              )
            ) : (
              <DirectoryList items={combinedItems} />
            )}

            {deleteItem && (
              <ConfirmDeleteModal
                item={deleteItem}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteItem(null)}
              />
            )}
          </div>
        </DirectoryContext.Provider>
      </div>

   

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

export default DirectoryView;