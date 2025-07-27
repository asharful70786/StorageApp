import { useEffect, useRef } from "react";

function CreateDirectoryModal({
  newDirname,
  setNewDirname,
  onClose,
  onCreateDirectory,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleOverlayClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md"
        onClick={handleContentClick}
      >
        <h2 className="text-lg font-semibold mb-4">Create a new directory</h2>
        <form onSubmit={onCreateDirectory}>
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter folder name"
            value={newDirname}
            onChange={(e) => setNewDirname(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              type="submit"
            >
              Create
            </button>
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDirectoryModal;
