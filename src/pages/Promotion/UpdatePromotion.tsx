import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const EditPromotion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateStart: "",
    dateEnd: "",
    maxNumber: 0,
    percentage: 0,
    image: "",
  });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        if (!id) throw new Error("No promotion ID provided.");
        const promotionDoc = doc(db, "Promotion", id);
        const promotionSnapshot = await getDoc(promotionDoc);

        if (promotionSnapshot.exists()) {
          const data = promotionSnapshot.data();
          setFormData({
            title: data.title || "",
            description: data.description || "",
            dateStart: data.dateStart
              ? new Date(data.dateStart.seconds * 1000).toISOString().slice(0, -1)
              : "",
            dateEnd: data.dateEnd
              ? new Date(data.dateEnd.seconds * 1000).toISOString().slice(0, -1)
              : "",
            maxNumber: data.maxNumber || 0,
            percentage: data.percentage || 0,
            image: data.image || "",
          });
        } else {
          toast.error("Promotion not found.");
          navigate("/ListPromotions");
        }
      } catch (error) {
        console.error("Error fetching promotion:", error);
        toast.error("Failed to fetch promotion.");
        navigate("/ListPromotions");
      }
    };

    fetchPromotion();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const validateForm = (): boolean => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.dateStart ||
      !formData.dateEnd ||
      !formData.percentage
    ) {
      toast.error("Please fill out all required fields.");
      return false;
    }
    return true;
  };

  const uploadImageToStorage = async (): Promise<string> => {
    if (!newImage) return formData.image;
    const imageRef = ref(storage, `promotion_images/${newImage.name}`);
    await uploadBytes(imageRef, newImage);
    return await getDownloadURL(imageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImageToStorage();
      const updatedPromotion = {
        ...formData,
        image: imageUrl,
        dateStart: new Date(formData.dateStart),
        dateEnd: new Date(formData.dateEnd),
      };

      await updateDoc(doc(db, "Promotion", id!), updatedPromotion);
      toast.success("Promotion updated successfully!");
      navigate("/ListPromotions");
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Failed to update promotion.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Edit Promotion" />
      <ToastContainer />

      <div className="container mx-auto p-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <h3 className="mb-4 text-lg font-medium text-black dark:text-white">Edit Promotion</h3>

          <div className="mb-4">
            <label htmlFor="title" className="mb-2 block text-black dark:text-white">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="mb-2 block text-black dark:text-white">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              rows={4}
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateStart" className="mb-2 block text-black dark:text-white">
                Start Date
              </label>
              <input
                type="datetime-local"
                id="dateStart"
                name="dateStart"
                value={formData.dateStart}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="dateEnd" className="mb-2 block text-black dark:text-white">
                End Date
              </label>
              <input
                type="datetime-local"
                id="dateEnd"
                name="dateEnd"
                value={formData.dateEnd}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="percentage" className="mb-2 block text-black dark:text-white">
              Discount Percentage
            </label>
            <input
              type="number"
              id="percentage"
              name="percentage"
              value={formData.percentage}
              onChange={handleInputChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="image" className="mb-2 block text-black dark:text-white">
              Upload New Image
            </label>
            <input
              type="file"
              id="image"
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white"
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Promotion"
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className={`rounded-lg bg-primary py-2 px-6 text-white transition hover:bg-opacity-90 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={uploading}
            >
              {uploading ? "Updating..." : "Update Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromotion;
