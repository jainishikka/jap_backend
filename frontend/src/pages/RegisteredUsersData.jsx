import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortUp, faSortDown, faArrowsUpDown, faSpinner } from "@fortawesome/free-solid-svg-icons";

const RegisteredUsersData = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchMobile, setSearchMobile] = useState("");
  const [searchName, setSearchName] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  // Filter by name/mobile whenever inputs change
  useEffect(() => {
    const lowerMobile = searchMobile.toLowerCase();
    const lowerName   = searchName.toLowerCase();

    const filtered = users.filter((user) => {
      const matchesMobile = user.MobileNumber?.toLowerCase().includes(lowerMobile);
      const matchesName   =
        user.FirstName?.toLowerCase().includes(lowerName) ||
        user.LastName?.toLowerCase().includes(lowerName);
      return (!searchMobile || matchesMobile) && (!searchName || matchesName);
    });

    setFilteredUsers(filtered);
  }, [searchMobile, searchName, users]);

  const fetchUsers = async () => {
    let allUsers = [];
    let offset   = 0;
    const limit  = 100;
    let hasMore  = true;

    try {
      while (hasMore) {
        const response = await axios.get(`${apiUrl}/users`, { params: { limit, offset } });
        const docs = response.data.documents || [];
        if (docs.length > 0) {
          allUsers = [...allUsers, ...docs];
          offset  += docs.length;
          if (docs.length < limit) hasMore = false;
        } else {
          hasMore = false;
        }
      }
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to fetch users data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const downloadData = () => {
    const csvHeaders = ["Registration No", "First Name", "Last Name", "Gender", "Email", "Date Of Birth", "Mobile", "Created Date"];
    const csvContent = [
      csvHeaders.join(","),
      ...filteredUsers.map((user) =>
        [
          user.RegistrationNumber || "",
          user.FirstName          || "",
          user.LastName           || "",
          user.Gender             || "",
          user.PatientEmail       || "",
          user.Date_Of_Birth ? new Date(user.Date_Of_Birth).toLocaleDateString() : "",
          user.MobileNumber || "",
          new Date(user.createdAt).toLocaleString("en-GB"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = "registered_users_data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const sortData = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    const sorted    = [...filteredUsers].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ?  1 : -1;
      return 0;
    });
    setFilteredUsers(sorted);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc"
        ? <FontAwesomeIcon icon={faSortUp} />
        : <FontAwesomeIcon icon={faSortDown} />;
    }
    return <FontAwesomeIcon icon={faArrowsUpDown} />;
  };

  const totalPages     = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentPageData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-500 p-6">
      <div className="max-w-full mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Registered Users Data</h1>

        <div className="mb-4 flex gap-3">
          <button onClick={() => navigate("/admin-dashboard")} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Live Appointment Diary
          </button>
          <button onClick={downloadData} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Download Data
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{errorMessage}</div>
        )}

        {/* Date filter */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="p-2 border rounded-md" />
          <input type="date" value={toDate}   onChange={(e) => setToDate(e.target.value)}   className="p-2 border rounded-md" />
          <button
            onClick={() =>
              setFilteredUsers(
                users.filter((user) => {
                  const d = new Date(user.createdAt);
                  return (!fromDate || d >= new Date(fromDate)) && (!toDate || d <= new Date(toDate));
                })
              )
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Apply Filter
          </button>
        </div>

        {/* Name / Mobile filter */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input type="text" value={searchMobile} onChange={(e) => setSearchMobile(e.target.value)} className="p-2 border rounded-md" placeholder="Search by Mobile Number..." />
          <input type="text" value={searchName}   onChange={(e) => setSearchName(e.target.value)}   className="p-2 border rounded-md" placeholder="Search by Name (First/Last)..." />
          <button onClick={() => { setSearchMobile(""); setSearchName(""); setFilteredUsers(users); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Clear Filters
          </button>
        </div>

        {loading && <FontAwesomeIcon icon={faSpinner} spin />}

        {!loading && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  {[
                    { label: "Registration No", key: "RegistrationNumber" },
                    { label: "First Name",       key: "FirstName" },
                    { label: "Last Name",        key: "LastName" },
                    { label: "Gender",           key: "Gender" },
                    { label: "Email",            key: "PatientEmail" },
                    { label: "Date Of Birth",    key: "Date_Of_Birth" },
                    { label: "Mobile",           key: "MobileNumber" },
                    { label: "Created Date",     key: "createdAt" },
                  ].map((col) => (
                    <th key={col.key} className="px-4 py-2 border cursor-pointer" onClick={() => sortData(col.key)}>
                      {col.label} {getSortIcon(col.key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="px-4 py-2">{user.RegistrationNumber || "N/A"}</td>
                    <td className="px-4 py-2">{user.FirstName          || "N/A"}</td>
                    <td className="px-4 py-2">{user.LastName           || "N/A"}</td>
                    <td className="px-4 py-2">{user.Gender             || "N/A"}</td>
                    <td className="px-4 py-2">{user.PatientEmail       || "N/A"}</td>
                    <td className="px-4 py-2">
                      {user.Date_Of_Birth ? new Date(user.Date_Of_Birth).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-2">{user.MobileNumber || "N/A"}</td>
                    <td className="px-4 py-2">{new Date(user.createdAt).toLocaleString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-center space-x-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${page === currentPage ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
                  {page}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredUsersData;
