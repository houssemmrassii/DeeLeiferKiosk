import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { FaTrashAlt, FaPlus, FaEdit } from "react-icons/fa";
import AddCategoryModal from "./AddCategoryModal"; // Import the AddCategoryModal component
import "react-toastify/dist/ReactToastify.css";

interface Category {
  id: string;
  name: string;
  picture: string;
  types: any[]; // Array of Firestore document references
}

interface Type {
  id: string;
  name: string;
}

const ListCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const categorySnapshot = await getDocs(collection(db, "category"));
  
      const categoriesData = await Promise.all(
        categorySnapshot.docs.map(async (categoryDoc) => {
          const categoryData = categoryDoc.data();
          const typeRefs = categoryData.types || [];
  
          console.log("Type References:", typeRefs); // Debug log to check typeRefs
  
          // Resolve Firestore document references to names
          const resolvedTypes = await Promise.all(
            typeRefs.map(async (typeRef: any) => {
              if (!typeRef || typeof typeRef.path !== "string") {
                console.error("Invalid type reference:", typeRef);
                return { id: "unknown", name: "Unknown Type" };
              }
  
              try {
                const typeDoc = await getDoc(typeRef); // Use Firestore reference directly
                if (typeDoc.exists()) {
                  const typeData = typeDoc.data() as Type;
                  return { id: typeDoc.id, name: typeData.name || "Unnamed Type" };
                } else {
                  return { id: "unknown", name: "Unknown Type" };
                }
              } catch (error) {
                console.error("Error resolving type reference:", typeRef, error);
                return { id: "error", name: "Unknown Type" };
              }
            })
          );
  
          return {
            id: categoryDoc.id,
            name: categoryData.name || "Unnamed Category",
            picture: categoryData.picture || "",
            types: resolvedTypes, // Resolved type objects
          };
        })
      );
  
      setCategories(categoriesData as Category[]);
      setFilteredCategories(categoriesData as Category[]); // Set filtered categories initially
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories.");
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "category", deleteId));
      const updatedCategories = categories.filter(
        (category) => category.id !== deleteId
      );
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      toast.success("Category deleted successfully!");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const lowerQuery = query.toLowerCase();
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(lowerQuery) ||
        category.types.some((type) =>
          type.name.toLowerCase().includes(lowerQuery)
        )
    );
    setFilteredCategories(filtered);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-[#0a100d]">
      <ToastContainer />
  
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-[#d6d5c9]">
          Categories
        </h1>
        <button
          onClick={() => {
            setEditingCategory(null); // Reset editing category
            setIsAdding(true);
          }}
          className="bg-[#a22c29] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#902923] transition"
        >
          <FaPlus />
          <span>Add Category</span>
        </button>
      </div>
  
      {/* Search Field */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or type"
          className="w-full rounded-lg border-[1.5px] border-gray-300 dark:border-[#b9baa3] bg-transparent py-3 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:outline-none focus:ring-2 focus:ring-[#a22c29]"
        />
      </div>
  
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#b9baa3] text-left">
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                Picture
              </th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                Name
              </th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                Types
              </th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-[#0a100d]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr
                key={category.id}
                className="border-t hover:bg-gray-100 dark:hover:bg-[#d6d5c9]"
              >
                <td className="px-4 py-2">
                  <img
                    src={category.picture}
                    alt={category.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-[#d6d5c9]">
                  {category.name}
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-[#d6d5c9]">
                  {category.types.length > 0
                    ? category.types.map((type) => type.name).join(", ")
                    : "No types"}
                </td>
                <td className="px-4 py-2 flex items-center space-x-4">
  {/* Edit Icon */}
  <button
    onClick={() => {
      setEditingCategory(category); // Pass the category to edit
      setIsAdding(true);
    }}
    className="text-gray-500 hover:text-blue-500 transition"
    title="Edit"
  >
    <FaEdit />
  </button>

  {/* Delete Icon */}
  <button
    onClick={() => setDeleteId(category.id)}
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
  
      {/* Add/Edit Category Modal */}
      {isAdding && (
        <AddCategoryModal
          onClose={() => setIsAdding(false)}
          onSuccess={fetchCategories}
          initialCategory={editingCategory || undefined}
        />
      )}
  
      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#0a100d] rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#d6d5c9] mb-4">
              Are you sure you want to delete this category?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-[#b9baa3] text-[#0a100d] rounded-lg hover:bg-[#d6d5c9] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-[#a22c29] text-white rounded-lg hover:bg-[#902923] transition"
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

export default ListCategories;
