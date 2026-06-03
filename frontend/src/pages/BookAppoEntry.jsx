import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const BookAppoEntry = () => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const trimmed = registrationNumber.trim();

      if (!trimmed) {
        setError("Registration Number is required.");
        return;
      }

      await axios.get(`/api/users/by-reg/${trimmed}`);

      navigate("/appointment-details", {
        state: { registrationNumber: trimmed },
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No user found with this registration number.");
      } else {
        console.error("Error booking appointment:", err);
        setError(
          "An error occurred while booking the appointment. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-500">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Book an Appointment
        </h1>

        <form onSubmit={handleBookAppointment} className="space-y-6">
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
            className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200 disabled:bg-gray-400 transition"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default BookAppoEntry;
