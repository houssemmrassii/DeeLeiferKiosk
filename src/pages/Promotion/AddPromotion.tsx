import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "../../FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const generateRandomCode = (description: string) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const descPart = description.slice(0, 2).toUpperCase();
  return `${descPart}${code}`;
};

const AddPromotion: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateStart: "",
    dateEnd: "",
    maxNumber: 0,
    percentage: 0,
    image: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [promotionCode, setPromotionCode] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const validateForm = (): boolean => {
    const { title, description, dateStart, dateEnd, maxNumber, percentage, image } = formData;

    if (!title || !description || !dateStart || !dateEnd || !maxNumber || !percentage || !image) {
      toast.error("All fields are required.");
      return false;
    }

    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    if (startDate >= endDate) {
      toast.error("Start date must be before the end date.");
      return false;
    }

    return true;
  };

  const uploadImageToStorage = async (): Promise<string> => {
    if (!formData.image) {
      throw new Error("No image selected.");
    }
    const imageRef = ref(storage, `promotion_images/${formData.image.name}`);
    await uploadBytes(imageRef, formData.image);
    return await getDownloadURL(imageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImageToStorage();
      const code = generateRandomCode(formData.description);

      const newPromotion = {
        code,
        title: formData.title,
        description: formData.description,
        dateStart: new Date(formData.dateStart),
        dateEnd: new Date(formData.dateEnd),
        maxNumber: formData.maxNumber,
        percentage: formData.percentage,
        image: imageUrl,
        creationDate: new Date(),
      };

      const promotionRef = collection(db, "Promotion");
      await addDoc(promotionRef, newPromotion);

      setPromotionCode(code);
      setShowModal(true); // Show modal after successful addition
    } catch (error) {
      console.error("Error adding promotion code:", error);
      toast.error("Failed to add promotion code. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promotionCode);
    toast.success("Promotion code copied to clipboard!");
  };

  const handleNewPromotion = () => {
    setShowModal(false);
    setFormData({
      title: "",
      description: "",
      dateStart: "",
      dateEnd: "",
      maxNumber: 0,
      percentage: 0,
      image: null,
    });
    setPromotionCode("");
  };

  const handleCancel = () => {
    navigate("/ListPromotion");
  };

  return (
    <div>
      <Breadcrumb pageName="Add Promotion Code" />
      <ToastContainer />
  
      <div className="container mx-auto p-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#b9baa3] bg-white p-6 shadow-default dark:border-[#b9baa3] dark:bg-[#0a100d]"
        >
          <h3 className="mb-4 text-lg font-medium text-black dark:text-[#d6d5c9]">
            Add New Promotion Code
          </h3>
  
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="mb-2 block text-black dark:text-[#d6d5c9]">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter promotion title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#0a100d] dark:text-[#d6d5c9]"
              required
            />
          </div>
  
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="mb-2 block text-black dark:text-[#d6d5c9]">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter promotion description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#0a100d] dark:text-[#d6d5c9]"
              rows={4}
              required
            />
          </div>
  
          {/* Start and End Dates */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateStart" className="mb-2 block text-black dark:text-[#d6d5c9]">
                Start Date
              </label>
              <input
                type="datetime-local"
                id="dateStart"
                name="dateStart"
                value={formData.dateStart}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#0a100d] dark:text-[#d6d5c9]"
                required
              />
            </div>
  
            <div>
              <label htmlFor="dateEnd" className="mb-2 block text-black dark:text-[#d6d5c9]">
                End Date
              </label>
              <input
                type="datetime-local"
                id="dateEnd"
                name="dateEnd"
                value={formData.dateEnd}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#0a100d] dark:text-[#d6d5c9]"
                required
              />
            </div>
          </div>
  
          {/* Max Number and Percentage */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxNumber" className="mb-2 block text-black dark:text-[#d6d5c9]">
                Max Number
              </label>
              <input
                type="number"
                id="maxNumber"
                name="maxNumber"
                placeholder="Enter maximum number of uses"
                value={formData.maxNumber}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#0a100d] dark:text-[#d6d5c9]"
                required
              />
            </div>
  
            <div>
              <label htmlFor="percentage" className="mb-2 block text-black dark:text-[#d6d5c9]">
                Discount Percentage
              </label>
              <input
                type="number"
                id="percentage"
                name="percentage"
                placeholder="Enter discount percentage"
                value={formData.percentage}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#0a100d] dark:text-[#d6d5c9]"
                required
              />
            </div>
          </div>
  
          {/* Upload Image */}
          <div className="mb-4">
            <label htmlFor="image" className="mb-2 block text-black dark:text-[#d6d5c9]">
              Upload Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent outline-none transition file:mr-5 file:cursor-pointer file:border-0 file:bg-[#a22c29] file:py-3 file:px-5 file:text-white file:hover:bg-[#902923] dark:border-[#d6d5c9] dark:bg-[#0a100d] dark:file:bg-[#902923] dark:file:text-white"
              required
            />
          </div>
  
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className={`rounded-lg bg-[#a22c29] py-2 px-6 text-white transition hover:bg-[#902923] ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Add Promotion Code"}
            </button>
          </div>
        </form>
      </div>
  
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg dark:bg-[#0a100d]">
            <h3 className="text-lg font-medium text-black dark:text-[#d6d5c9] mb-4">
              Promotion Code Created
            </h3>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-black dark:text-[#d6d5c9]">
                {promotionCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="text-[#a22c29] hover:underline transition"
              >
                Copy Code
              </button>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleNewPromotion}
                className="rounded-lg bg-[#a22c29] py-2 px-4 text-white transition hover:bg-[#902923]"
              >
                Add Another
              </button>
              <button
                onClick={handleCancel}
                className="rounded-lg bg-[#b9baa3] py-2 px-4 text-[#0a100d] transition hover:bg-[#d6d5c9]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default AddPromotion;
