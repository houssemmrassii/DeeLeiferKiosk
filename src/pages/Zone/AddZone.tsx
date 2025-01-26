import React, { useState, useEffect } from "react";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import { toast } from "react-toastify";

interface Zone {
  id?: string; // Firebase-provided ID
  name: string; // Name of the zone
  GeoPoint: { latitude: number; longitude: number };
  MinimumOrderAmount: number;
  ZIPCode: string;
  isOpen: boolean;
}

interface AddZoneProps {
  isEditing: boolean;
  editingZone: Zone | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddZone: React.FC<AddZoneProps> = ({ isEditing, editingZone, onClose, onSuccess }) => {
  const [zoneData, setZoneData] = useState<Zone>({
    name: "",
    GeoPoint: { latitude: 0, longitude: 0 },
    MinimumOrderAmount: 0,
    ZIPCode: "",
    isOpen: false,
  });

  useEffect(() => {
    if (isEditing && editingZone) {
      setZoneData(editingZone); // Prefill form if editing
    } else {
      setZoneData({
        name: "",
        GeoPoint: { latitude: 0, longitude: 0 },
        MinimumOrderAmount: 0,
        ZIPCode: "",
        isOpen: false,
      });
    }
  }, [isEditing, editingZone]);

  const handleChange = (field: string, value: any) => {
    setZoneData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingZone?.id) {
        // Update existing zone using the Firebase `id`
        const zoneRef = doc(db, "Zone", editingZone.id);
        const updatedData = {
          ...zoneData,
          GeoPoint: { ...zoneData.GeoPoint },
        };
        await updateDoc(zoneRef, updatedData); // Update the document
        toast.success("Zone updated successfully!");
      } else {
        // Add a new zone
        await addDoc(collection(db, "Zone"), zoneData); // Add a new document
        toast.success("Zone added successfully!");
      }
      onSuccess(); // Notify parent to refresh data
      onClose(); // Close modal
    } catch (error) {
      console.error("Error saving zone:", error);
      toast.error("Failed to save zone.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-[#0a100d] rounded-lg p-8 shadow-lg w-[90%] max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[#d6d5c9] mb-6 text-center">
          {isEditing ? "Edit Zone" : "Add Zone"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
                Zone Name
              </label>
              <input
                type="text"
                value={zoneData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full rounded-lg border-[1.5px] py-2 px-4"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
                Latitude
              </label>
              <input
                type="number"
                value={zoneData.GeoPoint.latitude}
                onChange={(e) =>
                  handleChange("GeoPoint", { ...zoneData.GeoPoint, latitude: parseFloat(e.target.value) })
                }
                className="w-full rounded-lg border-[1.5px] py-2 px-4"
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
                value={zoneData.GeoPoint.longitude}
                onChange={(e) =>
                  handleChange("GeoPoint", { ...zoneData.GeoPoint, longitude: parseFloat(e.target.value) })
                }
                className="w-full rounded-lg border-[1.5px] py-2 px-4"
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
                value={zoneData.MinimumOrderAmount}
                onChange={(e) => handleChange("MinimumOrderAmount", parseFloat(e.target.value))}
                className="w-full rounded-lg border-[1.5px] py-2 px-4"
              />
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={zoneData.ZIPCode}
                onChange={(e) => handleChange("ZIPCode", e.target.value)}
                className="w-full rounded-lg border-[1.5px] py-2 px-4"
              />
            </div>
          </div>

          {/* Is Open */}
          <div className="flex items-center space-x-3 mt-6">
            <input
              type="checkbox"
              checked={zoneData.isOpen}
              onChange={(e) => handleChange("isOpen", e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium text-gray-800 dark:text-[#d6d5c9]">Is Open</label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-[#d6d5c9] text-gray-800 dark:text-[#0a100d] rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-[#a22c29] text-white rounded-lg">
              {isEditing ? "Update Zone" : "Add Zone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddZone;
