import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  FaDollarSign,
  FaTags,
  FaStar,
  FaWarehouse,
  FaListUl,
} from "react-icons/fa";

const DetailsProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (id) {
          const productDoc = doc(db, "Product", id);
          const productSnapshot = await getDoc(productDoc);

          if (productSnapshot.exists()) {
            const productData = productSnapshot.data();

            // Fetch category name
            if (productData.category) {
              const categoryRef = productData.category.path || productData.category;
              const categoryId = categoryRef.split("/").pop();
              if (categoryId) {
                const categoryDoc = await getDoc(doc(db, "category", categoryId));
                if (categoryDoc.exists()) {
                  setCategoryName(categoryDoc.data()?.name || "Unknown Category");
                }
              }
            }

            // Fetch types names
            if (Array.isArray(productData.types)) {
              const typeNames = await Promise.all(
                productData.types.map(async (typeRef: any) => {
                  const typeId =
                    typeof typeRef === "string" ? typeRef.split("/").pop() : typeRef?.path.split("/").pop();
                  if (typeId) {
                    const typeDoc = await getDoc(doc(db, "type", typeId));
                    return typeDoc.exists() ? typeDoc.data()?.name || "Unknown Type" : "Unknown Type";
                  }
                  return "Unknown Type";
                })
              );
              setTypeNames(typeNames);
            }

            setProduct(productData);
          } else {
            console.error("Product not found");
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

 return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-5 gap-8">
        {/* Left Column: Product Details */}
        <div className="col-span-5 xl:col-span-3">
          <div className="rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800">
            <div className="border-b border-gray-300 py-4 px-6 dark:border-gray-600">
              <h3 className="font-semibold text-xl text-black dark:text-white">Product Details</h3>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Product Name:{" "}
                <span className="font-normal text-gray-700 dark:text-gray-300">{product.name}</span>
              </h1>
              <h2 className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Category:{" "}
                <span className="font-medium text-gray-800 dark:text-white">{categoryName}</span>
              </h2>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Types</h3>
                <div className="flex flex-wrap gap-2">
                  {typeNames.length > 0 ? (
                    typeNames.map((type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      >
                        {type}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-800 dark:text-white">No types available</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center mb-6">
                <div>
                  <FaDollarSign className="text-3xl text-blue-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Price</p>
                  <p className="text-gray-800 dark:text-white">{`${product.price} €`}</p>
                </div>
                <div>
                  <FaWarehouse className="text-3xl text-blue-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Stock</p>
                  <p className="text-gray-800 dark:text-white">{product.status}</p>
                </div>
                <div>
                  <FaTags className="text-3xl text-blue-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    Offer Percentage
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {product.isOffre ? `${product.offrePercentage}%` : "0%"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h3>
                <p className="text-gray-800 dark:text-gray-300">{product.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Images */}
        <div className="col-span-5 xl:col-span-2">
          <div className="rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800">
            <div className="border-b border-gray-300 py-4 px-6 dark:border-gray-600">
              <h3 className="font-semibold text-xl text-black dark:text-white">Product Images</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {product.images?.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product Image ${index + 1}`}
                  className="h-32 w-full rounded-md object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Customer Reviews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {product.reviews?.length > 0 ? (
            product.reviews.map((review: any, index: number) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-600"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={review.userPicture || "/placeholder-avatar.png"}
                    alt={review.userName || "User"}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-black dark:text-white">
                      {review.userName || "Anonymous"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-lg ${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-800 dark:text-gray-300">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-800 dark:text-gray-300">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsProduct;
