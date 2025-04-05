import React, { useState, useEffect } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom'; // Use useParams for classId
import axios from 'axios'; // Import axios
import { FaBars, FaCommentDots, FaTasks, FaUsers, FaCalendarCheck } from 'react-icons/fa'; // Import FaBars

const ClassHome = () => {
  const { classId } = useParams(); // Fetch classId from URL params
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [classDetails, setClassDetails] = useState(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) return;
      try {
        const response = await axios.get(`http://localhost:3000/api/classrooms/${classId}`);
        setClassDetails(response.data); // Store class details in state
      } catch (error) {
        console.error('Error fetching class details:', error);
      }
    };

    fetchClassDetails(); // Fetch the class details on component mount
  }, [classId]);

  if (!classDetails) {
    return <div>Loading class details...</div>; // Show a loading state if classDetails are not yet fetched
  }

  return (
    <div className="w-full min-h-[90vh] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle */}
      <button
        className="rounded-md md:hidden p-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <FaBars className="text-xl" />
      </button>

      {/* Sidebar Navigation */}
      <nav
        className={`absolute rounded-md md:relative w-64 bg-gray-50 dark:bg-gray-800 p-4 border-r border-gray-300 dark:border-gray-700 min-h-[90vh] transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out md:block z-50`}
      >
        {[{ name: 'Main', icon: <FaCommentDots />, id: '' },
          { name: 'Assignments', icon: <FaTasks />, id: 'assignments' },
          { name: 'People', icon: <FaUsers />, id: 'people' },
          { name: 'Attendance', icon: <FaCalendarCheck />, id: 'attendance' }
        ].map(({ name, icon, id }) => (
          <Link
            key={id}
            to={`/classroom/${classId}/${id}`} // Navigate to the corresponding route
            onClick={() => setIsSidebarOpen(false)} // Close sidebar on selection
            className="w-full flex items-center gap-3 p-3 text-lg rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {icon} {name}
          </Link>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 px-6">
        {/* Pass classDetails as context to Outlet */}
        <Outlet context={{ classDetails }} />
      </main>
    </div>
  );
};

export default ClassHome;
