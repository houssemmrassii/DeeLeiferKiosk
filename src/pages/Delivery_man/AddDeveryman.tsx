import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth, storage } from "../../FirebaseConfig"; // Import Firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";

const AddDeliveryman: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    email: "",
    phone_number: "",
    password: "",
    display_name: "",
    address: [{ address: "", title: "", location: { lat: "", lng: "" } }],
    photo_url: "",
    ShippingScore: 0,
    role: "Delivery_Man",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state && location.state.deliveryman) {
      const deliveryman = location.state.deliveryman;
      setFormData({ ...deliveryman, password: "" }); // Password can't be retrieved, so it's left empty
      setEditMode(true);
      setUserId(deliveryman.uid);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressChange = (index: number, field: string, value: string) => {
    const updatedAddress = [...formData.address];
  
    if (field.startsWith("location.")) {
      const subField = field.split(".")[1] as "lat" | "lng"; // Explicitly typing as either "lat" or "lng"
      updatedAddress[index].location[subField] = value; // TypeScript now knows the exact type
    } else if (field === "address" || field === "title") {
      updatedAddress[index][field] = value; // Safely update "address" or "title"
    }
  
    setFormData({ ...formData, address: updatedAddress });
  };
  
  const handleAddAddress = () => {
    setFormData({
      ...formData,
      address: [
        ...formData.address,
        { address: "", title: "", location: { lat: "", lng: "" } },
      ],
    });
  };

  const handleDeleteAddress = (index: number) => {
    const updatedAddress = formData.address.filter((_, i) => i !== index);
    setFormData({ ...formData, address: updatedAddress });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const uploadPhotoToStorage = async (): Promise<string> => {
    if (!photo) return formData.photo_url; // Return existing photo_url if no new photo is uploaded

    const photoRef = ref(storage, `deliveryman_photos/${photo.name}`);
    await uploadBytes(photoRef, photo);
    return await getDownloadURL(photoRef);
  };

  const validateForm = (): boolean => {
    if (
      !formData.firstName ||
      !formData.secondName ||
      !formData.email ||
      !formData.phone_number ||
      (!editMode && !formData.password) || // Password is required only for new deliverymen
      !formData.address.every(
        (addr) => addr.address && addr.title && addr.location.lat && addr.location.lng
      )
    ) {
      toast.error("Please fill all required fields correctly!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const photoURL = await uploadPhotoToStorage();

      if (editMode && userId) {
        // Update existing deliveryman
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, { ...formData, photo_url: photoURL }, { merge: true });
        toast.success("Delivery Man updated successfully!");
      } else {
        // Create new deliveryman
        const authUser = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const userRef = doc(db, "users", authUser.user.uid);
        await setDoc(userRef, {
          ...formData,
          uid: authUser.user.uid,
          photo_url: photoURL,
          created_time: new Date().toISOString(),
        });
        toast.success("Delivery Man added successfully!");
      }

      navigate("/ListDeliveryman");
    } catch (error) {
      console.error("Error saving delivery man:", error);
      toast.error("Failed to save delivery man. Please try again.");
    }
  };

  return (
    <div>
      <Breadcrumb pageName={editMode ? "Edit Delivery Man" : "Add Delivery Man"} />
      <ToastContainer />
  
      <div className="container mx-auto p-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#b9baa3] bg-white p-6 shadow-lg dark:border-[#b9baa3] dark:bg-[#1c1f1d]"
        >
          <h3 className="mb-4 text-lg font-medium text-black dark:text-[#d6d5c9]">
            {editMode ? "Edit Delivery Man" : "Add New Delivery Man"}
          </h3>
  
          {/* Personal Information */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-black dark:text-[#d6d5c9]"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="secondName"
                className="mb-2 block text-black dark:text-[#d6d5c9]"
              >
                Last Name
              </label>
              <input
                type="text"
                id="secondName"
                name="secondName"
                placeholder="Enter last name"
                value={formData.secondName}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
                required
              />
            </div>
          </div>
  
          {/* Contact Information */}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-black dark:text-[#d6d5c9]">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
              required
            />
          </div>
  
          <div className="mb-4">
            <label
              htmlFor="phone_number"
              className="mb-2 block text-black dark:text-[#d6d5c9]"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              placeholder="Enter phone number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
              required
            />
          </div>
  
          {!editMode && (
            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-2 block text-black dark:text-[#d6d5c9]"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-5 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
                required
              />
            </div>
          )}
  
          {/* Address Section */}
          <div className="mb-4">
            <label htmlFor="address" className="mb-2 block text-black dark:text-[#d6d5c9]">
              Addresses
            </label>
            {formData.address.map((addr, index) => (
              <div
                key={index}
                className="flex items-center gap-2 mb-2 p-2 rounded-lg border dark:border-[#b9baa3] hover:shadow-md"
              >
                <input
                  type="text"
                  placeholder="Title (e.g., Home)"
                  value={addr.title}
                  onChange={(e) =>
                    handleAddressChange(index, "title", e.target.value)
                  }
                  className="w-1/5 rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-2 px-4 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
                  required
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={addr.address}
                  onChange={(e) =>
                    handleAddressChange(index, "address", e.target.value)
                  }
                  className="w-2/5 rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-2 px-4 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
                  required
                />
                <input
                  type="text"
                  placeholder="Latitude"
                  value={addr.location.lat}
                  onChange={(e) =>
                    handleAddressChange(index, "location.lat", e.target.value)
                  }
                  className="w-1/5 rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-2 px-4 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
                  required
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={addr.location.lng}
                  onChange={(e) =>
                    handleAddressChange(index, "location.lng", e.target.value)
                  }
                  className="w-1/5 rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-2 px-4 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(index)}
                  className="text-[#a22c29] hover:text-[#902923] transition"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleAddAddress}
                className="text-[#a22c29] text-2xl font-bold hover:text-[#902923] transition"
              >
                ＋
              </button>
            </div>
          </div>
  
          {/* Photo Upload */}
          <div className="mb-4">
            <label
              htmlFor="photo"
              className="mb-2 block text-black dark:text-[#d6d5c9]"
            >
              Photo
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-2 px-4 text-black outline-none transition focus:border-[#a22c29] dark:border-[#d6d5c9] dark:bg-[#1c1f1d] dark:text-[#d6d5c9]"
            />
          </div>
  
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-lg bg-[#a22c29] py-2 px-6 text-white transition hover:bg-[#902923]"
            >
              {editMode ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default AddDeliveryman;
