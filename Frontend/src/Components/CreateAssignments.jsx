import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFileUpload, FaSpinner, FaFileAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CreateAssignment = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.appSlice.user);
  const auth = getAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentPdf: null,
    primaryPdf: null,
    dueDate: "",
  });

  useEffect(() => {
    // Check authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentPdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({
        ...prev,
        contentPdf: file,
      }));
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handlePrimaryPdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({
        ...prev,
        primaryPdf: file,
      }));
      setError(null);
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if user is logged in
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to create an assignment");
      }

      // Get fresh token
      const idToken = await currentUser.getIdToken(/* forceRefresh */ true);
      console.log("Got fresh token");

      // Create axios instance with default headers
      const axiosInstance = axios.create({
        baseURL: "http://localhost:3000",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      let contentUrl = "";
      let primaryPdfUrl = "";

      // Upload content PDF if content type is PDF
      if (formData.contentPdf) {
        console.log("Uploading content PDF...");
        const contentFormData = new FormData();
        contentFormData.append("file", formData.contentPdf);

        // Make sure to include the token in the headers
        const contentUploadResponse = await axiosInstance.post(
          "/api/upload",
          contentFormData,
          {
            headers: {
              ...axiosInstance.defaults.headers,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        contentUrl = contentUploadResponse.data.url;
        console.log("Content PDF uploaded:", contentUrl);
      }

      // Upload primary PDF (answer key)
      if (formData.primaryPdf) {
        console.log("Uploading primary PDF...");
        const primaryFormData = new FormData();
        primaryFormData.append("file", formData.primaryPdf);

        // Make sure to include the token in the headers
        const primaryUploadResponse = await axiosInstance.post(
          "/api/upload",
          primaryFormData,
          {
            headers: {
              ...axiosInstance.defaults.headers,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        primaryPdfUrl = primaryUploadResponse.data.url;
        console.log("Primary PDF uploaded:", primaryPdfUrl);
      }

      // Create assignment
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        contentPdfUrl: contentUrl,
        primaryPdfUrl: primaryPdfUrl,
        classroomId: classId,
        dueDate: formData.dueDate,
      };

      console.log("Creating assignment with data:", assignmentData);

      // Make sure to include the token in the headers
      const response = await axiosInstance.post(
        "/api/assignments/create",
        assignmentData,
        {
          headers: {
            ...axiosInstance.defaults.headers,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Assignment created:", response.data);

      // Navigate back to assignments list
      navigate(`/classroom/${classId}/assignments`);
    } catch (err) {
      console.error("Error creating assignment:", err);
      let errorMessage = "Error creating assignment. Please try again.";

      if (err.response) {
        // Server responded with an error
        errorMessage = err.response.data.message || errorMessage;
        console.error("Server error details:", err.response.data);
      } else if (err.request) {
        // Request was made but no response
        errorMessage = "Server not responding. Please try again later.";
        console.error("No response received:", err.request);
      } else {
        // Error setting up the request
        errorMessage = err.message;
        console.error("Request setup error:", err.message);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Assignment</h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        id="createAssignmentForm"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Assignment Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            placeholder="Brief description of the assignment..."
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Due Date
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="contentPdf"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Assignment PDF (Visible to Students)
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
              <FaFileUpload className="mr-2" aria-hidden="true" />
              Upload Assignment PDF
              <input
                type="file"
                id="contentPdf"
                name="contentPdf"
                accept=".pdf"
                onChange={handleContentPdfChange}
                className="hidden"
                aria-required="false"
              />
            </label>
            {formData.contentPdf && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formData.contentPdf.name}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You can optionally upload a PDF file containing the assignment
            content.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label
            htmlFor="primaryPdf"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Primary PDF (Answer Key - Hidden from Students)
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md cursor-pointer hover:bg-red-700">
              <FaFileUpload className="mr-2" aria-hidden="true" />
              Upload Answer Key
              <input
                type="file"
                id="primaryPdf"
                name="primaryPdf"
                accept=".pdf"
                onChange={handlePrimaryPdfChange}
                className="hidden"
                required
                aria-required="true"
              />
            </label>
            {formData.primaryPdf && (
              <span
                className="text-sm text-gray-600 dark:text-gray-400"
                role="status"
              >
                {formData.primaryPdf.name}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This PDF will be used to evaluate student submissions and won't be
            visible to students.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
              <span>Creating Assignment...</span>
            </>
          ) : (
            "Create Assignment"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateAssignment;
