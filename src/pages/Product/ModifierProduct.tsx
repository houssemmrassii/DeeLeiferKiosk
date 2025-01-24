import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../../FirebaseConfig";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Select from "react-select";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name: string;
  types: { value: string; label: string }[];
}

interface Ingredient {
  name: string;
  quantity: string;
  calories: number;
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
    ingredients: [] as Ingredient[],
    images: [] as (File | string)[],
    category: null as Category | null,
    type: null as { value: string; label: string } | null,
  });
  const [uploading, setUploading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error("Product ID is missing.");
      navigate("/ListProduct");
      return;
    }

    const fetchCategoriesAndProduct = async () => {
      try {
        // Fetch categories
        const categorySnapshot = await getDocs(collection(db, "category"));
        const categoriesData = await Promise.all(
          categorySnapshot.docs.map(async (categoryDoc) => {
            const categoryData = categoryDoc.data();
            const typeRefs = categoryData.types || [];
            const resolvedTypes = await Promise.all(
              typeRefs.map(async (typeRef: any) => {
                const typeId =
                  typeof typeRef === "string"
                    ? typeRef.split("/").pop()
                    : typeRef?.path?.split("/").pop();

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

        // Fetch product
        const productDocRef = doc(db, "Product", id);
        const productDoc = await getDoc(productDocRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          const categoryRef = productData.category;
          const selectedCategory = categoriesData.find(
            (cat) => `/category/${cat.id}` === (categoryRef?.path || categoryRef)
          );

          const typeRef = productData.type?.path?.split("/").pop() || null;
          const selectedType = selectedCategory?.types.find((type) => type.value === typeRef) || null;

          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price || 0,
            origin: productData.origin || "",
            isSpecial: productData.isSpecial || false,
            isOffre: productData.isOffre || false,
            offrePercentage: productData.offrePercentage || 0,
            allergies: productData.allergies || "",
            conservationStorage: productData.conservationStorage || "",
            ingredients: productData.ingredients || [],
            images: productData.images || [],
            category: selectedCategory || null,
            type: selectedType,
          });
        } else {
          toast.error("Product not found.");
          navigate("/ListProduct");
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleCategoryChange = (selectedCategory: any) => {
    const category = categories.find((cat) => cat.id === selectedCategory?.value) || null;
    setFormData({ ...formData, category, type: null }); // Reset type when category changes
  };

  const handleTypeChange = (selectedType: any) => {
    setFormData({ ...formData, type: selectedType || null });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: [...formData.images, ...Array.from(e.target.files)] });
    }
  };

  const handleAddIngredient = () => {
    setFormData((prevState) => ({
      ...prevState,
      ingredients: [...prevState.ingredients, { name: "", quantity: "", calories: 0 }],
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prevState) => ({
      ...prevState,
      ingredients: prevState.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "name" | "quantity" | "calories"
  ) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      ingredients: prevState.ingredients.map((ingredient, i) =>
        i === index
          ? { ...ingredient, [field]: field === "calories" ? parseFloat(value) || 0 : value }
          : ingredient
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0 || !formData.category || !formData.type) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      setUploading(true);

      const imageUrls = await Promise.all(
        formData.images.map(async (file) => {
          if (typeof file === "string") return file;
          const storageRef = ref(storage, `product_images/${file.name}`);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })
      );

      const categoryRef = `/category/${formData.category.id}`;
      const typeRef = `/type/${formData.type.value}`;

      await updateDoc(doc(db, "Product", id!), {
        ...formData,
        images: imageUrls,
        category: categoryRef,
        type: typeRef,
      });

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
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-[#0a100d]">
      <Breadcrumb pageName="Edit Product" />
  
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-[#b9baa3] bg-transparent py-3 px-5 text-[#0a100d] dark:text-[#d6d5c9] placeholder-gray-400 focus:border-[#a22c29] focus:outline-none"
              placeholder="Enter product name"
            />
          </div>
  
          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-[#b9baa3] bg-transparent py-3 px-5 text-[#0a100d] dark:text-[#d6d5c9] placeholder-gray-400 focus:border-[#a22c29] focus:outline-none"
              placeholder="Enter product price"
            />
          </div>
        </div>
  
        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border border-[#b9baa3] bg-transparent py-3 px-5 text-[#0a100d] dark:text-[#d6d5c9] placeholder-gray-400 focus:border-[#a22c29] focus:outline-none"
            placeholder="Enter product description"
          />
        </div>
  
        {/* Category and Types */}
          {/* Pre-filled Category */}
        <div>
          <label className="text-sm">Category</label>
          <Select
            value={
              formData.category
                ? { value: formData.category.id, label: formData.category.name }
                : null
            }
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Pre-filled Type */}
        <div>
          <label className="text-sm">Type</label>
          <Select
            value={formData.type}
            options={formData.category?.types || []}
            onChange={handleTypeChange}
          />
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
                className="h-5 w-5 text-[#a22c29] border-[#b9baa3] rounded focus:ring-[#a22c29]"
              />
              <label className="ml-2 text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9]">
                Is Special
              </label>
            </div>
  
            {/* Is Offer with Offer Percentage */}
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                name="isOffre"
                checked={formData.isOffre}
                onChange={handleInputChange}
                className="h-5 w-5 text-[#a22c29] border-[#b9baa3] rounded focus:ring-[#a22c29]"
              />
              <label className="ml-2 text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9]">
                Is Offer
              </label>
  
              {formData.isOffre && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="offrePercentage"
                    value={formData.offrePercentage}
                    onChange={handleInputChange}
                    className="w-20 rounded-lg border border-[#b9baa3] bg-transparent py-2 px-3 text-[#0a100d] dark:text-[#d6d5c9] focus:border-[#a22c29] focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-sm font-semibold text-gray-500 dark:text-[#d6d5c9]">
                    %
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
  
        {/* More Options */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="text-[#a22c29] font-semibold hover:text-[#902923] transition"
          >
            {showMoreOptions ? "Hide Options" : "More Options"}
          </button>
        </div>
  
        {showMoreOptions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
                Allergies
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-[#b9baa3] bg-transparent py-3 px-5 text-[#0a100d] dark:text-[#d6d5c9]"
                placeholder="Enter allergies"
              />
            </div>
  
            <div>
              <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
                Origin
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-[#b9baa3] bg-transparent py-3 px-5 text-[#0a100d] dark:text-[#d6d5c9]"
                placeholder="Enter origin"
              />
            </div>
  
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-4">
                Ingredients
              </h3>
              {formData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 mb-4 bg-gray-100 p-4 rounded-lg shadow-md dark:bg-gray-800"
                >
                  <input
                    type="text"
                    placeholder="Ingredient Name"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(e, index, "name")}
                    className="flex-1 rounded-lg border border-gray-300 py-2 px-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Quantity (e.g., 150 ml)"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(e, index, "quantity")}
                    className="flex-1 rounded-lg border border-gray-300 py-2 px-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Calories"
                    value={ingredient.calories}
                    onChange={(e) => handleIngredientChange(e, index, "calories")}
                    className="flex-1 rounded-lg border border-gray-300 py-2 px-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  + Add Ingredient
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
            Product Images
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#a22c29] file:text-white file:cursor-pointer file:hover:bg-[#902923] focus:outline-none"
          />
        </div>
  
        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-[#a22c29] text-white font-semibold rounded-lg hover:bg-[#902923] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
