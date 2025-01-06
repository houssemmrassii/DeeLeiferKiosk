import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@mui/material/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
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

          // Fetch User Details with Role 'Client'
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

          // Determine Status
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
    } catch (error) {
      console.error("Error fetching commandes:", error);
      toast.error("Failed to fetch commandes.");
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  // Handle Pagination
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Pagination Logic
  const indexOfLastCommand = currentPage * commandsPerPage;
  const indexOfFirstCommand = indexOfLastCommand - commandsPerPage;
  const currentCommands = commandes.slice(indexOfFirstCommand, indexOfLastCommand);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Commande List
        </h1>
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
            {currentCommands.map((command) => (
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
          count={Math.ceil(commandes.length / commandsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default CommandTable;
