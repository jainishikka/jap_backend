import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const UserDashboard = ({ registrationNumber }) => {
  const [patientName, setPatientName] = useState("");
  const [patientProblem, setPatientProblem] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(`/api/users/by-reg/${registrationNumber}`);
        if (response.data) {
          setPatientName(response.data.PatientName);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Patient data not found.");
      }
    };

    fetchPatientData();
  }, [registrationNumber]);

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await axios.post("/api/appointments/upsert", {
        PatientProblem:    patientProblem,
        RegistrationNumber: registrationNumber,
        PatientName:       patientName,
        AppointmentDate:   new Date().toISOString(),
        Remarks:           "",
        TreatmentDone:     "",
        PaymentReceived:   false,
        PackagePurchased:  false,
        RemainingSessions: 0,
      });

      setSuccessMessage("Details updated successfully!");
      setPatientProblem("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to update details. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Hello, {patientName || "User"}!</h1>
        <p className="text-gray-600 mb-6">Welcome! Please provide your details below.</p>

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4 text-sm">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 text-sm">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmitDetails}>
          <div className="mb-4">
            <label htmlFor="patientProblem" className="block text-sm font-medium text-gray-700 mb-1">
              Patient Problem:
            </label>
            <textarea
              id="patientProblem"
              value={patientProblem}
              onChange={(e) => setPatientProblem(e.target.value)}
              placeholder="Describe the problem"
              className="block w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Submit Details
          </button>
        </form>

        {successMessage && (
          <div className="mt-6 bg-green-200 p-4 rounded-md text-center">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Go to Live Appointment Diary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

UserDashboard.propTypes = {
  registrationNumber: PropTypes.string.isRequired,
};

export default UserDashboard;
