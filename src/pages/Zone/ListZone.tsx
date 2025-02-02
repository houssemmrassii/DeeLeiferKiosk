import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "@mui/material";
import AddZone from "./AddZone";

interface Zone {
  id: string;
  name: string;
  GeoPoint: { latitude: number; longitude: number };
  MinimumOrderAmount: number;
  ZIPCode: string;
  isOpen: boolean;
  Area: number;
}

const ListZones: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const zonesPerPage = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  // Approval Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const fetchZones = async () => {
    try {
      const zoneSnapshot = await getDocs(collection(db, "Zone"));
      const zonesData: Zone[] = zoneSnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Zone, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });

      setZones(zonesData);
      setFilteredZones(zonesData);
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
      fetchZones();
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
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterOpen(value);
    if (value) {
      const filtered = zones.filter((zone) => zone.isOpen.toString() === value);
      setFilteredZones(filtered);
    } else {
      setFilteredZones(zones);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
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
    fetchZones();
  };

  const confirmToggleZoneStatus = async () => {
    if (!selectedZone) return;
    try {
      const zoneRef = doc(db, "Zone", selectedZone.id);
      await updateDoc(zoneRef, { isOpen: !selectedZone.isOpen });
      toast.success(`Zone is now ${selectedZone.isOpen ? "closed" : "open"}!`);
      fetchZones();
    } catch (error) {
      console.error("Error updating zone status:", error);
      toast.error("Failed to update zone status.");
    }
    setConfirmModalOpen(false);
  };

  const openConfirmModal = (zone: Zone) => {
    setSelectedZone(zone);
    setConfirmModalOpen(true);
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * zonesPerPage;
  const currentZones = filteredZones.slice(startIndex, startIndex + zonesPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-[#0a100d]">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-[#d6d5c9]">Zone List</h1>
        <button
          onClick={openAddZoneModal}
          className="bg-[#a22c29] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#902923] transition"
        >
          <FaPlus />
          <span>Add Zone</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex justify-between mb-6 space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or ZIP code"
          className="w-full rounded-lg border-[1.5px] py-3 px-4"
        />
        <select
          value={filterOpen}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="rounded-lg border-[1.5px] py-3 px-4"
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
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">GeoPoint</th>
              <th className="px-4 py-2">Minimum Order Amount</th>
              <th className="px-4 py-2">ZIP Code</th>
              <th className="px-4 py-2">Area (km²)</th>
              <th className="px-4 py-2">Is Open</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentZones.map((zone) => (
              <tr key={zone.id} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2">{zone.name}</td>
                <td className="px-4 py-2">{zone.GeoPoint.latitude}, {zone.GeoPoint.longitude}</td>
                <td className="px-4 py-2">${zone.MinimumOrderAmount.toFixed(2)}</td>
                <td className="px-4 py-2">{zone.ZIPCode}</td>
                <td className="px-4 py-2">{zone.Area} km²</td>
                <td className="px-4 py-2">
                  <button
                    className={`px-4 py-1 rounded-full text-sm font-semibold
                      ${zone.isOpen ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"} 
                      hover:opacity-80 transition`}
                    onClick={() => openConfirmModal(zone)}
                  >
                    {zone.isOpen ? "Open" : "Closed"}
                  </button>
                </td>
                <td className="px-4 py-2 flex space-x-4">
  {/* Edit Button */}
  <button 
    onClick={() => openEditZoneModal(zone)} 
    className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
    title="Edit Zone"
  >
    <FaEdit />
  </button>

  {/* Delete Button */}
  <button 
    onClick={() => handleDeleteZone(zone.id)} 
    className="text-gray-500 hover:text-red-500 transition-colors duration-200"
    title="Delete Zone"
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
        <Pagination count={Math.ceil(filteredZones.length / zonesPerPage)} page={currentPage} onChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ListZones;
