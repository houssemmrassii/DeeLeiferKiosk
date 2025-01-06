import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Pagination from "@mui/material/Pagination";

interface Promotion {
  id: string;
  title: string;
  code: string;
  dateStart: string;
  dateEnd: string;
  image: string;
  percentage: number;
  createdAt: number;
}

const ListPromotion: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    promotionId: string;
    promotionTitle: string;
  }>({
    show: false,
    promotionId: "",
    promotionTitle: "",
  });
  const promotionsPerPage = 5;

  const navigate = useNavigate();

  const fetchPromotions = async () => {
    try {
      const promotionSnapshot = await getDocs(collection(db, "Promotion"));
      const promotionsData = promotionSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled",
          code: data.code || "No Code",
          dateStart: data.dateStart?.seconds
            ? new Date(data.dateStart.seconds * 1000).toLocaleString()
            : "No Start Date",
          dateEnd: data.dateEnd?.seconds
            ? new Date(data.dateEnd.seconds * 1000).toLocaleString()
            : "No End Date",
          image: data.image || "https://via.placeholder.com/50",
          percentage: data.percentage || 0,
          createdAt: data.createdAt?.seconds || 0,
        };
      }) as Promotion[];
      promotionsData.sort((a, b) => b.createdAt - a.createdAt); // Default sorting by creation date (most recent first)
      setPromotions(promotionsData);
      setFilteredPromotions(promotionsData);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to fetch promotions.");
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Promotion code copied to clipboard!");
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Promotion", id));
      setPromotions(promotions.filter((promotion) => promotion.id !== id));
      toast.success("Promotion deleted successfully!");
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Failed to delete promotion.");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterPromotions(query, sortOrder);
  };

  const handleSortOrderChange = (order: "asc" | "desc") => {
    setSortOrder(order);
    filterPromotions(searchQuery, order);
  };

  const filterPromotions = (query: string, order: "asc" | "desc") => {
    let filtered = promotions.filter((promotion) =>
      promotion.title.toLowerCase().includes(query)
    );
    filtered.sort((a, b) =>
      order === "asc" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
    );
    setFilteredPromotions(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const indexOfLastPromotion = currentPage * promotionsPerPage;
  const indexOfFirstPromotion = indexOfLastPromotion - promotionsPerPage;
  const currentPromotions = filteredPromotions.slice(
    indexOfFirstPromotion,
    indexOfLastPromotion
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-[#0a100d]">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-[#d6d5c9]">Promotion List</h1>
        <button
          onClick={() => navigate("/AddPromotion")}
          className="px-4 py-2 bg-[#a22c29] text-white font-semibold rounded-lg hover:bg-[#902923] transition"
        >
          Add New Promotion
        </button>
      </div>
  
      {/* Search and Sort Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by title..."
          className="w-full sm:w-1/2 rounded-lg border border-gray-300 py-2 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:ring-2 focus:ring-[#a22c29] focus:outline-none"
        />
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-800 dark:text-[#d6d5c9]">
            Sort by Date:
          </label>
          <select
            value={sortOrder}
            onChange={(e) => handleSortOrderChange(e.target.value as "asc" | "desc")}
            className="rounded-lg border border-gray-300 py-2 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:ring-2 focus:ring-[#a22c29] focus:outline-none"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
  
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-center">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#b9baa3]">
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Image
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Title
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Code
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Start / End Date
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Percentage
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPromotions.map((promotion) => (
              <tr
                key={promotion.id}
                className="border-t hover:bg-gray-100 dark:hover:bg-[#d6d5c9]"
              >
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <img
                      src={promotion.image || "https://via.placeholder.com/50"}
                      alt={promotion.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-[#d6d5c9]">{promotion.title}</td>
                <td className="px-4 py-3 text-gray-800 dark:text-[#d6d5c9]">
                  <span
                    onClick={() => handleCopyCode(promotion.code)}
                    className="cursor-pointer text-[#a22c29] underline"
                  >
                    {promotion.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-gray-800 dark:text-[#d6d5c9]">{promotion.dateStart}</span>
                    <span className="text-gray-800 dark:text-[#d6d5c9]">{promotion.dateEnd}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-[#d6d5c9]">
                  {promotion.percentage}%
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={() => navigate(`/EditPromotion/${promotion.id}`)}
                      className="text-gray-500 hover:text-[#a22c29] transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmModal({
                          show: true,
                          promotionId: promotion.id,
                          promotionTitle: promotion.title,
                        })
                      }
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
  
      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          count={Math.ceil(filteredPromotions.length / promotionsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
  
      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-[#0a100d] rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#d6d5c9] mb-4">
              Are you sure you want to delete {confirmModal.promotionTitle}?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() =>
                  setConfirmModal({ show: false, promotionId: "", promotionTitle: "" })
                }
                className="px-4 py-2 rounded-lg bg-[#b9baa3] text-[#0a100d] hover:bg-[#d6d5c9] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeletePromotion(confirmModal.promotionId);
                  setConfirmModal({ show: false, promotionId: "", promotionTitle: "" });
                }}
                className="px-4 py-2 rounded-lg bg-[#a22c29] text-white hover:bg-[#902923] transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default ListPromotion;
