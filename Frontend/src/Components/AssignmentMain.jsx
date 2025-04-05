import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBook, FaPlus, FaList } from "react-icons/fa";
import { getAuth } from "firebase/auth";

const AssignmentMain = () => {
  const { classId } = useParams();
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.appSlice.user);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!classId || !user?._id) return;
      setLoading(true);
      try {
        // Get fresh token
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("User not authenticated");
        }
        const idToken = await currentUser.getIdToken(true);

        // Get classroom details
        const classResponse = await axios.get(
          `http://localhost:3000/api/classrooms/${classId}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );

        setClassDetails(classResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          setError(
            error.response?.data?.message || "Failed to load classroom details"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, user?._id, auth]);

  // Check if the current user is the admin of the classroom
  const isAdmin = classDetails?.admin?._id === user?._id;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-800 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      

      {classDetails && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {classDetails.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                  {classDetails.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Admin: <span className="font-semibold">{classDetails.adminName || "Unknown"}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {/* Assignments Section */}
            <div className="bg-blue-50 dark:bg-gray-800 p-5 sm:p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaBook className="text-blue-500 text-2xl sm:text-3xl mr-3" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    Assignments
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  {isAdmin && (
                    <Link
                      to={`/classroom/${classId}/assignments/create-assignment`}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md text-sm sm:text-base"
                    >
                      <FaPlus className="mr-2" />
                      New Assignment
                    </Link>
                  )}
                  <Link
                    to={`/classroom/${classId}/assignments`}
                    className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all shadow-sm text-sm sm:text-base"
                  >
                    <FaList className="mr-2" />
                    View All
                  </Link>
                </div>
              </div>

              {/* Here the Outlet will render either the assignment list or details */}
              <Outlet />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentMain;