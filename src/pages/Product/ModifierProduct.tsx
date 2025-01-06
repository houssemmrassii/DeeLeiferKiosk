import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../../FirebaseConfig";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Select from "react-select";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Category {
  id: string;
  name: string;
  types: { value: string; label: string }[];
}

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    origin: "",
    isSpecial: false,
    isOffre: false,
    offrePercentage: 0,
    allergies: "",
    conservationStorage: "",
    ingredients: "",
    images: [] as (File | string)[],
    category: null as Category | null,
    types: [] as { value: string; label: string }[],
  });
  const [uploading, setUploading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error("Product ID is missing.");
      navigate("/ProductList");
      return;
    }

    const fetchCategoriesAndProduct = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, "category"));
        const categoriesData = await Promise.all(
          categorySnapshot.docs.map(async (categoryDoc) => {
            const categoryData = categoryDoc.data();
            const typeRefs = categoryData.types || [];

            const resolvedTypes = await Promise.all(
              typeRefs.map(async (typeRef: any) => {
                let typeId: string | undefined;

                if (typeof typeRef === "string") {
                  typeId = typeRef.split("/").pop();
                } else if (typeRef?.path) {
                  typeId = typeRef.path.split("/").pop();
                }

                if (typeId) {
                  const typeDoc = await getDoc(doc(db, "type", typeId));
                  if (typeDoc.exists()) {
                    const typeData = typeDoc.data() as { name: string };
                    return { value: typeId, label: typeData.name || "Unnamed Type" };
                  }
                }

                return { value: "", label: "Unknown Type" };
              })
            );

            return {
              id: categoryDoc.id,
              name: categoryData.name || "Unnamed Category",
              types: resolvedTypes.filter((type) => type.value),
            };
          })
        );

        setCategories(categoriesData);

        const productDocRef = doc(db, "Product", id);
        const productDoc = await getDoc(productDocRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();

          const categoryRef = productData.category;
          const selectedCategory = categoriesData.find(
            (cat) => `/category/${cat.id}` === (categoryRef?.path || categoryRef)
          );

          const mappedTypes =
            selectedCategory && Array.isArray(productData.types)
              ? productData.types.map((typeRef: any) => {
                  const typeId =
                    typeof typeRef === "string"
                      ? typeRef.split("/").pop()
                      : typeRef?.path.split("/").pop();

                  return (
                    selectedCategory.types.find((type) => type.value === typeId) || {
                      value: "",
                      label: "Unknown Type",
                    }
                  );
                })
              : [];

          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            price: parseFloat(productData.price) || 0,
            origin: productData.origin || "",
            isSpecial: productData.isSpecial || false,
            isOffre: productData.isOffre || false,
            offrePercentage: parseFloat(productData.offrePercentage) || 0,
            allergies: productData.allergies || "",
            conservationStorage: productData.conservationStorage || "",
            ingredients: productData.ingredients || "",
            images: productData.images || [],
            category: selectedCategory || null,
            types: mappedTypes,
          });
        } else {
          toast.error("Product not found.");
          navigate("/ProductList");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProduct();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleCategoryChange = (selectedCategory: any) => {
    const category = categories.find((cat) => cat.id === selectedCategory?.value) || null;
    setFormData({ ...formData, category, types: [] });
  };

  const handleTypeChange = (selectedTypes: any) => {
    setFormData({ ...formData, types: selectedTypes || [] });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: [...formData.images, ...Array.from(e.target.files)] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0 || !formData.category) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      setUploading(true);

      const imageUrls = await Promise.all(
        formData.images.map(async (file) => {
          if (typeof file === "string") return file;
          const storageRef = ref(storage, `product_images/${(file as File).name}`);
          await uploadBytes(storageRef, file as File);
          return await getDownloadURL(storageRef);
        })
      );

      const updatedProductData = {
        ...formData,
        images: imageUrls,
        price: parseFloat(formData.price.toString()).toFixed(2),
        category: `/category/${formData.category?.id}`,
        types: formData.types.map((type) => `/type/${type.value}`),
      };

      await updateDoc(doc(db, "Product", id!), updatedProductData);
      toast.success("Product updated successfully!");

      navigate("/ListProduct");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <Breadcrumb pageName="Edit Product" />
  
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 px-4 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter product name"
            />
          </div>
  
          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 px-4 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter product price"
            />
          </div>
        </div>
  
        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 px-4 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter product description"
          />
        </div>
  
        {/* Category and Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
              Category
            </label>
            <Select
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              onChange={handleCategoryChange}
              value={
                formData.category
                  ? { value: formData.category.id, label: formData.category.name }
                  : null
              }
              placeholder="Select category"
              className="text-gray-800 dark:text-white"
            />
          </div>
  
          {/* Types */}
          {formData.category && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                Types
              </label>
              <Select
                options={formData.category.types}
                isMulti
                onChange={handleTypeChange}
                value={formData.types}
                placeholder="Select types"
                className="text-gray-800 dark:text-white"
              />
            </div>
          )}
        </div>
  
        {/* Special Offers and Origin */}
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center space-x-8">
            {/* Is Special */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isSpecial"
                checked={formData.isSpecial}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-500 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-semibold text-gray-700 dark:text-white">
                Is Special
              </label>
            </div>
  
            {/* Is Offer */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isOffre"
                checked={formData.isOffre}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-500 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-semibold text-gray-700 dark:text-white">
                Is Offer
              </label>
            </div>
          </div>
  
          {/* Offer Percentage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
              Offer Percentage
            </label>
            <div className="relative w-32">
              <input
                type="number"
                name="offrePercentage"
                value={formData.offrePercentage}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 px-4 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
              <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                %
              </span>
            </div>
          </div>
        </div>
  
        {/* More Options Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="text-blue-500 font-semibold hover:text-blue-700 transition"
          >
            {showMoreOptions ? "Hide Options" : "More Options"}
          </button>
        </div>
  
        {/* Conditional More Options */}
        {showMoreOptions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                Allergies
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 px-4"
                placeholder="Enter allergies"
              />
            </div>
  
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                Origin
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 px-4"
                placeholder="Enter origin"
              />
            </div>
  
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                Ingredients
              </label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 px-4"
                placeholder="Enter ingredients"
              />
            </div>
          </div>
        )}
  
        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
            Product Images
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer file:hover:bg-blue-600 focus:outline-none"
          />
        </div>
  
        {/* Submit Button */}
        <div className="flex justify-center">
        <button
          type="submit"
          className={`px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition ${
            uploading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={uploading}
        >
          {uploading ? "Saving..." : "Update Product"}
        </button>
        </div>
      </form>
    </div>
  );
  
};

export default EditProduct;
