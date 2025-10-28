import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  newPassword: z.string().min(8),
});

export const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  rating: z.string().optional(),
  sort: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(99),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(99),
});

export const addressSchema = z.object({
  label: z.string().min(2).max(50).optional(),
  fullName: z.string().min(2).max(80),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  postalCode: z.string().min(3).max(20),
  country: z.string().min(2).max(80),
  phone: z.string().min(7).max(20).optional(),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  addressId: z.number().int().positive().optional(),
  shippingAddress: addressSchema.optional(),
  paymentMethod: z.enum(["stripe", "paypal", "cod"]),
  cartItems: z.array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().positive().max(99),
    })
  ),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(500),
});
