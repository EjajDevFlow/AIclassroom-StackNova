import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaFileUpload,
  FaSpinner,
  FaFilePdf,
  FaDownload,
  FaCalendar,
  FaUser,
  FaEdit,
  FaTrash,
  FaGraduationCap,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { getAuth } from "firebase/auth";

const AssignmentDetails = () => {
  const { classId, assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAssignment, setEditedAssignment] = useState(null);
  const user = useSelector((state) => state.appSlice.user);
  const auth = getAuth();
  const navigate = useNavigate();
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      const idToken = await currentUser.getIdToken(true);

      // Fetch assignment details
      const assignmentResponse = await axios.get(
        `http://localhost:3000/api/assignments/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setAssignment(assignmentResponse.data);
      setEditedAssignment(assignmentResponse.data);

      // If user is admin, fetch all submissions
      if (assignmentResponse.data.createdBy === currentUser.uid) {
        const submissionsResponse = await axios.get(
          `http://localhost:3000/api/submissions/assignment/${assignmentId}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        console.log("Fetched submissions:", submissionsResponse.data);
        setSubmissions(submissionsResponse.data);
      } else {
        // If user is student, fetch their submission
        try {
          const submissionResponse = await axios.get(
            `http://localhost:3000/api/submissions/student/${assignmentId}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          console.log("Fetched student submission:", submissionResponse.data);
          setSubmissions([submissionResponse.data]);
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error("Error fetching submission:", err);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching assignment details:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(
          err.response?.data?.message || "Error loading assignment details"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditAssignment = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      const idToken = await currentUser.getIdToken(true);

      await axios.put(
        `http://localhost:3000/api/assignments/${assignmentId}`,
        editedAssignment,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      setAssignment(editedAssignment);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating assignment:", err);
      setError(err.response?.data?.message || "Error updating assignment");
    }
  };

  const handleEvaluateAll = async () => {
    try {
      setEvaluating(true);
      setError(null);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      const idToken = await currentUser.getIdToken(true);

      const response = await axios.post(
        `http://localhost:3000/api/assignments/${assignmentId}/evaluate-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      console.log("Evaluation response:", response.data);

      // Wait a moment to ensure all updates are processed
      setTimeout(async () => {
        await fetchAssignmentDetails();
        setEvaluating(false);
      }, 1000);
    } catch (err) {
      console.error("Error evaluating submissions:", err);
      setError(err.response?.data?.message || "Error evaluating submissions");
      setEvaluating(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a PDF file");
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF file to submit");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      const idToken = await currentUser.getIdToken(true);

      // First upload the file
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await axios.post(
        "http://localhost:3000/api/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Then create the submission
      await axios.post(
        "http://localhost:3000/api/submissions/create",
        {
          assignmentId,
          pdfUrl: uploadResponse.data.url,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh the assignment details to show the new submission
      await fetchAssignmentDetails();
      setSelectedFile(null);
    } catch (err) {
      console.error("Error submitting assignment:", err);
      setError(err.response?.data?.message || "Error submitting assignment");
    } finally {
      setSubmitting(false);
    }
  };
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Assignment not found
        </div>
      </div>
    );
  }

  const isAdmin = auth.currentUser?.uid === assignment.createdBy;
  const isDeadlinePassed = new Date() > new Date(assignment.dueDate);
  const hasSubmitted = submissions.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-800 dark:text-white">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <div className="flex space-x-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate(`/classroom/${classId}/assignments`)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Back to Assignments
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700"
                >
                  Edit Assignment
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 dark:text-gray-300">
          <div className="flex items-center">
            <FaUser className="mr-2" />
            <span>Created by {assignment.createdBy}</span>
          </div>
          <div className="flex items-center">
            <FaCalendar className="mr-2" />
            <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
          </div>
        </div>

        <div className="prose max-w-none mb-8 dark:prose-invert">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {assignment.description}
          </p>
        </div>

        {assignment.contentPdfUrl && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Assignment Content</h2>
            <a
              href={assignment.contentPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-white dark:hover:bg-blue-800"
            >
              <FaFilePdf className="mr-2" />
              View Assignment PDF
            </a>
          </div>
        )}

        {isAdmin && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Answer Key</h2>
            <a
              href={assignment.primaryPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-700 dark:text-white dark:hover:bg-red-600"
            >
              <FaFilePdf className="mr-2" />
              View Answer Key
            </a>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Student Submissions</h2>
          {isAdmin && submissions.length > 0 && (
            <button
              onClick={handleEvaluateAll}
              disabled={evaluating}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 dark:bg-green-800 dark:hover:bg-green-700"
            >
              {evaluating ? (
                <>
                  <FaSpinner className="inline animate-spin mr-2" />
                  Evaluating...
                </>
              ) : (
                <>
                  <FaGraduationCap className="inline mr-2" />
                  Evaluate All Submissions
                </>
              )}
            </button>
          )}

          {submissions.map((submission) => (
            <div
              key={submission._id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  {isAdmin && (
                    <p className="font-semibold">
                      Student ID: {submission.studentId}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submitted:{" "}
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                  {isAdmin && submission.score !== undefined && (
                    <p className="text-lg font-bold text-green-600 mt-2">
                      Score: {submission.score}/100
                    </p>
                  )}
                </div>
                <a
                  href={submission.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700"
                >
                  <FaDownload className="inline mr-2" />
                  View Submission
                </a>
              </div>
              {isAdmin && submission.feedback && (
                <div className="mt-4 bg-white p-4 rounded dark:bg-gray-800">
                  <h4 className="font-semibold mb-2">Feedback:</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {submission.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}

          {!isAdmin && !isDeadlinePassed && (
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload Your Submission (PDF only)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-white dark:hover:file:bg-blue-800"
                />
              </div>
              {error && (
                <div className="mb-4 text-red-600 text-sm dark:text-red-400">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || !selectedFile}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="inline animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaFileUpload className="inline mr-2" />
                    Submit Assignment
                  </>
                )}
              </button>
            </form>
          )}

          {isDeadlinePassed && !isAdmin && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                Submission Deadline Passed
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                The deadline for this assignment was{" "}
                {new Date(assignment.dueDate).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;
