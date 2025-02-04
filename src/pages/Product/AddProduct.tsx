import React, { useEffect, useState } from "react";
import { db, storage } from "../../FirebaseConfig";
import { collection, getDocs, doc, addDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Select from "react-select";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name: string;
  types: { value: string; label: string }[];
}

interface Type {
  id: string;
  name: string;
}

const AddProduct: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

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
    ingredients: [] as { name: string; quantity: string; calories: number }[],
    images: [] as File[],
    category: null as Category | null,
    type: null as { value: string; label: string } | null,
    hou: "", // ✅ NEW ATTRIBUTE

  });

  const [uploading, setUploading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    const fetchCategoriesAndTypes = async () => {
      try {
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
                    const typeData = typeDoc.data() as Type;
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
        setCategories(categoriesData as Category[]);
      } catch (error) {
        console.error("Error fetching categories or types:", error);
        toast.error("Failed to fetch categories or types.");
      }
    };

    fetchCategoriesAndTypes();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : name === "price"
        ? parseFloat(value) || 0
        : value;
  
    setFormData({ ...formData, [name]: parsedValue });
  };
  

  const handleCategoryChange = (selectedCategory: any) => {
    const category = categories.find((cat) => cat.id === selectedCategory?.value) || null;
    setFormData({ ...formData, category, type: null }); // Reset type when category changes
  };

  const handleTypeChange = (selectedType: any) => {
    setFormData({ ...formData, type: selectedType || null }); // Save single type
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) });
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
          const storageRef = ref(storage, `product_images/${file.name}`);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })
      );

      const categoryRef = doc(db, "category", formData.category.id);
      const typeRef = doc(db, "type", formData.type.value); // Convert type to a document reference

      await addDoc(collection(db, "Product"), {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        origin: formData.origin || "--",
        isSpecial: formData.isSpecial,
        isOffre: formData.isOffre,
        offrePercentage: formData.offrePercentage,
        allergies: formData.allergies || "--",
        conservationStorage: formData.conservationStorage || "--",
        ingredients: formData.ingredients,
        images: imageUrls,
        category: categoryRef, // Save category as a document reference
        type: typeRef, // Save type as a document reference
        creationDate: new Date(),
        status: "In Stock",
        hou: formData.hou, // ✅ NEW ATTRIBUTE ADDED

      });

      toast.success("Product added successfully!");
      setFormData({
        name: "",
        description: "",
        price: 0,
        origin: "",
        isSpecial: false,
        isOffre: false,
        offrePercentage: 0,
        allergies: "",
        conservationStorage: "",
        ingredients: [],
        images: [],
        category: null,
        type: null,
        hou: "", 
      });
      navigate("/ListProduct");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-[#0a100d]">
      <Breadcrumb pageName="Add Product" />
  
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
              Category
            </label>
            <Select
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              onChange={handleCategoryChange}
              placeholder="Select category"
              className="text-gray-800 dark:text-white"
            />

              <option value="">Select Category</option>
              {/* Add options dynamically here */}
            
          </div>
  
          {/* Types */}
          {formData.category && (
  <div>
    <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
      Types
    </label>
    <Select
  options={formData.category?.types || []} // Dynamically loaded from selected category
  onChange={handleTypeChange} // Updates formData.type
  value={formData.type}
  placeholder="Select a type"
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
        {/* New Field for hou */}
<div>
  <label className="block text-sm font-semibold text-[#0a100d] dark:text-[#d6d5c9] mb-2">
    Hou
  </label>
  <input
    type="text"
    name="hou"
    value={formData.hou}
    onChange={handleInputChange}
    className="w-full rounded-lg border border-[#b9baa3] bg-transparent py-3 px-5 text-[#0a100d] dark:text-[#d6d5c9] placeholder-gray-400 focus:border-[#a22c29] focus:outline-none"
    placeholder="Enter Hou"
  />
</div>

  
        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-[#a22c29] text-white font-semibold rounded-lg hover:bg-[#902923] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading}
          >
            {uploading ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
  
  
};

export default AddProduct;
