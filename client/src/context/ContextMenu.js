import {
  FaDownload,
  FaTrash,
  FaEdit,
  FaInfoCircle,
  FaShare,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useDirectoryContext } from "./DirectoryContext";

function ContextMenu({ item, isUploadingItem }) {
  const {
    setDeleteItem,
    openRenameModal,
    openDetailsPopup,
    handleCancelUpload,
  } = useDirectoryContext();

  const menuItems = [
    {
      label: "Download",
      icon: <FaDownload className="text-blue-500" />,
      onClick: () => {
        if (!item.isDirectory) {
          window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL}/file/${item.id}`;
        }
      },
      hidden: item.isDirectory || isUploadingItem,
    },
    {
      label: "Rename",
      icon: <FaEdit className="text-green-500" />,
      onClick: () =>
        openRenameModal(
          item.isDirectory ? "directory" : "file",
          item.id,
          item.name
        ),
      hidden: isUploadingItem,
    },
    {
      label: "Share",
      icon: <FaShare className="text-purple-500" />,
      onClick: () => {},
      hidden: isUploadingItem,
    },
    {
      label: "Details",
      icon: <FaInfoCircle className="text-gray-500" />,
      onClick: () => openDetailsPopup(item),
      hidden: isUploadingItem,
    },
    {
      label: "Cancel Upload",
      icon: <FaTrash className="text-red-500" />,
      onClick: () => handleCancelUpload(item.id),
      hidden: !isUploadingItem,
    },
    {
      label: "Delete",
      icon: <FaTrash className="text-red-500" />,
      onClick: () => setDeleteItem(item),
      hidden: isUploadingItem,
    },
  ].filter((item) => !item.hidden);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute right-3 top-10 z-50 bg-white/95 backdrop-blur-md 
                 border border-gray-200 rounded-xl shadow-2xl 
                 py-2 min-w-48 ring-1 ring-black/5"
    >
      {menuItems.map((menuItem, index) => (
        <button
          key={menuItem.label}
          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 
                     hover:bg-gray-100/80 active:bg-gray-200 transition-colors ${
                       index === menuItems.length - 1
                         ? ""
                         : "border-b border-gray-100/60"
                     }`}
          onClick={(e) => {
            e.stopPropagation();
            menuItem.onClick();
          }}
        >
          <div className="w-5 flex justify-center opacity-90">
            {menuItem.icon}
          </div>
          <span className="font-medium">{menuItem.label}</span>
        </button>
      ))}
    </motion.div>
  );
}

export default ContextMenu;
