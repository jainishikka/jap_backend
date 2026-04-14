import { format } from "date-fns";
import { useState, useEffect } from "react";
import axios from "axios";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [displayedPatients, setDisplayedPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: "asc" });
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [searchRegNumber, setSearchRegNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchName, setSearchName] = useState("");

  const fetchActivePatients = async (params = {}) => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/appointments", { params });
      setPatients(response.data.documents || []);
    } catch (error) {
      console.error("Error fetching active patients:", error);
      setErrorMessage("Failed to fetch patient records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeRecord = async (patient) => {
    const requiredFields = [
      { field: "PatientProblem", label: "Patient Problem" },
      { field: "DoctorAttended", label: "Doctor Attended" },
      { field: "TreatmentDone", label: "Treatment Done" },
      { field: "Payment", label: "Payment" },
      { field: "PaymentMode", label: "Payment Mode" },
    ];

    const missingFields = requiredFields.filter(
      ({ field }) => !patient[field] || patient[field].toString().trim() === ""
    );

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map((f) => f.label).join(", ");
      toast.error(`Please fill in the following required fields: ${missingFieldNames}`);
      return;
    }

    try {
      const { _id, __v, createdAt, updatedAt, AppointmentDate, ...dataToMove } = patient;

      await axios.post("/api/finalized", {
        appointmentId: _id,
        AppointmentDate: AppointmentDate || null,
        ...dataToMove,
      });

      setPatients((prev) => prev.filter((p) => p._id !== _id));
      toast.success("Record successfully finalized.");
    } catch (error) {
      console.error("Error finalizing record:", error);
      toast.error(`Failed to finalize the record. Error: ${error.message}`);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const params = {};
      if (searchRegNumber) params.regNumber = searchRegNumber;
      if (searchDateFrom && searchDateTo) {
        params.dateFrom = searchDateFrom;
        params.dateTo   = searchDateTo;
      }
      if (searchName) params.name = searchName;
      await fetchActivePatients(params);
    } catch (error) {
      console.error("Error during search:", error);
      setErrorMessage("Search failed. Please check your input and try again.");
    }
  };

  const sortPatients = (field) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ field, direction });

    const sorted = [...patients].sort((a, b) => {
      const valA = a[field] || "";
      const valB = b[field] || "";
      if (typeof valA === "string" && typeof valB === "string") {
        return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (typeof valA === "number" && typeof valB === "number") {
        return direction === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });

    setPatients(sorted);
  };

  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    setDisplayedPatients(patients.slice(startIndex, startIndex + rowsPerPage));
  }, [patients, currentPage, rowsPerPage]);

  useEffect(() => {
    fetchActivePatients();
  }, []);

  const handleFieldChange = (id, field, value) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient._id === id
          ? { ...patient, [field]: field === "RemainingSessions" ? parseInt(value, 10) || 0 : value }
          : patient
      )
    );
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const { _id, __v, createdAt, updatedAt, ...dataToUpdate } = updatedData;

      if ("PackagePurchased"  in dataToUpdate) dataToUpdate.PackagePurchased  = Boolean(dataToUpdate.PackagePurchased);
      if ("PaymentReceived"   in dataToUpdate) dataToUpdate.PaymentReceived   = Boolean(dataToUpdate.PaymentReceived);
      if ("RemainingSessions" in dataToUpdate) dataToUpdate.RemainingSessions = Number(dataToUpdate.RemainingSessions) || 0;
      if ("Payment"           in dataToUpdate) dataToUpdate.Payment           = Number(dataToUpdate.Payment) || 0;

      const response = await axios.put(`/api/appointments/${id}`, dataToUpdate);

      setPatients((prev) =>
        prev.map((patient) => (patient._id === id ? { ...patient, ...response.data } : patient))
      );

      alert("Record updated successfully!");
    } catch (error) {
      console.error("Failed to update record:", error);
      alert(`Failed to update the record. Error: ${error.message}`);
    }
  };

  const headers = [
    { label: "Registration Number", field: "RegistrationNumber" },
    { label: "Appointment Date",    field: "AppointmentDate" },
    { label: "Patient Name",        field: "PatientName" },
    { label: "Patient Problem",     field: "PatientProblem" },
    { label: "Doctor Attended",     field: "DoctorAttended" },
    { label: "Treatment Done",      field: "TreatmentDone" },
    { label: "Package Purchased",   field: "PackagePurchased" },
    { label: "Payment Received",    field: "PaymentReceived" },
    { label: "Payment",             field: "Payment" },
    { label: "Payment Mode",        field: "PaymentMode" },
    { label: "Remarks",             field: "Remarks" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 p-6 overflow-hidden">
      <div className="max-w-full mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Jain Arogyam</h1>
        <h3 className="text-md text-gray-500 mb-6 text-center">Live appointment diary</h3>

        {/* Navigation Buttons */}
        <div className="mb-6 flex justify-between">
          <button onClick={() => navigate("/registered-users-data")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all">
            Registered Users
          </button>
          <button onClick={() => navigate("/finalData")} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all">
            Historical Data
          </button>
          <button onClick={() => navigate("/login")} className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-all">
            Book Appointment
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row gap-4">
          <input type="date" value={searchDateFrom} onChange={(e) => setSearchDateFrom(e.target.value)} placeholder="From Date" className="border rounded-lg px-4 py-2 w-full" />
          <input type="date" value={searchDateTo}   onChange={(e) => setSearchDateTo(e.target.value)}   placeholder="To Date"   className="border rounded-lg px-4 py-2 w-full" />
          <input type="text" value={searchRegNumber} onChange={(e) => setSearchRegNumber(e.target.value)} placeholder="Registration Number" className="border rounded-lg px-4 py-2 w-full" />
          <input type="text" value={searchName}      onChange={(e) => setSearchName(e.target.value)}      placeholder="Name"                  className="border rounded-lg px-4 py-2 w-full" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all">
            Search
          </button>
        </form>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 text-center">{errorMessage}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  {headers.map(({ label, field }) => (
                    <th key={field} className="px-6 py-2 border border-gray-300 text-left cursor-pointer" onClick={() => sortPatients(field)}>
                      {label}
                      <span className="ml-2">
                        {sortConfig.field === field && (
                          sortConfig.direction === "asc"
                            ? <i className="fas fa-arrow-up text-gray-500"></i>
                            : <i className="fas fa-arrow-down text-gray-500"></i>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-6 py-2 border border-gray-300">Action</th>
                </tr>
              </thead>

              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient._id}>
                      {[
                        { field: "RegistrationNumber", type: "text",  minWidth: "200px" },
                        {
                          field: "AppointmentDate", type: "date", minWidth: "150px",
                          formatValue: (v) => v ? new Date(v).toISOString().slice(0, 10) : "",
                        },
                        { field: "PatientName",    type: "text", minWidth: "250px" },
                        { field: "PatientProblem", type: "text", minWidth: "300px" },
                        { field: "DoctorAttended", type: "text", minWidth: "200px" },
                        { field: "TreatmentDone",  type: "text", minWidth: "200px" },
                      ].map(({ field, type, minWidth, formatValue }) => (
                        <td key={`${patient._id}-${field}`} className="px-6 py-2 border" style={{ minWidth }}>
                          <input
                            type={type}
                            value={formatValue ? formatValue(patient[field]) : patient[field] || ""}
                            onChange={(e) => handleFieldChange(patient._id, field, e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                          />
                        </td>
                      ))}

                      {/* Package Purchased */}
                      <td className="px-6 py-2 border text-center">
                        <input type="checkbox" checked={patient.PackagePurchased || false}
                          onChange={(e) => handleFieldChange(patient._id, "PackagePurchased", e.target.checked)}
                          className="h-5 w-5"
                        />
                      </td>

                      {/* Payment Received */}
                      <td className="px-6 py-2 border text-center">
                        <input type="checkbox" checked={patient.PaymentReceived || false}
                          onChange={(e) => handleFieldChange(patient._id, "PaymentReceived", e.target.checked)}
                          className="h-5 w-5"
                        />
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-2 border">
                        <input type="number" value={patient.Payment || 0}
                          onChange={(e) => handleFieldChange(patient._id, "Payment", parseInt(e.target.value, 10) || 0)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>

                      {/* Payment Mode */}
                      <td className="px-6 py-2 border">
                        <select value={patient.PaymentMode || ""}
                          onChange={(e) => handleFieldChange(patient._id, "PaymentMode", e.target.value)}
                          className="border rounded px-2 py-1 w-full bg-yellow-100 focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="" disabled>Select Payment Mode</option>
                          <option value="cash">Cash</option>
                          <option value="upi">UPI</option>
                          <option value="at subscription">At Subscription</option>
                        </select>
                      </td>

                      {/* Remarks */}
                      <td className="px-6 py-2 border">
                        <input type="text" value={patient.Remarks || ""}
                          onChange={(e) => handleFieldChange(patient._id, "Remarks", e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-2 border text-center space-y-1">
                        <button
                          onClick={() => handleUpdate(patient._id, patient)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 block w-full mb-1"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleFinalizeRecord(patient)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 block w-full"
                          aria-label={`Finalize record for ${patient.PatientName}`}
                        >
                          Finalize
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center py-4">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-center space-x-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">
            Previous
          </button>
          {[...Array(Math.ceil(patients.length / rowsPerPage)).keys()].map((pageNum) => (
            <button key={pageNum} onClick={() => setCurrentPage(pageNum + 1)}
              className={`px-4 py-2 rounded ${currentPage === pageNum + 1 ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
              {pageNum + 1}
            </button>
          ))}
          <button disabled={currentPage === Math.ceil(patients.length / rowsPerPage)} onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
