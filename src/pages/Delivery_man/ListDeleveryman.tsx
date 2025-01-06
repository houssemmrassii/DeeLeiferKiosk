import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaTrashAlt, FaEdit } from "react-icons/fa";

interface Deliveryman {
  role: string;
  id: string;
  uid: string;
  photo_url: string;
  firstName: string;
  secondName: string;
  phone_number: string;
  ShippingScore: number;
  email: string;
  address: Array<{
    address: string;
    title: string;
    location: { lat: string; lng: string };
  }>;
}

const ListDeliveryman = () => {
  const [deliverymen, setDeliverymen] = useState<Deliveryman[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterBusy, setFilterBusy] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeliverymen = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Deliveryman))
        .filter((user) => user.role === "Delivery_Man");
      setDeliverymen(data);
    };

    fetchDeliverymen();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setDeliverymen(deliverymen.filter((man) => man.uid !== id));
      toast.success("Delivery man deleted successfully!");
    } catch (error) {
      console.error("Error deleting delivery man:", error);
      toast.error("Failed to delete delivery man. Please try again.");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setIsDeleting(false);
  };

  const handleEdit = (deliveryman: Deliveryman) => {
    navigate("/AddDeliveryman", { state: { deliveryman } });
  };

  const filteredDeliverymen = deliverymen.filter((man) => {
    const matchesSearchQuery =
      man.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      man.secondName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      man.address.some((addr) =>
        addr.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilterAvailable = filterAvailable
      ? man.ShippingScore === 0
      : true;

    const matchesFilterBusy = filterBusy ? man.ShippingScore !== 0 : true;

    return matchesSearchQuery && matchesFilterAvailable && matchesFilterBusy;
  });

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg dark:bg-[#0a100d]">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-[#d6d5c9]">Delivery Men List</h1>
        <button
          onClick={() => navigate("/AddDeliveryman")}
          className="px-4 py-2 bg-[#a22c29] text-white font-semibold rounded-lg hover:bg-[#902923] transition"
        >
          Add New Delivery Man
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or address"
          className="w-full sm:w-1/2 rounded-lg border border-gray-300 py-2 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:ring-2 focus:ring-[#a22c29] focus:outline-none"
        />
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.checked)}
              className="rounded border-gray-300 text-[#a22c29] focus:ring-[#a22c29]"
            />
            <span className="text-sm text-gray-800 dark:text-[#d6d5c9]">Available</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterBusy}
              onChange={(e) => setFilterBusy(e.target.checked)}
              className="rounded border-gray-300 text-[#a22c29] focus:ring-[#a22c29]"
            />
            <span className="text-sm text-gray-800 dark:text-[#d6d5c9]">Busy</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-center">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#b9baa3]">
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Photo
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Name
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Phone Number
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Status
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliverymen.map((man) => (
              <tr
                key={man.uid}
                className="border-t hover:bg-gray-100 dark:hover:bg-[#d6d5c9]"
              >
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <img
                      src={man.photo_url || "https://via.placeholder.com/50"}
                      alt={man.firstName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-[#d6d5c9]">
                  <h5 className="font-medium">{man.firstName} {man.secondName}</h5>
                  <p className="text-sm text-gray-500 dark:text-[#d6d5c9]">{man.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-[#d6d5c9]">{man.phone_number}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      man.ShippingScore === 0
                        ? "bg-green-200 text-green-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {man.ShippingScore === 0 ? "Available" : "Busy"}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={() => navigate(`/ViewDeliveryman/${man.uid}`)}
                      className="text-gray-500 hover:text-[#a22c29] transition"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/EditDeliveryman/${man.uid}`)}
                      className="text-gray-500 hover:text-[#a22c29] transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => confirmDelete(man.uid)}
                      className="text-gray-500 hover:text-[#902923] transition"
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListDeliveryman;
