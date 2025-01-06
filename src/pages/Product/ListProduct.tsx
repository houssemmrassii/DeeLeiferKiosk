import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../FirebaseConfig";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrashAlt, FaEdit, FaEye } from "react-icons/fa";
import Pagination from "@mui/material/Pagination";

interface Product {
  id: string;
  name: string;
  price: number;
  status: "In Stock" | "Out of Stock";
  images: string[];
  creationDate: Date;
}

const ListProduct: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStock, setFilterStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: "",
    productId: "",
    productName: "",
  });
  const productsPerPage = 5;

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const productSnapshot = await getDocs(collection(db, "Product"));
      const productsData = productSnapshot.docs.map((doc) => {
        const data = doc.data();
        const price = typeof data.price === "number" ? data.price : parseFloat(data.price);
        return {
          id: doc.id,
          name: data.name || "Unnamed Product",
          price: isNaN(price) ? 0 : price, // Default to 0 if price is invalid
          status: data.status || "In Stock",
          images: data.images || [],
          creationDate: data.creationDate?.toDate() || new Date(), // Convert Firestore timestamp to Date
        };
      }) as Product[];

      // Sort products by creationDate descending
      const sortedProducts = productsData.sort(
        (a, b) => b.creationDate.getTime() - a.creationDate.getTime()
      );

      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Product", id));
      setProducts(products.filter((product) => product.id !== id));
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    }
  };

  const toggleStockStatus = async (id: string, currentStatus: "In Stock" | "Out of Stock") => {
    const newStatus = currentStatus === "In Stock" ? "Out of Stock" : "In Stock";
    try {
      await updateDoc(doc(db, "Product", id), { status: newStatus });
      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, status: newStatus } : product
        )
      );
      setFilteredProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, status: newStatus } : product
        )
      );
      toast.success(`Product marked as ${newStatus}!`);
    } catch (error) {
      console.error("Error updating stock status:", error);
      toast.error("Failed to update stock status.");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFilters(query, filterStock);
  };

  const handleFilterStock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFilterStock(checked);
    applyFilters(searchQuery, checked);
  };

  const applyFilters = (query: string, stockFilter: boolean) => {
    let filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
    if (stockFilter) {
      filtered = filtered.filter((product) => product.status === "In Stock");
    }
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-[#0a100d]">
          <ToastContainer />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-[#d6d5c9]">
              Product List
            </h1>
            <button
              onClick={() => navigate("/AddProductPage")}
              className="px-4 py-2 bg-[#a22c29] text-white font-semibold rounded-lg hover:bg-[#902923] transition"
            >
              Add New Product
            </button>
          </div>
      
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by product name..."
              className="w-full sm:w-1/2 rounded-lg border border-gray-300 py-2 px-4 text-gray-800 dark:bg-[#b9baa3] dark:text-[#0a100d] focus:ring-2 focus:ring-[#a22c29] focus:outline-none"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="stockFilter"
                checked={filterStock}
                onChange={handleFilterStock}
                className="h-5 w-5 text-[#a22c29] border-gray-300 rounded focus:ring-2 focus:ring-[#a22c29]"
              />
              <label
                htmlFor="stockFilter"
                className="ml-2 text-sm text-gray-800 dark:text-[#d6d5c9]"
              >
                Show In Stock Only
              </label>
            </div>
          </div>
      
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-center">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#b9baa3]">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                    Photo
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                    Price
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-[#0a100d]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t hover:bg-gray-100 dark:hover:bg-[#d6d5c9]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <img
                          src={product.images[0] || "https://via.placeholder.com/50"}
                          alt={product.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-[#d6d5c9]">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-[#d6d5c9]">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        onClick={() =>
                          setConfirmModal({
                            show: true,
                            type: "status",
                            productId: product.id,
                            productName: product.name,
                          })
                        }
                        className={`cursor-pointer px-3 py-1 rounded-full text-sm font-semibold ${
                          product.status === "In Stock"
                            ? "bg-green-200 text-green-700"
                            : "bg-red-200 text-red-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-center items-center space-x-4">
                        <button
                          onClick={() => navigate(`/EditProduct/${product.id}`)}
                          className="text-gray-500 hover:text-[#a22c29] transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
      
                        <button
                          onClick={() => navigate(`/ProductDetails/${product.id}`)}
                          className="text-gray-500 hover:text-green-700 transition"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              type: "delete",
                              productId: product.id,
                              productName: product.name,
                            })
                          }
                          className="text-gray-500 hover:text-[#902923] transition"
                          title="Delete"
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
      
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Pagination
              count={Math.ceil(filteredProducts.length / productsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </div>
      
          {/* Confirmation Modal */}
          {confirmModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white dark:bg-[#0a100d] rounded-lg p-6 w-96 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-[#d6d5c9] mb-4">
                  {confirmModal.type === "delete"
                    ? `Are you sure you want to delete ${confirmModal.productName}?`
                    : `Are you sure ${confirmModal.productName} is out of stock?`}
                </h2>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() =>
                      setConfirmModal({
                        show: false,
                        type: "",
                        productId: "",
                        productName: "",
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-[#b9baa3] text-[#0a100d] hover:bg-[#d6d5c9] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirmModal.type === "delete") {
                        handleDeleteProduct(confirmModal.productId);
                      } else if (confirmModal.type === "status") {
                        const product = products.find(
                          (p) => p.id === confirmModal.productId
                        );
                        if (product) toggleStockStatus(product.id, product.status);
                      }
                      setConfirmModal({
                        show: false,
                        type: "",
                        productId: "",
                        productName: "",
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-[#a22c29] text-white hover:bg-[#902923] transition"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
      
};

export default ListProduct;
