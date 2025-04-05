import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const MonthlyAttendance = () => {
  const { month, classId } = useParams(); 
  const navigate = useNavigate();
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/attendance/monthly/${month}`);
        setStudentAttendance(response.data);
      } catch (error) {
        console.error("Error fetching monthly attendance:", error.response?.data?.message || error.message);
        setError("Failed to fetch attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyAttendance();
  }, [month]);

  return (
    <div className="min-h-[90vh] bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <button 
          onClick={() => navigate(`/classroom/${classId}/attendance`)} 
          className="mb-4 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded w-full sm:w-auto hover:bg-blue-600 dark:hover:bg-blue-800"
        >
          Back
        </button>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Attendance for {month}
        </h1>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : studentAttendance.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No attendance records found for this month.</p>
        ) : (
          <ul className="space-y-3">
            {studentAttendance.map((student) => (
              <li key={student._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                <p className="text-gray-500 dark:text-gray-300">Present Days: {student.presentDays}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MonthlyAttendance;
