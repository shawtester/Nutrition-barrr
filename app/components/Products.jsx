"use client";

import { useState } from "react";
import Link from "next/link";
import AuthContextProvider from "@/context/AuthContext";
import FavoriteButton from "./FavoriteButton";
import AddToCartButton from "./AddToCartButton";
import MyRating from "./MyRating";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import crypto from "crypto";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Utility function to generate a deterministic hash for product ID
function getDeterministicBadge(productId) {
  const badges = [
    { src: "/Trending.gif", alt: "Trending" },
    { src: "/Bestseller.gif", alt: "Bestseller" },
  ];
  const hash = crypto.createHash("md5").update(productId).digest("hex");
  const index = parseInt(hash.slice(-1), 16) % badges.length;
  return badges[index];
}

function RatingReview({ product }) {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const fetchReviewCounts = async () => {
      try {
        const data = await getProductReviewCounts({ productId: product?.id });
        setCounts(data);
      } catch (error) {
        console.error("Error fetching review counts:", error);
      }
    };

    if (product?.id) {
      fetchReviewCounts();
    }
  }, [product?.id]);

  if (!counts) {
    return (
      <div className="text-gray-500 text-sm flex items-center gap-2">
        <div className="w-5 h-5 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div> Loading reviews...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MyRating value={counts?.averageRating ?? 0} />
      <span className="text-sm text-gray-500">
        ({counts?.totalReviews ?? 0})
      </span>
    </div>
  );
}

export default function ProductsGridView({ products }) {
  return (
    <section className="w-full flex justify-center bg-gray-50 py-10">
      <div className="max-w-[1200px] w-full p-5">
        <h1 className="text-center text-xl font-bold mb-8">Products</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((item) => (
            <ProductCard
              product={item}
              key={item?.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product }) {
  const [selectedWeight, setSelectedWeight] = useState(product?.weights?.[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(product?.flavors?.[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track which image to show
  const [imageClicked, setImageClicked] = useState(false); // To track if image has been clicked
  const router = useRouter();

  const badge = getDeterministicBadge(product?.id || "default");

  // Change product images based on selected weight
  const handleWeightChange = (e) => {
    const weight = product.weights.find((w) => w.weight === e.target.value);
    setSelectedWeight(weight);
    setCurrentImageIndex(0); // Reset to the first image whenever weight changes
  };

  // Change to the next image
  const handleImageChange = () => {
    const nextIndex = (currentImageIndex + 1) % selectedWeight?.imageUrl.length;
    setCurrentImageIndex(nextIndex);
    setImageClicked(true); // Mark image as clicked
  };

  // Icon for veg/non-veg
  const vegIcon = product?.vegType === "veg" ? (
    <span className="text-green-500">🌱</span> // Green leaf icon for veg
  ) : (
    <span className="text-red-500">🍖</span> // Meat icon for non-veg
  );

  // Navigate to the product details page immediately without loader
  const handleProductClick = () => {
    router.push(`/products/${product?.id}`); // Navigate to the product page
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden relative transition-all hover:scale-105 hover:shadow-lg">
      {/* Badge */}
      <div className="absolute top-3 left-3 z-20">
        <img
          src={badge.src}
          alt={badge.alt}
          className="w-20 animate-bounce"
        />
      </div>

      {/* Product Image */}
      <div
        className="relative w-full bg-gray-100 transition-all transform duration-300"
        onClick={handleImageChange} // Change image on click
      >
        <img
          src={selectedWeight?.imageUrl[currentImageIndex]}
          alt={`${product?.title} - ${selectedWeight?.weight}`}
          className="w-full h-56 object-contain z-10"
        />
        
        {/* Message for user to tap (displayed once) */}
        {!imageClicked && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md opacity-80 max-w-[80%] text-center truncate">
            Tap to change image
          </div>
        )}

        <div className="absolute top-3 right-3 z-30">
          <AuthContextProvider>
            <FavoriteButton productId={product?.id} />
          </AuthContextProvider>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col justify-between h-full">
        {/* Title */}
        <div
          className="text-lg font-bold text-gray-700 hover:text-blue-500 line-clamp-2 transition-all cursor-pointer"
          onClick={handleProductClick} // Trigger navigation when title is clicked
        >
          {product?.title}
        </div>

        {/* Rating and Reviews */}
        <div className="mt-2">
          <RatingReview product={product} />
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-lg font-bold text-green-600">
            ₹ {selectedWeight?.salePrice}{" "}
            <span className="text-gray-500 line-through">
              ₹ {selectedWeight?.price}
            </span>
          </div>
        </div>

        {/* Veg/Non-Veg Icon */}
        <div className="mt-2 flex items-center gap-2">
          {vegIcon}
          <span className="text-sm font-medium">{product?.vegType === "veg" ? "Vegetarian" : "Non-Vegetarian"}</span>
        </div>

        {/* Flavor and Weight Selectors */}
        <div className="flex flex-col gap-3 mt-3">
          {product?.flavors?.length > 0 && (
            <div className="flex flex-col">
              <label htmlFor="flavors" className="text-sm font-medium text-gray-700">
                Flavor:
              </label>
              <select
                id="flavors"
                value={selectedFlavor?.name}
                onChange={(e) =>
                  setSelectedFlavor(
                    product.flavors.find((f) => f.name === e.target.value)
                  )
                }
                className="border rounded px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {product.flavors.map((flavor) => (
                  <option key={flavor.name} value={flavor.name}>
                    {flavor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedWeight && (
            <div className="flex flex-col">
              <label htmlFor="weights" className="text-sm font-medium text-gray-700">
                Weight:
              </label>
              <select
                id="weights"
                value={selectedWeight?.weight}
                onChange={handleWeightChange}
                className="border rounded px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {product.weights.map((weight) => (
                  <option key={weight.weight} value={weight.weight}>
                    {weight.weight}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Add to Cart (Clickable Background) */}
        <div
          className="mt-4 bg-blue-100 p-3 rounded-md flex items-center justify-center gap-2 hover:bg-blue-200 transition-all cursor-pointer"
        >
          <span className="text-blue-600 font-semibold text-sm">Add to Cart</span>
          <AuthContextProvider>
            <AddToCartButton
              productId={product?.id}
              selectedWeight={selectedWeight}
              selectedFlavor={selectedFlavor}
              price={selectedWeight?.price}
              salePrice={selectedWeight?.salePrice}
              imageUrl={selectedWeight?.imageUrl[currentImageIndex]}
            />
          </AuthContextProvider>
        </div>
      </div>
    </div>
  );
}
