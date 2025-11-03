// DirectoryItem.js
import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "./ContextMenu";
import { useDirectoryContext } from "../context/DirectoryContext";
import { formatSize } from "./DetailsPopup";

function DirectoryItem({ item, uploadProgress }) {
  const {
    handleRowClick,
    activeContextMenu,
    handleContextMenu,
    getFileIcon,
    isUploading,
  } = useDirectoryContext();

  function renderFileIcon(iconString) {
    const iconClass = "text-lg";
    switch (iconString) {
      case "pdf":
        return <FaFilePdf className={`text-red-500 ${iconClass}`} />;
      case "image":
        return <FaFileImage className={`text-green-500 ${iconClass}`} />;
      case "video":
        return <FaFileVideo className={`text-purple-500 ${iconClass}`} />;
      case "archive":
        return <FaFileArchive className={`text-yellow-500 ${iconClass}`} />;
      case "code":
        return <FaFileCode className={`text-blue-500 ${iconClass}`} />;
      case "alt":
      default:
        return <FaFileAlt className={`text-gray-500 ${iconClass}`} />;
    }
  }

  const isUploadingItem = item.id.startsWith("temp-");

  return (
    <div
      className="flex flex-col justify-between p-4 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl cursor-pointer relative transition-all duration-200"
      onClick={() =>
        !(activeContextMenu || isUploading) &&
        handleRowClick(item.isDirectory ? "directory" : "file", item.id)
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      <div
        className="flex justify-between items-center"
        title={`Size: ${formatSize(item.size)}\nCreated At: ${new Date(item.createdAt).toLocaleString()}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {item.isDirectory ? (
              <FaFolder className="text-blue-500 text-xl" />
            ) : (
              <div className="text-gray-600">
                {renderFileIcon(getFileIcon(item.name))}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 font-medium text-sm truncate">
              {item.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>{formatSize(item.size)}</span>
              <span>•</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              {item.isDirectory && (
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                  Folder
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          className="text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition-colors flex-shrink-0 ml-2"
          onClick={(e) => handleContextMenu(e, item.id)}
        >
          <BsThreeDotsVertical />
        </div>
        {activeContextMenu === item.id && (
          <ContextMenu item={item} isUploadingItem={isUploadingItem} />
        )}
      </div>
      {isUploadingItem && (
        <div className="mt-3 px-2 relative">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Uploading...</span>
            <span className="font-medium text-gray-700">
              {Math.floor(uploadProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
                backgroundColor: uploadProgress === 100 ? "#10b981" : "#3b82f6",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryItem;