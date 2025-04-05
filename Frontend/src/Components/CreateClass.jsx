import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreateClass = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const user = useSelector((store) => store.appSlice.user);
  const navigate = useNavigate();

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Classroom name is required!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/api/classrooms/create",
        {
          name,
          description,
          adminId: user?._id, // Send email instead of ID
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Classroom Created Successfully!");
      navigate("/classroom"); // Redirect to the classroom page
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="relative bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-90 shadow-2xl rounded-2xl p-8 w-full max-w-md backdrop-blur-lg">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 text-center mb-6">
          🎓 Create a Classroom
        </h2>

        {/* Form */}
        <form onSubmit={handleCreateClassroom} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Classroom Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 transition duration-300"
              placeholder="Enter classroom name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 transition duration-300"
              placeholder="Add a brief description"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
          >
            🚀 Create Classroom
          </button>
        </form>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900 opacity-10 rounded-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default CreateClass;
