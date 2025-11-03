import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import {
  FaFolderPlus,
  FaUpload,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaCog,
  FaCloud,
  FaCrown
} from "react-icons/fa";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userPicture, setUserPicture] = useState("");
  const [maxStorageInBytes, setMaxStorageInBytes] = useState(1073741824);
  const [usedStorageInBytes, setUsedStorageInBytes] = useState(0);
  const usedGB = usedStorageInBytes / 1024 ** 3;
  const totalGB = maxStorageInBytes / 1024 ** 3;
  const storagePercentage = (usedGB / totalGB) * 100;

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser();
        setUserName(user.name);
        setUserEmail(user.email);
        setMaxStorageInBytes(user.maxStorageInBytes);
        setUsedStorageInBytes(user.usedStorageInBytes);
        setLoggedIn(true);
      } catch (err) {
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
      }
    }
    loadUser();
  }, []);

  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      navigate("/login");
    } catch (err) {
      console.error("Logout all error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  useEffect(() => {
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const getStorageColor = () => {
    if (storagePercentage > 90) return "bg-red-500";
    if (storagePercentage > 75) return "bg-yellow-500";
    return "bg-gradient-to-r from-blue-500 to-purple-600";
  };

  return (
    <div className="bg-white px-6 py-4 border-b border-gray-100">
      {/* Main Header Row */}
      <div className="flex items-center justify-between">
        {/* Breadcrumb and Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="text-lg">←</span>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {directoryName}
            </h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span>All files</span>
              <span className="mx-2">•</span>
              <span>{usedGB.toFixed(1)} GB used</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Create Folder Button */}
          <button
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all ${
              disabled 
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-95"
            }`}
            onClick={onCreateFolderClick}
            disabled={disabled}
          >
            <FaFolderPlus className="text-lg" />
            <span className="font-medium">New Folder</span>
          </button>

          {/* Upload Button */}
          <button
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all ${
              disabled
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white hover:shadow-lg active:scale-95"
            }`}
            onClick={onUploadFilesClick}
            disabled={disabled}
          >
            <FaUpload className="text-lg" />
            <span className="font-medium">Upload</span>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleUserIconClick}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                showUserMenu
                  ? "bg-gray-100 border-gray-300"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {userPicture ? (
                <img
                  className="w-8 h-8 rounded-lg object-cover"
                  src={userPicture}
                  alt={userName}
                />
              ) : (
                <FaUser className="text-gray-600 text-lg" />
              )}
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
                {loggedIn ? (
                  <>
                    {/* User Info Section */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          {userPicture ? (
                            <img
                              className="w-10 h-10 rounded-lg object-cover"
                              src={userPicture}
                              alt={userName}
                            />
                          ) : (
                            <FaUser className="text-white text-xl" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {userName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {userEmail}
                          </p>
                        </div>
                      </div>

                      {/* Storage Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Storage</span>
                          <span className="font-medium text-gray-900">
                            {usedGB.toFixed(1)} GB of {totalGB} GB
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getStorageColor()}`}
                            style={{ width: `${storagePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/plans"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <FaCrown className="text-white text-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Upgrade Storage</div>
                          <div className="text-sm text-gray-500">Get more space and features</div>
                        </div>
                      </Link>

                      <Link
                        to="/subscription"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FaCloud className="text-gray-600 text-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Manage Subscription</div>
                          <div className="text-sm text-gray-500">Billing and plans</div>
                        </div>
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group w-full text-left"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FaSignOutAlt className="text-gray-600 text-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Logout</div>
                          <div className="text-sm text-gray-500">Sign out from this device</div>
                        </div>
                      </button>

                      <button
                        onClick={handleLogoutAll}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group w-full text-left"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FaSignOutAlt className="text-gray-600 text-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Logout All Sessions</div>
                          <div className="text-sm text-gray-500">Sign out from all devices</div>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Guest User View */
                  <div className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaUser className="text-gray-400 text-2xl" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Guest User</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Sign in to access your files across devices
                      </p>
                      <button
                        onClick={() => {
                          navigate("/login");
                          setShowUserMenu(false);
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

 
    </div>
  );
}

export default DirectoryHeader;