import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Home() {
  const user = useSelector((store) => store.appSlice.user);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white flex flex-col items-center justify-start p-20">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-3xl font-thin text-gray-800 dark:text-white">{user.name}</h2>
        <br />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Welcome to AI Classroom
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Enhancing education with AI-powered features
        </p>

        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/joinClass"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Join Classroom
          </Link>
          <Link
            to="/createClass"
            className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
          >
            Create Classroom
          </Link>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="mt-10 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          📢 Recent Announcements
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">No new announcements</p>
      </div>
    </div>
  );
}

export default Home;
