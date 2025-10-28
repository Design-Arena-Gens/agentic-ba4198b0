import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/api-utils";
import { checkoutSchema } from "@/lib/validators";

const TAX_RATE = 0.085;
const SHIPPING_FLAT_CENTS = 1299;

function generateOrderNumber() {
  return `SV-${Date.now().toString(36).toUpperCase()}`;
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes("placeholder")) {
    return null;
  }
  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    const { cartItems, addressId, shippingAddress, paymentMethod } = parsed.data;

    if (!cartItems.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = cartItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "One or more products were not found" }, { status: 404 });
      }
      if (item.quantity > product.inventory) {
        return NextResponse.json(
          { error: `Insufficient inventory for ${product.name}` },
          { status: 400 }
        );
      }
    }

    const subtotalCents = cartItems.reduce((acc, item) => {
      const product = productMap.get(item.productId)!;
      return acc + product.priceCents * item.quantity;
    }, 0);

    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + taxCents + SHIPPING_FLAT_CENTS;

    const orderNumber = generateOrderNumber();

    const result = await prisma.$transaction(async (tx) => {
    let addressRecordId = addressId ?? null;
    let addressSnapshot;

    if (addressRecordId) {
      const existingAddress = await tx.address.findFirst({
        where: { id: addressRecordId, userId: user.id },
      });
      if (!existingAddress) {
        throw new Error("Address not found");
      }
      addressSnapshot = {
        fullName: existingAddress.fullName,
        line1: existingAddress.line1,
        line2: existingAddress.line2,
        city: existingAddress.city,
        state: existingAddress.state,
        postalCode: existingAddress.postalCode,
        country: existingAddress.country,
        phone: existingAddress.phone,
      };
    } else if (shippingAddress) {
      const newAddress = await tx.address.create({
        data: {
          ...shippingAddress,
          userId: user.id,
        },
      });
      addressRecordId = newAddress.id;
      addressSnapshot = {
        fullName: newAddress.fullName,
        line1: newAddress.line1,
        line2: newAddress.line2,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
        phone: newAddress.phone,
      };
    } else {
      throw new Error("Address is required");
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        paymentStatus: paymentMethod === "cod" ? "PENDING" : "AUTHORIZED",
        shippingStatus: "NOT_SHIPPED",
        subtotalCents,
        taxCents,
        shippingCostCents: SHIPPING_FLAT_CENTS,
        totalCents,
        addressId: addressRecordId,
        shippingTrackingId: null,
        addressSnapshot,
        items: {
          create: cartItems.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: product.id,
              productName: product.name,
              productSlug: product.slug,
              quantity: item.quantity,
              priceCents: product.priceCents,
              imageUrl: null,
            };
          }),
        },
      },
      include: { items: true },
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: user.id } });

    return order;
  });

    let payment = null as
      | null
      | {
          provider: string;
          sessionId?: string | null;
          url?: string | null;
          message?: string;
          clientId?: string;
          orderNumber?: string;
        };

    if (paymentMethod === "stripe") {
    const stripe = getStripeClient();
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout/success?order=${orderNumber}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout/cancel?order=${orderNumber}`,
        line_items: cartItems.map((item) => {
          const product = productMap.get(item.productId)!;
          return {
            price_data: {
              currency: "usd",
              unit_amount: product.priceCents,
              product_data: {
                name: product.name,
              },
            },
            quantity: item.quantity,
          };
        }),
        metadata: {
          orderNumber,
          userId: String(user.id),
        },
      });

      payment = {
        provider: "stripe",
        sessionId: session.id,
        url: session.url,
      };
    } else {
      payment = {
        provider: "stripe",
        sessionId: null,
        url: null,
        message: "Stripe secret key not configured. Using simulated payment.",
      };
    }
  }

    if (paymentMethod === "paypal") {
    payment = {
      provider: "paypal",
      clientId: process.env.PAYPAL_CLIENT_ID,
      orderNumber,
      message: "Use PayPal client SDK on the frontend to capture the payment.",
    };
    }

    return NextResponse.json({
      order: {
        orderNumber,
        totalCents,
        subtotalCents,
        taxCents,
        shippingCostCents: SHIPPING_FLAT_CENTS,
        items: result.items,
      },
      payment,
    });
  } catch (error) {
    console.error("Checkout failed", error);
    return NextResponse.json({ error: "Unable to complete checkout" }, { status: 500 });
  }
}
