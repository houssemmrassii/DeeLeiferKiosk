import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { FaTrashAlt, FaPlus, FaEdit } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "@mui/material";

interface Zone {
  id: string;
  GeoPoint: { latitude: number; longitude: number };
  MinimumOrderAmount: number;
  ZIPCode: string;
  isOpen: boolean;
}

const ListZones: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState<string>(""); // Filter for open/closed
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({
    GeoPoint: { latitude: 0, longitude: 0 },
    MinimumOrderAmount: 0,
    ZIPCode: "",
    isOpen: false,
  });
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const zonesPerPage = 10; // Zones per page

  const fetchZones = async () => {
    try {
      const zoneSnapshot = await getDocs(collection(db, "Zone"));
      const zonesData = zoneSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Zone[];
      setZones(zonesData);
      setFilteredZones(zonesData); // Initialize filtered zones
    } catch (error) {
      console.error("Error fetching zones:", error);
      toast.error("Failed to fetch zones.");
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleDeleteZone = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "Zone", deleteId));
      const updatedZones = zones.filter((zone) => zone.id !== deleteId);
      setZones(updatedZones);
      setFilteredZones(updatedZones);
      toast.success("Zone deleted successfully!");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting zone:", error);
      toast.error("Failed to delete zone.");
    }
  };

  const handleAddZone = async () => {
    try {
      await addDoc(collection(db, "Zone"), newZone);
      setIsAdding(false);
      fetchZones();
      toast.success("Zone added successfully!");
    } catch (error) {
      console.error("Error adding zone:", error);
      toast.error("Failed to add zone.");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const lowerQuery = query.toLowerCase();
    const filtered = zones.filter((zone) =>
      zone.ZIPCode.toLowerCase().includes(lowerQuery)
    );
    setFilteredZones(filtered);
    setCurrentPage(1); // Reset to first page after filtering

  };

  const handleFilterChange = (value: string) => {
    setFilterOpen(value);

    if (value) {
      const filtered = zones.filter(
        (zone) => zone.isOpen.toString() === value
      );
      setFilteredZones(filtered);
    } else {
      setFilteredZones(zones); // Show all if no filter
    }
    setCurrentPage(1); // Reset to first page after filtering

  };
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Calculate zones for the current page
  const startIndex = (currentPage - 1) * zonesPerPage;
  const currentZones = filteredZones.slice(startIndex, startIndex + zonesPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-[#0a100d]">
      <ToastContainer />
      {/* Header */}
       <div className="flex items-center justify-end mb-6">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[#a22c29] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#902923] transition"
          >
            <FaPlus />
            <span>Add Zone</span>
          </button>
        </div>

      {/* Search and Filter */}
      <div className="flex justify-between mb-6 space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by ZIP code"
          className="w-full rounded-lg border-[1.5px] border-gray-300 dark:border-[#b9baa3] bg-transparent py-3 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:outline-none focus:ring-2 focus:ring-[#a22c29]"
        />
        <select
          value={filterOpen}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="rounded-lg border-[1.5px] border-gray-300 dark:border-[#b9baa3] bg-transparent py-3 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:outline-none focus:ring-2 focus:ring-[#a22c29]"
        >
          <option value="">All</option>
          <option value="true">Open</option>
          <option value="false">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#b9baa3] text-left">
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                GeoPoint
              </th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                Minimum Order Amount
              </th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                ZIP Code
              </th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                Is Open
              </th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentZones.map((zone) => (
              <tr
                key={zone.id}
                className="border-t hover:bg-gray-100 dark:hover:bg-[#d6d5c9]"
              >
                <td className="px-4 py-2 text-gray-800 dark:text-[#d6d5c9]">
                  {zone.GeoPoint.latitude}, {zone.GeoPoint.longitude}
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-[#d6d5c9]">
                  ${zone.MinimumOrderAmount.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-[#d6d5c9]">
                  {zone.ZIPCode}
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-[#d6d5c9]">
                  {zone.isOpen ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 flex items-center space-x-4">
                  <button
                    onClick={() => setDeleteId(zone.id)}
                    className="text-gray-500 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Zone Modal */}
      {isAdding && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white dark:bg-[#0a100d] rounded-lg p-8 shadow-lg w-[90%] max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-[#d6d5c9] mb-6 text-center">
        Add Zone
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddZone();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latitude */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
              Latitude
            </label>
            <input
              type="number"
              value={newZone.GeoPoint.latitude}
              onChange={(e) =>
                setNewZone((prev) => ({
                  ...prev,
                  GeoPoint: {
                    ...prev.GeoPoint,
                    latitude: parseFloat(e.target.value),
                  },
                }))
              }
              className="w-full rounded-lg border-[1.5px] py-2 px-4 focus:ring-[#a22c29] focus:border-[#a22c29] border-gray-300 dark:border-[#b9baa3] bg-transparent text-gray-800 dark:bg-[#d6d5c9] dark:text-[#0a100d]"
              step="any"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
              Longitude
            </label>
            <input
              type="number"
              value={newZone.GeoPoint.longitude}
              onChange={(e) =>
                setNewZone((prev) => ({
                  ...prev,
                  GeoPoint: {
                    ...prev.GeoPoint,
                    longitude: parseFloat(e.target.value),
                  },
                }))
              }
              className="w-full rounded-lg border-[1.5px] py-2 px-4 focus:ring-[#a22c29] focus:border-[#a22c29] border-gray-300 dark:border-[#b9baa3] bg-transparent text-gray-800 dark:bg-[#d6d5c9] dark:text-[#0a100d]"
              step="any"
            />
          </div>

          {/* Minimum Order Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
              Minimum Order Amount
            </label>
            <input
              type="number"
              value={newZone.MinimumOrderAmount}
              onChange={(e) =>
                setNewZone((prev) => ({
                  ...prev,
                  MinimumOrderAmount: parseFloat(e.target.value),
                }))
              }
              className="w-full rounded-lg border-[1.5px] py-2 px-4 focus:ring-[#a22c29] focus:border-[#a22c29] border-gray-300 dark:border-[#b9baa3] bg-transparent text-gray-800 dark:bg-[#d6d5c9] dark:text-[#0a100d]"
            />
          </div>

          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={newZone.ZIPCode}
              onChange={(e) =>
                setNewZone((prev) => ({ ...prev, ZIPCode: e.target.value }))
              }
              className="w-full rounded-lg border-[1.5px] py-2 px-4 focus:ring-[#a22c29] focus:border-[#a22c29] border-gray-300 dark:border-[#b9baa3] bg-transparent text-gray-800 dark:bg-[#d6d5c9] dark:text-[#0a100d]"
            />
          </div>
        </div>

        {/* Is Open */}
        <div className="flex items-center space-x-3 mt-6">
          <input
            type="checkbox"
            checked={newZone.isOpen}
            onChange={(e) =>
              setNewZone((prev) => ({ ...prev, isOpen: e.target.checked }))
            }
            className="w-4 h-4 rounded focus:ring-[#a22c29] text-[#a22c29]"
          />
          <label className="text-sm font-medium text-gray-800 dark:text-[#d6d5c9]">
            Is Open
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-4 py-2 bg-gray-300 dark:bg-[#d6d5c9] text-gray-800 dark:text-[#0a100d] rounded-lg hover:bg-gray-400 dark:hover:bg-[#b9baa3] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#a22c29] text-white rounded-lg hover:bg-[#902923] transition"
          >
            Add Zone
          </button>
        </div>
      </form>
    </div>
  </div>
)}
<div className="flex justify-center mt-6">
        <Pagination
          count={Math.ceil(filteredZones.length / zonesPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>

  
        {/* Delete Confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-[#0a100d] rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[#d6d5c9] mb-4">
                Are you sure you want to delete this zone?
              </h2>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteZone}
                  className="px-4 py-2 bg-[#a22c29] text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          
        )}
      </div>
    );
  };
  
  export default ListZones;
  
