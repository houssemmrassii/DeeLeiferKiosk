import React, { useEffect, useState } from "react";
import { db } from "../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentIcon from "@mui/icons-material/Assignment";

const DashboardStats: React.FC = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [deliveryManCount, setDeliveryManCount] = useState(0);
  const [commandCount, setCommandCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const commandSnapshot = await getDocs(collection(db, "Commande"));
        const commands = commandSnapshot.docs.map((doc) => doc.data());
        const totalAmount = commands.reduce(
          (acc, command) => acc + (command.TotalAmount || 0),
          0
        );
        setTotalSales(totalAmount);
        setCommandCount(commands.length);

        const userSnapshot = await getDocs(collection(db, "users"));
        const users = userSnapshot.docs.map((doc) => doc.data());
        setUserCount(users.length);

        const deliveryMen = users.filter((user) => user.role === "Delivery_Man");
        setDeliveryManCount(deliveryMen.length);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 w-full">
      {/* Total Sales */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
        <AttachMoneyIcon fontSize="large" className="text-green-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 text-center">Total Sales</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">€{totalSales.toFixed(2)}</p>
      </div>

      {/* Total Users */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
        <PeopleIcon fontSize="large" className="text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 text-center">Total Users</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">{userCount}</p>
      </div>

      {/* Delivery Men */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
        <LocalShippingIcon fontSize="large" className="text-yellow-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 text-center">Delivery Men</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">{deliveryManCount}</p>
      </div>

      {/* Total Commands */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
        <AssignmentIcon fontSize="large" className="text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 text-center">Total Commands</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">{commandCount}</p>
      </div>
    </div>
  );
};

export default DashboardStats;
