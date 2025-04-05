import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const Attendance = () => {
  const { date, classId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/attendance/get/${date}`);
        setAttendance(response.data.length > 0 ? response.data : []);
      } catch (error) {
        console.error("Error fetching attendance:", error.response?.data?.message || error.message);
      }
    };

    if (date) fetchAttendance();
  }, [date]);

  return (
    <div className="min-h-[90vh] bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 flex flex-col items-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-3xl">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
          Attendance for {date}
        </h1>

        <button 
          onClick={() => navigate(`/classroom/${classId}/attendance`)}
          className="mb-4 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded w-full sm:w-auto hover:bg-blue-600 dark:hover:bg-blue-800"
        >
          Back
        </button>

        <div className="space-y-4">
          {attendance.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No attendance records found.</p>
          ) : (
            attendance.map((record) => (
              <div 
                key={record._id} 
                className="flex flex-col sm:flex-row justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
              >
                <span className="text-sm sm:text-base text-gray-900 dark:text-gray-200">
                  {record.student?.name || "Unknown Student"}
                </span>
                <span 
                  className={`text-sm sm:text-base font-semibold ${
                    record.status === "Present" ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {record.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
