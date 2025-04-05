import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaTrash,
  FaSignOutAlt,
  FaPlus,
  FaCrown,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

function Classroom() {
  const [classrooms, setClassrooms] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedClassroomId, setCopiedClassroomId] = useState(null);

  const itemsPerPage = 9;
  const user = useSelector((store) => store.appSlice.user);

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(
          `http://localhost:3000/api/classrooms/user/${user._id}`
        );
        setClassrooms(res.data.classrooms);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    fetchClassrooms();
  }, [user?._id]);

  const handleCopy = (joinLink, classroomId) => {
    navigator.clipboard.writeText(joinLink);
    setCopiedClassroomId(classroomId);
    setTimeout(() => setCopiedClassroomId(null), 1000);
  };

  const handleLeaveClassroom = async (classroomId) => {
    try {
      const res = await axios.put(
        "http://localhost:3000/api/classrooms/leave",
        {
          classroomId,
          userId: user._id,
        }
      );
      alert(res.data.message);
      setClassrooms(
        classrooms.filter((classroom) => classroom._id !== classroomId)
      );
    } catch (error) {
      console.error("Error leaving classroom:", error);
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/classrooms/delete",
        {
          classroomId,
          adminId: user._id,
        }
      );

      alert(res.data.message);
      setClassrooms(
        classrooms.filter((classroom) => classroom._id !== classroomId)
      );
    } catch (error) {
      console.error(
        "Error deleting classroom:",
        error.response?.data || error.message
      );
    }
  };

  // Filtering and Pagination
  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredClassrooms.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClassrooms = filteredClassrooms.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
        Your Classrooms
      </h1>

      {/* Search Bar with Join/Create Buttons */}
      <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search Classroom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Link
            to="/joinClass"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus /> Join Classroom
          </Link>
          <Link
            to="/createClass"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaPlus /> Create Classroom
          </Link>
        </div>
      </div>

      {/* Classroom Cards */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {currentClassrooms.map((classroom) => (
          <div
            key={classroom._id}
            className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col justify-between border border-gray-200 dark:border-gray-700"
          >
            {classroom.admin._id === user._id && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <FaCrown className="text-sm" /> Admin
              </div>
            )}

            <Link to={`/classroom/${classroom._id}`} className="block">
              <div className="flex items-center gap-4">
                <img
                  src={classroom.admin.photo}
                  alt="Classroom"
                  className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <FaChalkboardTeacher className="text-blue-600 dark:text-blue-400" />
                    {classroom.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Admin:{" "}
                    <span className="font-medium">{classroom.admin.name}</span>
                  </p>
                </div>
              </div>
            </Link>

            {classroom.admin._id === user._id && (
              <div className="mt-4 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shadow-inner">
                <input
                  type="text"
                  value={classroom.joinLink}
                  readOnly
                  className="flex-1 px-3 py-1 border rounded-lg bg-transparent dark:text-white cursor-text"
                />
                <button
                  onClick={() => handleCopy(classroom.joinLink, classroom._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform active:scale-90"
                >
                  {copiedClassroomId === classroom._id ? "Copied!" : "Copy"}
                </button>
              </div>
            )}

            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 flex items-center gap-1">
              <FaUserGraduate className="text-green-500" />{" "}
              {classroom.students.length} students
            </p>

            <div className="flex justify-between mt-5">
              {classroom.admin._id === user._id ? (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
                  onClick={() => handleDeleteClassroom(classroom._id)}
                >
                  <FaTrash /> Delete
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow"
                  onClick={() => handleLeaveClassroom(classroom._id)}
                >
                  <FaSignOutAlt /> Leave
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          disabled={currentPage === 1}
        >
          <FaArrowLeft /> Prev
        </button>

        <span className="text-gray-800 dark:text-white font-semibold">
          {currentPage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          disabled={currentPage === totalPages}
        >
          Next <FaArrowRight />
        </button>
      </div>
    </div>
  );
}

export default Classroom;
