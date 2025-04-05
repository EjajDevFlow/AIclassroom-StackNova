import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  useNavigate,
  useParams,
  Outlet,
  useOutletContext,
} from "react-router-dom";

const AttendanceMain = () => {
  const { classDetails } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const user = useSelector((store) => store.appSlice.user);
  const navigate = useNavigate();
  const { classId } = useParams();

  const today = new Date().toISOString().split("T")[0]; // Get today's date
  const isFutureDate = selectedDate > today; // Check if selected date is in the future

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    if (classDetails && classDetails.students) {
      setStudents(classDetails.students);
    }
  }, [classDetails]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/attendance/get/${selectedDate}`
        );
        const attendanceData = response.data.reduce((acc, record) => {
          acc[record.student._id] = record.status;
          return acc;
        }, {});
        setAttendance(attendanceData);
      } catch (error) {
        console.error(
          "Error fetching attendance:",
          error.response?.data?.message || error.message
        );
      }
    };

    fetchAttendance();
  }, [selectedDate]);

  const markAttendance = async (studentId, status) => {
    if (attendance[studentId] || isFutureDate) return;
    try {
      const response = await axios.post(
        "http://localhost:3000/api/attendance/mark",
        {
          studentId,
          date: selectedDate,
          status,
        }
      );

      if (response.status === 201) {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
      }
    } catch (error) {
      console.error(
        "Error marking attendance:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    navigate(`/classroom/${classId}/attendance/${newDate}`);
  };

  const goToMonthlyAttendance = (monthIndex) => {
    const monthName = months[monthIndex];
    navigate(`/classroom/${classId}/attendance/monthly/${monthName}`);
  };

  const isAdmin = classDetails?.admin?._id === user?._id;

  return (
    <div className="min-h-[80vh] overflow-hidden bg-gray-100 dark:bg-gray-900 px-2 flex flex-col items-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 py-4 w-full max-w-screen-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left text-gray-900 dark:text-gray-100">
            Student Attendance
          </h1>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <FaCalendarAlt className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border p-2 rounded-md shadow-sm cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-3 py-5 rounded-md bg-white dark:bg-gray-800 shadow-2xl w-full">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => goToMonthlyAttendance(index)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold p-2 rounded-md shadow-md hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition w-full sm:w-auto"
            >
              {month}
            </button>
          ))}
        </div>

        <Outlet />

        <div className="space-y-4 w-full">
          {students.map((student) => (
            <motion.div
              key={student._id}
              className="flex flex-col sm:flex-row items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={student.photo || "https://via.placeholder.com/50"}
                alt={student.name}
                className="w-12 h-12 rounded-full border shadow-sm"
              />
              <div className="ml-4 flex-1 text-center sm:text-left">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {student.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {student.email}
                </p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => markAttendance(student._id, "Present")}
                      disabled={attendance[student._id] || isFutureDate}
                      className={`px-4 py-2 rounded-md transition font-medium text-white ${
                        attendance[student._id] === "Present"
                          ? "bg-green-500 cursor-not-allowed"
                          : isFutureDate
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-500"
                      }`}
                    >
                      {attendance[student._id] === "Present" ? (
                        <FaCheckCircle className="w-5 h-5" />
                      ) : (
                        "Present"
                      )}
                    </button>

                    <button
                      onClick={() => markAttendance(student._id, "Absent")}
                      disabled={attendance[student._id] || isFutureDate}
                      className={`px-4 py-2 rounded-md transition font-medium text-white ${
                        attendance[student._id] === "Absent"
                          ? "bg-red-500 cursor-not-allowed"
                          : isFutureDate
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-500"
                      }`}
                    >
                      {attendance[student._id] === "Absent" ? (
                        <FaTimesCircle className="w-5 h-5" />
                      ) : (
                        "Absent"
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceMain;
