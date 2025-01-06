import React, { useEffect, useState } from "react";
import { db, storage } from "../../FirebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import Select from "react-select";

interface AddCategoryProps {
  onClose: () => void;
  onSuccess: () => void;
  initialCategory?: {
    id: string;
    name: string;
    picture: string;
    types: any[]; // Array of Firestore document references
  };
}

interface Type {
  id: string;
  name: string;
}

const AddCategoryModal: React.FC<AddCategoryProps> = ({
  onClose,
  onSuccess,
  initialCategory,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    picture: null as File | null,
    pictureUrl: "",
    types: [] as { value: string; label: string }[], // Types stored as options
  });

  const [types, setTypes] = useState<Type[]>([]);
  const [uploading, setUploading] = useState(false);
  const isEdit = Boolean(initialCategory);

  // Fetch types for the dropdown
  useEffect(() => {
    const fetchTypes = async () => {
      const querySnapshot = await getDocs(collection(db, "type"));
      const typeData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      })) as Type[];
      setTypes(typeData);
    };

    fetchTypes();
  }, []);

  // Pre-fill form data if editing
  useEffect(() => {
    if (initialCategory) {
      const selectedTypes = initialCategory.types.map((typeRef) => {
        const id = typeRef.id; // Firestore document reference contains the ID
        const type = types.find((t) => t.id === id);
        return type ? { value: type.id, label: type.name } : null;
      }).filter(Boolean); // Filter out nulls
      setFormData({
        name: initialCategory.name,
        picture: null,
        pictureUrl: initialCategory.picture,
        types: selectedTypes as { value: string; label: string }[],
      });
    }
  }, [initialCategory, types]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, picture: e.target.files[0], pictureUrl: "" });
    }
  };

  const handleTypeChange = (selectedTypes: any) => {
    setFormData({ ...formData, types: selectedTypes });
  };

  const handleSubmit = async () => {
    if (!formData.name || (!formData.picture && !formData.pictureUrl)) {
      toast.error("Please provide a name and picture.");
      return;
    }

    try {
      setUploading(true);

      let pictureUrl = formData.pictureUrl;
      if (formData.picture) {
        // Upload new picture to Firebase Storage
        const storageRef = ref(
          storage,
          `category_pictures/${formData.picture.name}`
        );
        await uploadBytes(storageRef, formData.picture);
        pictureUrl = await getDownloadURL(storageRef);
      }

      const typeRefs = formData.types.map((type) =>
        doc(db, "type", type.value)
      );

      if (isEdit && initialCategory) {
        // Update category
        const categoryRef = doc(db, "category", initialCategory.id);
        await setDoc(categoryRef, {
          name: formData.name,
          picture: pictureUrl,
          types: typeRefs, // Store as Firestore document references
        });
        toast.success("Category updated successfully!");
      } else {
        // Add new category
        await addDoc(collection(db, "category"), {
          name: formData.name,
          picture: pictureUrl,
          types: typeRefs, // Store as Firestore document references
        });
        toast.success("Category added successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg dark:bg-[#1c1f1d]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[#d6d5c9] mb-4">
          {isEdit ? "Edit Category" : "Add New Category"}
        </h2>
        <div className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border-[1.5px] border-[#b9baa3] bg-transparent py-3 px-4 text-gray-800 dark:text-[#d6d5c9] focus:outline-none focus:ring-2 focus:ring-[#a22c29]"
            />
          </div>
  
          {/* Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
              Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-800 dark:text-[#d6d5c9] file:mr-4 file:py-2 file:px-4 file:border file:border-[#b9baa3] file:rounded-lg file:bg-[#a22c29] file:text-white hover:file:bg-[#902923]"
            />
            {formData.pictureUrl && (
              <img
                src={formData.pictureUrl}
                alt="Preview"
                className="w-16 h-16 mt-2 rounded-lg"
              />
            )}
          </div>
  
          {/* Types Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-[#d6d5c9] mb-2">
              Types
            </label>
            <Select
              options={types.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              value={formData.types}
              isMulti
              placeholder="Select types"
              onChange={handleTypeChange}
              className="text-gray-800"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#b9baa3",
                  "&:hover": { borderColor: "#a22c29" },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
          </div>
  
          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-[#b9baa3] text-[#0a100d] rounded-lg hover:bg-[#d6d5c9]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 text-sm text-white bg-[#a22c29] rounded-lg hover:bg-[#902923] ${
                uploading ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={uploading}
            >
              {uploading ? "Saving..." : isEdit ? "Update Category" : "Add Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default AddCategoryModal;
