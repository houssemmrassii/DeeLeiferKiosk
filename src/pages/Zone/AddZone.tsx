import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { toast } from "react-toastify";

const AddZone: React.FC = () => {
  const [formData, setFormData] = useState({
    GeoPoint: { latitude: 0, longitude: 0 },
    MinimumOrderAmount: 0,
    ZIPCode: "",
    isOpen: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
  
    setFormData((prevState) => {
      if (type === "checkbox") {
        // For checkbox inputs, assign the boolean value
        return { ...prevState, [name]: (e.target as HTMLInputElement).checked };
      }
  
      if (name.includes("GeoPoint")) {
        // For GeoPoint inputs, assign the numeric value
        return {
          ...prevState,
          GeoPoint: {
            ...prevState.GeoPoint,
            [name.split(".")[1]]: parseFloat(value),
          },
        };
      }
  
      // For all other inputs, assign the string or numeric value as required
      return {
        ...prevState,
        [name]: name === "MinimumOrderAmount" ? parseFloat(value) : value,
      };
    });
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "Zone"), formData);
      toast.success("Zone added successfully!");
    } catch (error) {
      console.error("Error adding zone:", error);
      toast.error("Failed to add zone.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-[#0a100d]">
      <Breadcrumb pageName="Add Zone" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GeoPoint */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Latitude</label>
            <input
              type="number"
              name="GeoPoint.latitude"
              value={formData.GeoPoint.latitude}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3"
              placeholder="Enter latitude"
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Longitude</label>
            <input
              type="number"
              name="GeoPoint.longitude"
              value={formData.GeoPoint.longitude}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3"
              placeholder="Enter longitude"
              step="any"
            />
          </div>
        </div>

        {/* Minimum Order Amount */}
        <div>
          <label className="block text-sm font-semibold mb-2">Minimum Order Amount</label>
          <input
            type="number"
            name="MinimumOrderAmount"
            value={formData.MinimumOrderAmount}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="Enter minimum order amount"
            step="any"
          />
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-semibold mb-2">ZIP Code</label>
          <input
            type="text"
            name="ZIPCode"
            value={formData.ZIPCode}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-3"
            placeholder="Enter ZIP code"
          />
        </div>

        {/* Is Open */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isOpen"
            checked={formData.isOpen}
            onChange={handleInputChange}
            className="w-4 h-4 mr-2"
          />
          <label className="text-sm">Is Open</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Add Zone
        </button>
      </form>
    </div>
  );
};

export default AddZone;
