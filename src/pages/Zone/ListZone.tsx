import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "@mui/material";
import AddZone from "./AddZone";

interface Zone {
  id: string;
  name: string; // Zone name
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const zonesPerPage = 10; // Zones per page

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const fetchZones = async () => {
    try {
      const zoneSnapshot = await getDocs(collection(db, "Zone"));
      const zonesData = zoneSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.id.localeCompare(a.id)) as Zone[]; // Sort by newest first

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

  const handleDeleteZone = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Zone", id));
      fetchZones(); // Refresh the list
      toast.success("Zone deleted successfully!");
    } catch (error) {
      console.error("Error deleting zone:", error);
      toast.error("Failed to delete zone.");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const lowerQuery = query.toLowerCase();
    const filtered = zones.filter(
      (zone) =>
        zone.ZIPCode.toLowerCase().includes(lowerQuery) ||
        zone.name.toLowerCase().includes(lowerQuery)
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

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  const openAddZoneModal = () => {
    setIsEditing(false);
    setEditingZone(null);
    setIsModalOpen(true);
  };

  const openEditZoneModal = (zone: Zone) => {
    setIsEditing(true);
    setEditingZone(zone);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingZone(null);
    fetchZones(); // Refresh zones after closing modal
  };

  // Calculate zones for the current page
  const startIndex = (currentPage - 1) * zonesPerPage;
  const currentZones = filteredZones.slice(startIndex, startIndex + zonesPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-[#0a100d]">
      <ToastContainer />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-[#d6d5c9]">
          Zone List
        </h1>
        <button
          onClick={openAddZoneModal}
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
          placeholder="Search by name or ZIP code"
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
                Name
              </th>
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
                  {zone.name}
                </td>
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
                    onClick={() => openEditZoneModal(zone)}
                    className="text-gray-500 hover:text-blue-500 transition"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
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

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          count={Math.ceil(filteredZones.length / zonesPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddZone
          isEditing={isEditing}
          editingZone={editingZone}
          onClose={closeModal}
          onSuccess={closeModal}
        />
      )}
    </div>
  );
};

export default ListZones;
