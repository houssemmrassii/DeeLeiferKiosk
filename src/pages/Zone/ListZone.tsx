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
  const [loading, setLoading] = useState(true);
  const zonesPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  // Confirmation Modal States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    let filtered = zones;
  
    if (searchQuery) {
      filtered = filtered.filter((zone) =>
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.ZIPCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    if (filterOpen !== "") {
      filtered = filtered.filter((zone) => zone.isOpen === (filterOpen === "true"));
    }
  
    setFilteredZones(filtered);
  }, [searchQuery, filterOpen, zones]);
  

  const fetchZones = async () => {
    setLoading(true);
    try {
      const zoneSnapshot = await getDocs(collection(db, "Zone"));
      const zonesData: Zone[] = zoneSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as Zone);

      setZones(zonesData);
      setFilteredZones(zonesData);
    } catch (error) {
      console.error("Error fetching zones:", error);
      toast.error("Failed to fetch zones.");
    }
    setLoading(false);
  };

  const handleDeleteZone = async () => {
    if (!selectedZone) return;
    try {
      await deleteDoc(doc(db, "Zone", selectedZone.id));
      toast.success("Zone deleted successfully!");
      fetchZones();
    } catch (error) {
      console.error("Error deleting zone:", error);
      toast.error("Failed to delete zone.");
    }
    setDeleteModalOpen(false);
  };

  const confirmToggleZoneStatus = async () => {
    if (!selectedZone) return;
    try {
      const zoneRef = doc(db, "Zone", selectedZone.id);
      await updateDoc(zoneRef, { isOpen: !selectedZone.isOpen });
      toast.success(`Zone is now ${selectedZone.isOpen ? "Closed" : "Open"}!`);
      fetchZones();
    } catch (error) {
      console.error("Error updating zone status:", error);
      toast.error("Failed to update zone status.");
    }
    setConfirmModalOpen(false);
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

  const openConfirmModal = (zone: Zone) => {
    setSelectedZone(zone);
    setConfirmModalOpen(true);
  };

  const openDeleteModal = (zone: Zone) => {
    setSelectedZone(zone);
    setDeleteModalOpen(true);
  };

  const indexOfLastZone = currentPage * zonesPerPage;
  const indexOfFirstZone = indexOfLastZone - zonesPerPage;
  const displayedZones = filteredZones.slice(indexOfFirstZone, indexOfLastZone);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-center">
      <ToastContainer />
  
      {/* Header & Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Zone List</h1>
        <button
          onClick={openAddZoneModal}
          className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <FaPlus /> Add Zone
        </button>
      </div>
  
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:justify-between mb-4 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Search by ZIP Code or Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-2/3 border p-3 rounded-lg text-lg"
        />
        <select
          value={filterOpen}
          onChange={(e) => setFilterOpen(e.target.value)}
          className="border p-3 rounded-lg text-lg"
        >
          <option value="">All</option>
          <option value="true">Open</option>
          <option value="false">Closed</option>
        </select>
      </div>
  
      {/* Zones Table */}
      {loading ? (
        <p>Loading zones...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">Name</th>
                <th className="p-3">ZIP Code</th>
                <th className="p-3">Area (km²)</th>
                <th className="p-3">Is Open</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedZones.map((zone) => (
                <tr key={zone.id} className="border-t hover:bg-gray-100">
                  <td className="p-3">{zone.name}</td>
                  <td className="p-3">{zone.ZIPCode}</td>
                  <td className="p-3">{zone.Area} km²</td>
                  <td className="p-3">
                    <button
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        zone.isOpen ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                      }`}
                      onClick={() => openConfirmModal(zone)}
                    >
                      {zone.isOpen ? "Open" : "Closed"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => openEditZoneModal(zone)} className="text-blue-500 mx-2"><FaEdit /></button>
                    <button onClick={() => openDeleteModal(zone)} className="text-red-500"><FaTrashAlt /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {/* Centered Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination count={Math.ceil(filteredZones.length / zonesPerPage)} page={currentPage} onChange={(e, value) => setCurrentPage(value)} />
      </div>
  
      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddZone
          isEditing={isEditing}
          editingZone={editingZone}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchZones}
        />
      )}
  
      {/* Confirmation Modal for Open/Close Status */}
      {confirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Status Change</h2>
            <p className="mb-6">Are you sure you want to {selectedZone?.isOpen ? "close" : "open"} "{selectedZone?.name}"?</p>
            <div className="flex justify-between">
              <button onClick={confirmToggleZoneStatus} className="bg-green-500 text-white px-4 py-2 rounded w-1/2 mr-2">Confirm</button>
              <button onClick={() => setConfirmModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded w-1/2">Cancel</button>
            </div>
          </div>
        </div>
      )}
  
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete "{selectedZone?.name}"?</p>
            <div className="flex justify-between">
              <button onClick={handleDeleteZone} className="bg-red-500 text-white px-4 py-2 rounded w-1/2 mr-2">Delete</button>
              <button onClick={() => setDeleteModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded w-1/2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default ListZones;
