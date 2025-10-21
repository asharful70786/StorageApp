import { useDirectoryContext } from "../context/DirectoryContext";

function ContextMenu({ item, isUploadingItem }) {
  const {
    handleCancelUpload,
    setDeleteItem,
    openRenameModal,
    openDetailsPopup,
    BASE_URL,
  } = useDirectoryContext();

  const menuClass =
    "absolute bg-white border border-blue-400 shadow-md rounded text-sm z-50 right-2 top-4/5 overflow-hidden";
  const itemClass = "px-4 py-2 hover:bg-blue-100 cursor-pointer";

  if (item.isDirectory) {
    return (
      <div className={menuClass}>
        <div
          className={itemClass}
          onClick={() => openRenameModal("directory", item.id, item.name)}
        >
          Rename
        </div>
        <div className={itemClass} onClick={() => setDeleteItem(item)}>
          Delete
        </div>
        <div className={itemClass} onClick={() => openDetailsPopup(item)}>
          Details
        </div>
      </div>
    );
  }

  if (isUploadingItem && item.isUploading) {
    return (
      <div className={menuClass}>
        <div className={itemClass} onClick={() => handleCancelUpload(item.id)}>
          Cancel
        </div>
      </div>
    );
  }

  return (
    <div className={menuClass}>
      <div
        className={itemClass}
        onClick={() =>
          (window.location.href = `${BASE_URL}/file/${item.id}?action=download`)
        }
      >
        Download
      </div>
      <div
        className={itemClass}
        onClick={() => openRenameModal("file", item.id, item.name)}
      >
        Rename
      </div>
      <div className={itemClass} onClick={() => setDeleteItem(item)}>
        Delete
      </div>
      <div className={itemClass} onClick={() => openDetailsPopup(item)}>
        Details
      </div>
    </div>
  );
}

export default ContextMenu;
