import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaChalkboardTeacher } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/appSlice";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((store) => store.appSlice?.user);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md px-6 py-4 transition-all">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <FaChalkboardTeacher className="text-2xl text-blue-500" />
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            AI Classroom
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-12">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
            Home
          </Link>
          <Link to="/classroom" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
            Classroom
          </Link>
          <Link to="/settings" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
            Settings
          </Link>
        </nav>

        {/* User Profile & Dark Mode Toggle */}
        <div className="hidden md:flex items-center space-x-4 relative">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? <MdLightMode className="text-xl" /> : <MdDarkMode className="text-xl" />}
          </button>

          {/* Profile Image & Dropdown */}
          <div className="relative">
            <img
              src={user?.photo}
              alt="User Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
                <div className="px-4 py-2 border-b dark:border-gray-700">
                  <span className="block text-gray-800 dark:text-gray-300 font-semibold truncate w-40">
                    {user?.name}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400 truncate w-40">
                    {user?.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <FiLogOut className="mr-2 text-lg" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700 dark:text-gray-200">
          {menuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden mt-4 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-all">
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <Link to="/" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/classroom" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500" onClick={() => setMenuOpen(false)}>
                Classroom
              </Link>
            </li>
            <li>
              <Link to="/settings" className="block text-gray-700 dark:text-gray-300 hover:text-blue-500" onClick={() => setMenuOpen(false)}>
                Settings
              </Link>
            </li>
          </ul>

          {/* User Profile & Dark Mode Toggle (Mobile) */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center space-x-3">
              <img src={localStorage.getItem("profileImage")} key={user?.photo} alt="User Profile" className="w-10 h-10 rounded-full" />
              <div className="flex flex-col">
                <span className="text-gray-700 dark:text-gray-300 font-semibold truncate w-32">
                  {user?.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate w-32">
                  {user?.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {darkMode ? <MdLightMode className="text-xl" /> : <MdDarkMode className="text-xl" />}
            </button>
          </div>

          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-t"
          >
            <FiLogOut className="mr-2 text-lg" />
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}

export default Header;
