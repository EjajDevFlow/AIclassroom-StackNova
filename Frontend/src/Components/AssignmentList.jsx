import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaFileAlt, FaSpinner, FaCalendar } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { getAuth } from 'firebase/auth';

const AssignmentList = () => {
  const { classId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector(state => state.appSlice.user);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const fetchAssignments = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const idToken = await currentUser.getIdToken(true);
      console.log('Got fresh token for assignments');

      const response = await axios.get(
        `http://localhost:3000/api/assignments/classroom/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const uniqueAssignments = Array.from(
        new Map(response.data.map(item => [item._id, item])).values()
      );

      setAssignments(uniqueAssignments);
      console.log('Fetched assignments:', uniqueAssignments);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Error fetching assignments');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded m-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 sm:text-xl md:text-2xl lg:text-3xl">Assignments</h2>
        {user?.isAdmin && (
          <Link
            to={`/classroom/${classId}/create-assignment`}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 transition sm:px-3 sm:py-2"
          >
            Create Assignment
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map(assignment => (
          <div
            key={assignment._id}
            className="bg-white dark:bg-gray-800 border border-white dark:border-gray-300 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between dark:border-white dark:border-opacity-10 border-b border-gray-200 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:text-lg md:text-xl">{assignment.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 sm:text-sm md:text-base">{assignment.description}</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <FaFileAlt className="mr-2" />
                  <span className="truncate max-w-[180px] sm:max-w-[150px]">{`Created at ${assignment.createdAt}`}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FaCalendar className="mr-2" />
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-xs md:text-sm">
                Created: {new Date(assignment.createdAt).toLocaleDateString()}
              </span>
              <Link
                to={`/classroom/${classId}/assignments/${assignment._id}`}
                className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 transition sm:px-3 sm:py-2"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8 sm:text-sm md:text-base">
          No assignments available yet.
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
