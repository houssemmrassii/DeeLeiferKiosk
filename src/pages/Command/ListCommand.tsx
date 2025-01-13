import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";

interface Commande {
  id: string;
  userName: string;
  userAddress: string;
  dateCreation: string;
  status: string;
  totalAmount: number;
}

interface User {
  role: string;
  firstName: string;
  secondName?: string;
  address?: string;
}

const CommandTable: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<Commande[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>(""); // Empty means no filter
  const commandsPerPage = 5;
  const navigate = useNavigate();

  const fetchCommandes = async () => {
    try {
      const commandSnapshot = await getDocs(collection(db, "Commande"));
      const commandsData = await Promise.all(
        commandSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const userRef = data.user;

          let userName = "Unknown User";
          let userAddress = "Unknown Address";

          if (userRef) {
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              if (userData.role === "Client") {
                userName = `${userData.firstName || "Unnamed"} ${
                  userData.secondName || ""
                }`.trim();
                userAddress = userData.address || "No Address";
              }
            }
          }

          let status = "Pending";
          const now = new Date();
          if (data.DateShippingStart?.seconds) {
            const shippingStartDate = new Date(data.DateShippingStart.seconds * 1000);
            if (shippingStartDate <= now) status = "Delivering";
          }
          if (data.DateFinish?.seconds) {
            const finishDate = new Date(data.DateFinish.seconds * 1000);
            if (finishDate <= now) status = "Delivered";
          }

          return {
            id: docSnap.id,
            userName,
            userAddress: data.addresse?.address || userAddress,
            dateCreation: data.DatePAssCommande
              ? new Date(data.DatePAssCommande.seconds * 1000).toLocaleString()
              : "No Date",
            status,
            totalAmount: data.TotalAmount || 0,
          };
        })
      );
      setCommandes(commandsData);
      setFilteredCommandes(commandsData); // Initialize with all commandes
    } catch (error) {
      console.error("Error fetching commandes:", error);
      toast.error("Failed to fetch commandes.");
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  useEffect(() => {
    // Filter commands based on selected status
    if (statusFilter) {
      const filtered = commandes.filter((command) => command.status === statusFilter);
      setFilteredCommandes(filtered);
    } else {
      setFilteredCommandes(commandes); // Show all commands if no filter
    }
  }, [statusFilter, commandes]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  const indexOfLastCommand = currentPage * commandsPerPage;
  const indexOfFirstCommand = indexOfLastCommand - commandsPerPage;
  const currentCommands = filteredCommandes.slice(indexOfFirstCommand, indexOfLastCommand);

  const totalPages = Math.ceil(filteredCommandes.length / commandsPerPage);

  // Sort commands by creation date (most recent first)
  const sortedCommands = currentCommands.sort((a, b) => {
    const dateA = new Date(a.dateCreation).getTime();
    const dateB = new Date(b.dateCreation).getTime();
    return dateB - dateA; // Sort in descending order
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Commande List
        </h1>

        {/* Status Filter */}
        <div>
          <label htmlFor="statusFilter" className="mr-2 text-gray-800 dark:text-white">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="p-2 border rounded"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Delivering">Delivering</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-center">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-white">
                User Name
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-white">
                Address
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-white">
                Date of Creation
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-white">
                Status
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-white">
                Total Amount
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCommands.map((command) => (
              <tr
                key={command.id}
                className="border-t hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3 text-gray-800 dark:text-white">
                  {command.userName}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-white">
                  {command.userAddress}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-white">
                  {command.dateCreation}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      command.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : command.status === "Delivering"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {command.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-white">
                  €{command.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate(`/CommandDetail/${command.id}`)} // Navigate to details page
                    className="text-blue-500 hover:text-blue-700 transition"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          renderItem={(item) => {
            // Check if item is a number
            if (typeof item.page === "number") {
              return <PaginationItem {...item} />;
            }

            // Custom handling for ellipsis (only render as a non-page element)
            if (item.page === "...") {
              return (
                <span
                  style={{
                    color: "gray",
                    fontWeight: "bold",
                    padding: "0 8px",
                    cursor: "pointer",
                  }}
                >
                  ...
                </span>
              );
            }

            return null;
          }}
        />
      </div>
    </div>
  );
};

export default CommandTable;
