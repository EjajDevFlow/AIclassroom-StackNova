import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux"; // Importing useSelector
import { FaTrashAlt } from "react-icons/fa"; // Trash icon
import { FiUserPlus, FiUserMinus } from "react-icons/fi"; // Icons for promote/demote
import axios from "axios"; // Importing axios for API calls
import { useState, useEffect } from "react";

const PeopleSection = () => {
  const { classDetails: initialClassDetails } = useOutletContext();
  const [classDetails, setClassDetails] = useState(initialClassDetails); // Initialize state with outlet context
  const user = useSelector((store) => store.appSlice.user); // Access user from Redux store

  useEffect(() => {
    if (!classDetails) return; // Return if classDetails is not available yet.

    const fetchClassroomDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/classrooms/${classDetails._id}`
        );
        setClassDetails(response.data);
      } catch (error) {
        console.error("Error fetching classroom details:", error);
      }
    };

    fetchClassroomDetails();
  }, [classDetails?._id]); // Refetch when classDetails._id changes

  const handleRemoveUser = async (userId) => {
    try {
      // API call to remove user from the classroom
      const response = await axios.post(
        "http://localhost:3000/api/classrooms/remove-user",
        {
          classroomId: classDetails._id, // Pass classroomId from state
          userId, // Pass userId to remove
          adminId: user._id, // Pass the adminId (logged-in user's ID)
        }
      );

      if (response.status === 200) {
        // Successfully removed user, update the classroom details
        const updatedClassroom = await axios.get(
          `http://localhost:3000/api/classrooms/${classDetails._id}`
        );
        setClassDetails(updatedClassroom.data);
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const handlePromoteDemoteUser = async (userId, isPromote) => {
    try {
      const action = isPromote ? "promote" : "demote";
      const response = await axios.put(
        "http://localhost:3000/api/classrooms/update-admin",
        {
          classroomId: classDetails._id,
          userId,
          action,
          adminId: user._id, // Use the logged-in user's ID as the admin performing the action
        }
      );

      if (response.status === 200) {
        // Successfully promoted/demoted user, refetch classroom details
        const updatedClassroom = await axios.get(
          `http://localhost:3000/api/classrooms/${classDetails._id}`
        );
        setClassDetails(updatedClassroom.data); // Update state with the latest classroom data
      }
    } catch (error) {
      console.error("Error promoting/demoting user:", error);
    }
  };

  if (!classDetails) {
    return <p>Loading...</p>; // Handle the loading state if classDetails is null or undefined
  }

  return (
    <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">People</h2>
      <p>
        <strong>Total Students:</strong> {classDetails.students?.length || 0}
      </p>

      {/* Display Admin */}
      {classDetails.admin && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Admin
          </h3>
          <div className="flex items-center space-x-4">
            <img
              src={classDetails.admin.photo || "/default-avatar.png"}
              alt={classDetails.admin.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {classDetails.admin.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {classDetails.admin.email}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Display Secondary Admins */}
      {classDetails.secondaryAdmins?.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Secondary Admins
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {classDetails.secondaryAdmins.map((admin, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md flex flex-col items-center space-y-4"
              >
                <img
                  src={admin.photo || "/default-avatar.png"}
                  alt={admin.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {admin.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {admin.email}
                  </span>
                </div>
                {/* Show actions only if logged-in user is the admin */}
                {user?._id === classDetails.admin._id && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleRemoveUser(admin._id)}
                      className="bg-red-600 dark:bg-red-500 text-white p-2 rounded-full hover:bg-red-700 dark:hover:bg-red-400 transition"
                    >
                      <FaTrashAlt size={18} />
                    </button>
                    <button
                      onClick={() => handlePromoteDemoteUser(admin._id, false)} // Demote
                      className="bg-yellow-600 dark:bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-700 dark:hover:bg-yellow-400 transition"
                    >
                      <FiUserMinus size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Students */}
      {classDetails.students?.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Students
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {classDetails.students.map((student, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md flex flex-col items-center space-y-4"
              >
                <img
                  src={student.photo || "/default-avatar.png"}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {student.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {student.email}
                  </span>
                </div>
                {/* Show actions only if logged-in user is the admin */}
                {user?._id === classDetails.admin._id && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleRemoveUser(student._id)}
                      className="bg-red-600 dark:bg-red-500 text-white p-2 rounded-full hover:bg-red-700 dark:hover:bg-red-400 transition"
                    >
                      <FaTrashAlt size={18} />
                    </button>
                    <button
                      onClick={() => handlePromoteDemoteUser(student._id, true)} // Promote to secondaryAdmin
                      className="bg-blue-600 dark:bg-blue-500 text-white p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-400 transition"
                    >
                      <FiUserPlus size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PeopleSection;
