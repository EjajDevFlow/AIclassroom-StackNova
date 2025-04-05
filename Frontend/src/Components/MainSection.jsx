import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaFileUpload, FaEye } from "react-icons/fa";

const MainSection = () => {
  const { classDetails } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = useSelector((store) => store.appSlice.user);

  const fetchMessages = useCallback(async () => {
    if (!classDetails?._id) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/api/messages/${classDetails._id}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [classDetails]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classDetails?._id || !user?._id) {
      alert("Missing required details!");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("classroomId", classDetails._id);
      formData.append("senderId", user._id);
      formData.append("content", messageText || "");
      if (file) formData.append("file", file);

      const response = await axios.post(
        "http://localhost:3000/api/messages/send",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // ✅ Immediately update state without waiting for fetchMessages()
      setMessages((prevMessages) => [response.data.data, ...prevMessages]);

      setMessageText("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setLoading(false);
  };

  return (
    <section className="max-h-[90vh] overflow-y-scroll bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Overview</h2>
      <div className="flex items-center gap-4 mb-4">
        <img
          src={classDetails?.image}
          alt={classDetails?.name}
          className="w-20 h-20 object-cover rounded-full border dark:border-gray-600"
        />
        <div>
          <p>
            <strong>Admin:</strong> {classDetails?.adminName || "Unknown"}
          </p>
          <p>
            <strong>Join Link:</strong>
            <a href={classDetails?.joinLink} className="text-blue-500">
              {classDetails?.joinLink}
            </a>
          </p>
        </div>
      </div>
      <p className="mb-4">
        {classDetails?.description || "No description available"}
      </p>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">
          Post a Message or Upload a File
        </h3>
        <textarea
          className="w-full p-2 border rounded-md mb-2 bg-white dark:bg-gray-600 dark:text-white"
          placeholder="Type your message..."
          rows="3"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        ></textarea>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600"
          >
            <FaFileUpload /> Upload File
          </label>
          {file && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {file.name}
            </span>
          )}
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Messages</h3>
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className="p-3 border rounded-md bg-gray-100 dark:bg-gray-800"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>{msg?.senderId?.name || "Unknown"}:</strong>{" "}
                  {msg.content}
                </p>

                {/* ✅ Ensure File URL is Correct */}
                {msg.fileUrl && (
                  <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>File:</strong>{" "}
                        {decodeURIComponent(msg.fileUrl.split("/").pop())}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Type:</strong> {msg.fileType.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`http://localhost:3000${msg.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                      >
                        <FaEye /> View
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No messages yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MainSection;
