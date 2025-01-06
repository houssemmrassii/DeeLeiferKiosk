import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChartOne from "../../components/Charts/ChartOne";
import ChartThree from "../../components/Charts/ChartThree";
import ChartTwo from "../../components/Charts/ChartTwo";
import ChatCard from "../../components/Chat/ChatCard";
import MapOne from "../../components/Maps/MapOne";
import TableOne from "../../components/Tables/TableOne";
interface Market {
  id: string;
  delivaryfees: number;
  isOpen: boolean;
  [key: string]: any; // Optional: Allow additional fields
}

const ECommerce: React.FC = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [deliveryManCount, setDeliveryManCount] = useState(0);
  const [commandCount, setCommandCount] = useState(0);
  const [marketData, setMarketData] = useState<Market | null>(null);
  const [deliveryFees, setDeliveryFees] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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

        const marketSnapshot = await getDocs(collection(db, "market"));
        const market = marketSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))[0] as Market;

        setMarketData(market);
        setDeliveryFees(market?.delivaryfees || 0);
        setIsOpen(market?.isOpen || false);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleToggleIsOpen = async () => {
    if (!marketData?.id) return;
    try {
      const marketDocRef = doc(db, "market", marketData.id);
      await updateDoc(marketDocRef, { isOpen: !isOpen });
      setIsOpen(!isOpen);
    } catch (error) {
      console.error("Error updating isOpen:", error);
    }
  };

  const handleUpdateDeliveryFees = async () => {
    if (!marketData?.id) return;
    try {
      const marketDocRef = doc(db, "market", marketData.id);
      await updateDoc(marketDocRef, { delivaryfees: deliveryFees });
    } catch (error) {
      console.error("Error updating delivery fees:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6">
      {/* Market Management Section */}
<div className="w-full flex justify-between items-center bg-transparent p-2 mb-4">
  {/* Market Open Toggle */}
  <div className="flex items-center gap-3">
    <label htmlFor="isOpen" className="text-gray-700 font-medium">
      Market Open:
    </label>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isOpen}
        onChange={handleToggleIsOpen}
        className="sr-only peer"
      />
      <div
        className={`w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer 
        peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 
        after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6`}
      ></div>
      <span className="ml-2 text-gray-900 font-medium">
        {isOpen ? "Open" : "Closed"}
      </span>
    </label>
  </div>

  {/* Delivery Fees Section */}
  <div className="flex items-center gap-3">
    <label htmlFor="deliveryFees" className="text-gray-700 font-medium">
      Delivery Fees (€):
    </label>
    <input
      type="number"
      id="deliveryFees"
      value={deliveryFees}
      onChange={(e) => setDeliveryFees(Number(e.target.value))}
      className="border border-gray-300 rounded-md p-1.5 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <button
      onClick={handleUpdateDeliveryFees}
      className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-md"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </button>
  </div>
</div>

      {/* Dashboard Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

     

      {/* Other Content Section */}
      <div className="grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
        <MapOne />
        <div className="col-span-12 xl:col-span-8">
          <TableOne />
        </div>
        <ChatCard />
      </div>
    </div>
  );
};

export default ECommerce;
