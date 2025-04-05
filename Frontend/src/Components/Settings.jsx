import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FiTrash, FiUpload, FiUser } from "react-icons/fi";

function Settings() {
  const user = useSelector((store) => store.appSlice.user);

  const handleDeleteProfile = () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      alert("Profile deleted successfully.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
          Settings
        </h1>

        {/* Profile Section */}
        <div className="mt-6 text-center">
          <img
            src={user.photo}
            alt="Profile"
            className="w-24 h-24 mx-auto rounded-full shadow-md border-4 border-gray-300 dark:border-gray-600"
          />
          <label
            htmlFor="profile-upload"
            className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
          >
            <FiUpload className="text-lg" /> Change Profile Picture
          </label>
          <input
            type="file"
            id="profile-upload"
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Update Name */}
        <div className="mt-6">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">
            Update Name:
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={user.name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white focus:ring focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Delete Profile */}
        <button
          onClick={handleDeleteProfile}
          className="mt-6 w-full px-4 py-2 rounded-lg bg-red-600 text-white flex items-center justify-center gap-2 hover:bg-red-700"
        >
          <FiTrash className="text-lg" /> Delete Profile
        </button>
      </div>
    </div>
  );
}

export default Settings;
