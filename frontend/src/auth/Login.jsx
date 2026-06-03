import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const Login = () => {
  const [password, setPassword] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState(localStorage.getItem("registrationNumber"));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const trimmed = registrationNumber.trim();
        if (!trimmed) {
          setError("Registration Number is required.");
          return;
        }

        const response = await axios.get(`${apiUrl}/users/by-reg/${trimmed}`);
        if (response.data) {
          navigate("/user-dashboard", {
            state: { registrationNumber: trimmed },
          });
        }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No user found with this registration number.");
      } else {
        console.error("Login error:", err);
        setError("An error occurred during login. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-500">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          <span className="text-blue-500">Book Appointment</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">

            <div>
              <label
                htmlFor="registrationNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

          {loading && (
            <div className="flex justify-center py-4">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-blue-500 text-3xl"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:scale-105"
          >
            {loading ? "Logging In..." : "Book Appointment"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <Link
            to="/signup"
            className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:scale-105"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <Link
            to="/admin-dashboard"
            className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transform transition hover:scale-105"
          >
            Live Appointment Diary
          </Link>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};


export default Login;
