import axios from "axios";

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  brand: string;
  images: string[];
  thumbnail: string;
  quantity?: number;
  reviews?: Array<{
    rating: number;
    comment: string;
    reviewerName: string;
    date: string;
  }>;
};

export type ExternalReview = {
  rating: number;
  comment: string;
  reviewer: string;
  date?: string;
};

export type ExternalRecommendation = {
  id: number;
  title: string;
  image: string;
  price: number;
  rating: number;
};

export type ShippingProgress = {
  status: "CREATED" | "PROCESSING" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "UNKNOWN";
  summary: string;
  estimatedDelivery?: string;
  checkpoints: Array<{
    label: string;
    detail: string;
  }>;
};

async function searchDummyProducts(query: string) {
  const response = await axios.get<{ products: DummyProduct[] }>(
    "https://dummyjson.com/products/search",
    {
      params: { q: query, limit: 5 },
    }
  );

  return response.data.products;
}

async function getDummyProductById(id: number) {
  const response = await axios.get<DummyProduct>(
    `https://dummyjson.com/products/${id}`
  );
  return response.data;
}

export async function fetchExternalProductInsights(productName: string) {
  try {
    const candidates = await searchDummyProducts(productName);
    if (!candidates.length) {
      return null;
    }

    const product = await getDummyProductById(candidates[0].id);
    return product;
  } catch (error) {
    console.error("Failed to fetch external product insights", error);
    return null;
  }
}

export async function fetchExternalReviews(productName: string): Promise<ExternalReview[]> {
  const product = await fetchExternalProductInsights(productName);
  if (!product?.reviews?.length) {
    return [];
  }

  return product.reviews.map((review) => ({
    rating: review.rating,
    comment: review.comment,
    reviewer: review.reviewerName,
    date: review.date,
  }));
}

export async function fetchExternalRecommendations(productName: string): Promise<ExternalRecommendation[]> {
  const product = await fetchExternalProductInsights(productName);
  if (!product) {
    return [];
  }

  try {
    const response = await axios.get<{ products: DummyProduct[] }>(
      `https://dummyjson.com/products/category/${product.category}`,
      { params: { limit: 6 } }
    );

    return response.data.products
      .filter((item) => item.id !== product.id)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: item.title,
        image: item.thumbnail ?? item.images[0],
        price: item.price,
        rating: item.rating,
      }));
  } catch (error) {
    console.error("Failed to fetch external recommendations", error);
    return [];
  }
}

export async function fetchShippingProgress(trackingId: string): Promise<ShippingProgress> {
  try {
    const response = await axios.get<{ products: DummyProduct[]; total: number; totalProducts: number; totalQuantity: number }>(
      `https://dummyjson.com/carts/${trackingId}`
    );

    const totalQuantity = response.data.totalQuantity;
    const status =
      totalQuantity < 5
        ? "CREATED"
        : totalQuantity < 10
          ? "IN_TRANSIT"
          : totalQuantity < 12
            ? "OUT_FOR_DELIVERY"
            : "DELIVERED";

    return {
      status,
      summary: `Your shipment containing ${response.data.totalProducts} items is currently ${status.replace("_", " ").toLowerCase()}.`,
      checkpoints: response.data.products.map((product, index) => ({
        label: `Checkpoint ${index + 1}`,
        detail: `${product.title} staged - quantity ${product.quantity}`,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch shipping progress", error);
    return {
      status: "UNKNOWN",
      summary: "Tracking information is currently unavailable. Please try again later.",
      checkpoints: [],
    };
  }
}
