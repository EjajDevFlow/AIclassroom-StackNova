import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaFileUpload, FaSpinner } from 'react-icons/fa';

const SubmitAssignment = () => {
  const { classId, assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/assignments/${assignmentId}`
      );
      setAssignment(response.data);
      
      // Check if user has already submitted
      const userSubmission = response.data.submissions.find(
        sub => sub.studentId === localStorage.getItem('userId')
      );
      if (userSubmission) {
        setSubmission(userSubmission);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    if (!file) {
      setError('Please select a PDF file');
      setSubmitting(false);
      return;
    }

    try {
      // First, upload the PDF file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post(
        'http://localhost:3000/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Then submit the assignment
      await axios.post(
        `http://localhost:3000/api/assignments/${assignmentId}/submit`,
        {
          pdfUrl: uploadResponse.data.url
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(true);
      fetchAssignment(); // Refresh to show the submission
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        Assignment not found
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{assignment.title}</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-gray-600 mb-4">{assignment.description}</p>
      </div>

      {submission ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-semibold mb-2">Your Submission</h3>
          <p>Submitted on: {new Date(submission.submittedAt).toLocaleString()}</p>
          {submission.score !== null && (
            <div className="mt-2">
              <p>Score: {submission.score}/100</p>
              <p className="mt-2">Feedback: {submission.feedback}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Assignment submitted successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Your PDF
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
                <FaFileUpload className="mr-2" />
                Choose PDF
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Assignment'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitAssignment; 