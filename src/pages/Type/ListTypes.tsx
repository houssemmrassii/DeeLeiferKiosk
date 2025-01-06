import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";

interface Type {
  id: string;
  name: string;
}

const ListTypes = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      const querySnapshot = await getDocs(collection(db, "type"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setTypes(data);
    };

    fetchTypes();
  }, []);

  const handleAddType = async () => {
    if (!newTypeName.trim()) {
      toast.error("Type name cannot be empty.");
      return;
    }

    try {
      await addDoc(collection(db, "type"), { name: newTypeName });
      toast.success("Type added successfully!");
      setIsAdding(false);
      setNewTypeName("");
      const updatedTypes = await getDocs(collection(db, "type"));
      const data = updatedTypes.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setTypes(data);
    } catch (error) {
      console.error("Error adding type:", error);
      toast.error("Failed to add type. Please try again.");
    }
  };

  const handleDeleteType = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "type", deleteId));
      setTypes(types.filter((type) => type.id !== deleteId));
      toast.success("Type deleted successfully!");
      setDeleteId(null);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting type:", error);
      toast.error("Failed to delete type. Please try again.");
    }
  };

  const filteredTypes = types.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-[#0a100d] sm:px-7.5 xl:pb-1">
      <ToastContainer />
  
      {/* Top Bar */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border-[1.5px] border-gray-300 dark:border-[#b9baa3] bg-transparent py-2 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:outline-none focus:ring-2 focus:ring-[#a22c29]"
        />
        <button
          className="rounded-lg bg-[#a22c29] py-2 px-6 text-white transition hover:bg-[#902923] flex items-center space-x-2"
          onClick={() => setIsAdding(true)}
        >
          <FaPlus />
          <span>Add Type</span>
        </button>
      </div>
  
      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto text-center">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#b9baa3]">
              <th className="min-w-[200px] py-4 px-4 font-medium text-gray-600 dark:text-[#0a100d]">
                Type Name
              </th>
              <th className="py-4 px-4 font-medium text-gray-600 dark:text-[#0a100d]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTypes.map((type) => (
              <tr key={type.id} className="border-t hover:bg-gray-100 dark:hover:bg-[#d6d5c9]">
                <td className="border-b border-gray-300 py-5 px-4 dark:border-strokedark text-center">
                  <p className="text-gray-800 dark:text-[#d6d5c9]">{type.name}</p>
                </td>
                <td className="border-b border-gray-300 py-5 px-4 dark:border-strokedark text-center">
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      className="text-gray-500 hover:text-blue-500 transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-gray-500 hover:text-red-500 transition"
                      title="Delete"
                      onClick={() => {
                        setDeleteId(type.id);
                        setIsDeleting(true);
                      }}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Add Type Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg dark:bg-[#0a100d]">
            <h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-[#d6d5c9]">
              Add New Type
            </h2>
            <input
              type="text"
              placeholder="Type Name"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-gray-300 dark:border-[#b9baa3] bg-transparent py-2 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:outline-none focus:ring-2 focus:ring-[#a22c29] mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsAdding(false)}
                className="rounded-lg bg-[#b9baa3] py-2 px-4 text-[#0a100d] hover:bg-[#d6d5c9] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddType}
                className="rounded-lg bg-[#a22c29] py-2 px-4 text-white hover:bg-[#902923] transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg dark:bg-[#0a100d]">
            <h2 className="mb-4 text-lg font-medium text-gray-800 dark:text-[#d6d5c9]">
              Are you sure you want to delete this type?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleting(false)}
                className="rounded-lg bg-[#b9baa3] py-2 px-4 text-[#0a100d] hover:bg-[#d6d5c9] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteType}
                className="rounded-lg bg-[#a22c29] py-2 px-4 text-white hover:bg-[#902923] transition"
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

export default ListTypes;
