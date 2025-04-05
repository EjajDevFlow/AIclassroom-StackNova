import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebase";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/appSlice";
import { FaGoogle } from "react-icons/fa"; // Google icon from react-icons
import axios from "axios";

const Login = () => {
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = {
        name: result.user.displayName,
        email: result.user.email,
        photo:
          result.user.photoURL ||
          "https://static.vecteezy.com/system/resources/previews/013/042/571/original/default-avatar-profile-icon-social-media-user-photo-in-flat-style-vector.jpg",
      };

      // Save to local storage
      localStorage.setItem("profileImage", userData.photo);

      // Send data to backend
      const response = await axios.post(
        "http://localhost:3000/api/users/add",
        userData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // Dispatch to Redux (using backend data if available)
      dispatch(
        setUser({
          ...response.data.user,
          photo: localStorage.getItem("profileImage"),
        })
      );
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center px-6 py-8">
      <div className="relative z-10 max-w-lg w-full bg-white p-10 rounded-lg shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Welcome Back!
          </h1>
          <p className="text-lg text-gray-600">Please sign in to continue.</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Card for Login */}
          <button
            onClick={handleSignIn}
            className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white text-lg rounded-full shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-500 focus:outline-none"
          >
            <FaGoogle className="mr-3 text-2xl" />
            Sign in with Google
          </button>
        </div>

        {/* Optional "Other Sign-In" or information links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-500">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
