import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const FinalData = () => {
  const [finalizedPatients, setFinalizedPatients] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  const fetchFinalizedPatients = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (startDate)          params.startDate  = startDate;
      if (endDate)            params.endDate    = endDate;
      if (registrationSearch) params.regNumber  = registrationSearch;
      if (nameSearch)         params.name       = nameSearch;

      const response = await axios.get("/finalized", { params });
      setFinalizedPatients(response.data.documents || []);
    } catch (error) {
      console.error("Error fetching finalized patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinalizedPatients();
  }, [nameSearch, registrationSearch, startDate, endDate]);

  const totalPages      = Math.ceil(finalizedPatients.length / patientsPerPage);
  const currentPatients = finalizedPatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );

  const paginate       = (n) => setCurrentPage(n);
  const handlePrevPage = () => currentPage > 1          && setCurrentPage((p) => p - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  const downloadData = () => {
    const csvHeaders = [
      "Registration Number", "Appointment Date", "Patient Name", "Patient Problem",
      "Doctor Attended", "Treatment Done", "Package Purchased",
      "Remaining Sessions", "Payment Received", "Payment", "Payment Mode", "Remarks",
    ];

    const csvContent = [
      csvHeaders.join(","),
      ...finalizedPatients.map((p) =>
        [
          p.RegistrationNumber || "",
          p.AppointmentDates ? new Date(p.AppointmentDates).toLocaleDateString() : "N/A",
          p.PatientName    || "",
          p.PatientProblem || "",
          p.DoctorAttended || "",
          p.TreatmentDone  || "",
          p.PackagePurchased  || "",
          p.RemainingSessions || "",
          p.PaymentReceived   || "",
          p.Payment     || "",
          p.PaymentMode || "",
          p.Remarks     || "",
        ].map((v) => `"${v}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = "finalized_patients_data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const sortData = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    const sorted = [...finalizedPatients].sort((a, b) =>
      direction === "asc" ? (a[key] > b[key] ? 1 : -1) : (a[key] < b[key] ? 1 : -1)
    );
    setFinalizedPatients(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === "asc" ? "▲" : "▼";
    return "⇅";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6 overflow-hidden">
      <div className="max-w-full mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-4xl font-bold text-blue-800 text-center mb-8">Historical Data</h1>

        <div className="flex justify-center gap-6 mb-8">
          <Link to="/admin-dashboard" className="bg-blue-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105">
            Live Appointment Diary
          </Link>
          <Link to="/registered-users-data" className="bg-indigo-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105">
            Registered Users
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-6 mb-8 items-center justify-center">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-sm font-semibold mb-2">Start Date</label>
            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-sm font-semibold mb-2">End Date</label>
            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="registrationSearch" className="text-sm font-semibold mb-2">Registration Number</label>
            <input type="text" id="registrationSearch" value={registrationSearch} onChange={(e) => setRegistrationSearch(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="nameSearch" className="text-sm font-semibold mb-2">Patient Name</label>
            <input type="text" id="nameSearch" value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <button onClick={fetchFinalizedPatients} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all">
            Search
          </button>
        </div>

        <button onClick={downloadData} className="bg-green-500 text-white px-6 py-2 mb-8 rounded-lg hover:bg-green-600 transition-all">
          Download Data
        </button>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-indigo-300 h-16 w-16"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-md">
              <thead>
                <tr className="bg-indigo-100 text-gray-700">
                  {[
                    { key: "RegistrationNumber", label: "Registration Number" },
                    { key: "AppointmentDates",   label: "Appointment Date" },
                    { key: "PatientName",        label: "Patient Name" },
                    { key: "PatientProblem",     label: "Patient Problem" },
                    { key: "DoctorAttended",     label: "Doctor Attended" },
                    { key: "TreatmentDone",      label: "Treatment Done" },
                    { key: "PackagePurchased",   label: "Package Purchased" },
                    { key: "RemainingSessions",  label: "Remaining Sessions" },
                    { key: "PaymentReceived",    label: "Payment Received" },
                    { key: "Payment",            label: "Payment" },
                    { key: "PaymentMode",        label: "Payment Mode" },
                    { key: "Remarks",            label: "Remarks" },
                  ].map((col) => (
                    <th key={col.key} className="border border-gray-300 px-6 py-3 text-left text-sm font-semibold cursor-pointer" onClick={() => sortData(col.key)}>
                      {col.label} <span>{getSortIcon(col.key)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentPatients.length > 0 ? (
                  currentPatients.map((patient) => (
                    <tr key={patient._id} className="border-b hover:bg-indigo-50">
                      {[
                        "RegistrationNumber", "AppointmentDates", "PatientName",
                        "PatientProblem", "DoctorAttended", "TreatmentDone",
                        "PackagePurchased", "RemainingSessions", "PaymentReceived",
                        "Payment", "PaymentMode", "Remarks",
                      ].map((field) => (
                        <td key={field} className="border border-gray-300 px-6 py-3 text-sm">
                          {field === "AppointmentDates" ? (
                            patient[field] ? new Date(patient[field]).toLocaleDateString() : "N/A"
                          ) : field === "PackagePurchased" || field === "PaymentReceived" ? (
                            <input type="checkbox" checked={patient[field] === true} disabled className="w-5 h-5" />
                          ) : (
                            patient[field] || "N/A"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center py-4 text-sm text-gray-600">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 mr-2">
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => paginate(i + 1)}
              className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-black"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 ml-2">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalData;
