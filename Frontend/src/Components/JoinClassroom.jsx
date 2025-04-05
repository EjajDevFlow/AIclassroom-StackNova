import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JoinClassroom = () => {
  const user = useSelector((store) => store.appSlice.user);
  const userId = user?._id;
  const [joinLink, setJoinLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Use useNavigate hook

  const handleJoinClassroom = async () => {
    if (!joinLink.trim()) {
      setError("Join link is required.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/classrooms/join",
        {
          userId,
          joinLink,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage(response.data.message);
      setJoinLink(""); // Clear input after success
      setTimeout(() => {
        navigate("/classroom"); // Correct navigation
      }, 1000); // Delay navigation to let message show
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-[10%]">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Join a Classroom
      </h2>
      <input
        type="text"
        value={joinLink}
        onChange={(e) => setJoinLink(e.target.value)}
        placeholder="Enter join link..."
        className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
      />
      <button
        onClick={handleJoinClassroom}
        className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Joining..." : "Join Classroom"}
      </button>

      {message && <p className="text-green-600 mt-3">{message}</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
};

export default JoinClassroom;
