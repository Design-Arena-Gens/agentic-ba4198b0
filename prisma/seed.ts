import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@shopverse.com" },
    update: {},
    create: {
      email: "demo@shopverse.com",
      name: "Demo Shopper",
      passwordHash,
    },
  });

  const categories = await Promise.all(
    [
      { name: "Electronics", slug: "electronics" },
      { name: "Home & Kitchen", slug: "home-kitchen" },
      { name: "Beauty", slug: "beauty" },
      { name: "Books", slug: "books" },
    ].map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      })
    )
  );

  const brands = await Promise.all(
    [
      { name: "Apex", slug: "apex" },
      { name: "Lumina", slug: "lumina" },
      { name: "PureGlow", slug: "pureglow" },
      { name: "PageTurner", slug: "pageturner" },
    ].map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: brand,
        create: brand,
      })
    )
  );

  const electronicsCategory = categories.find((c) => c.slug === "electronics");
  const homeCategory = categories.find((c) => c.slug === "home-kitchen");
  const beautyCategory = categories.find((c) => c.slug === "beauty");
  const bookCategory = categories.find((c) => c.slug === "books");

  const apexBrand = brands.find((b) => b.slug === "apex");
  const luminaBrand = brands.find((b) => b.slug === "lumina");
  const pureGlowBrand = brands.find((b) => b.slug === "pureglow");
  const pageTurnerBrand = brands.find((b) => b.slug === "pageturner");

  if (!electronicsCategory || !homeCategory || !beautyCategory || !bookCategory) {
    throw new Error("Failed to create categories");
  }

  if (!apexBrand || !luminaBrand || !pureGlowBrand || !pageTurnerBrand) {
    throw new Error("Failed to create brands");
  }

  const productsData = [
    {
      name: "Apex Echo Smart Speaker",
      slug: "apex-echo-smart-speaker",
      description:
        "Voice-controlled smart speaker with spatial audio, adaptive sound, and integrated smart home hub.",
      priceCents: 14999,
      rating: 4.6,
      inventory: 120,
      sku: "APX-ECHO-01",
      categoryId: electronicsCategory.id,
      brandId: apexBrand.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
          alt: "Apex Echo smart speaker on a wooden desk",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1484704849700-f032a568e944",
          alt: "Smart speaker lifestyle image",
        },
      ],
    },
    {
      name: "Lumina Air Purifier Pro",
      slug: "lumina-air-purifier-pro",
      description:
        "HEPA-14 filtration with real-time air quality monitoring, whisper-quiet fan, and app connectivity.",
      priceCents: 22999,
      rating: 4.8,
      inventory: 75,
      sku: "LUM-AIR-02",
      categoryId: homeCategory.id,
      brandId: luminaBrand.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1",
          alt: "Lumina Air Purifier in modern living room",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1616628182506-57d0c7965731",
          alt: "Air purifier close up control panel",
        },
      ],
    },
    {
      name: "PureGlow Vitamin C Serum",
      slug: "pureglow-vitamin-c-serum",
      description:
        "Clinical-grade 15% vitamin C serum with hyaluronic acid for brightening and hydration.",
      priceCents: 3999,
      rating: 4.4,
      inventory: 300,
      sku: "PURE-SKIN-88",
      categoryId: beautyCategory.id,
      brandId: pureGlowBrand.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
          alt: "PureGlow vitamin C serum bottle",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1612810806695-30ba0bf9ba47",
          alt: "Skincare arrangement with PureGlow serum",
        },
      ],
    },
    {
      name: "PageTurner Hardcover Classics Bundle",
      slug: "pageturner-hardcover-classics-bundle",
      description:
        "Curated collection of five timeless literary classics with archival paper and illustrated endpapers.",
      priceCents: 8999,
      rating: 4.9,
      inventory: 45,
      sku: "PAGE-CLSC-05",
      categoryId: bookCategory.id,
      brandId: pageTurnerBrand.id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090",
          alt: "Stack of PageTurner classic hardcover books",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1463320898484-cdee8141c787",
          alt: "Open book with reading glasses",
        },
      ],
    },
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        ...product,
        images: {
          create: product.images,
        },
      },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        rating: product.rating,
        inventory: product.inventory,
        sku: product.sku,
        categoryId: product.categoryId,
        brandId: product.brandId,
        images: {
          deleteMany: {},
          create: product.images,
        },
      },
    });
  }

  await prisma.address.deleteMany({ where: { userId: user.id } });
  const address = await prisma.address.create({
    data: {
      label: "Home",
      fullName: "Demo Shopper",
      line1: "123 Innovation Way",
      line2: "Suite 400",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "USA",
      phone: "+1-555-123-4567",
      isDefault: true,
      userId: user.id,
    },
  });

  const apexSpeaker = await prisma.product.findUnique({
    where: { slug: "apex-echo-smart-speaker" },
    include: { images: true },
  });

  if (apexSpeaker) {
    await prisma.order.deleteMany({ where: { orderNumber: "SV-100001" } });
    await prisma.review.deleteMany({ where: { externalRef: "seed-internal" } });

    await prisma.order.create({
      data: {
        orderNumber: "SV-100001",
        status: "FULFILLED",
        paymentStatus: "PAID",
        shippingStatus: "DELIVERED",
        totalCents: 16999,
        subtotalCents: apexSpeaker.priceCents,
        taxCents: 1200,
        shippingCostCents: 800,
        userId: user.id,
        shippingTrackingId: "TRACK12345",
        addressId: address.id,
        addressSnapshot: {
          fullName: address.fullName,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
        },
        items: {
          create: [
            {
              productId: apexSpeaker.id,
              productName: apexSpeaker.name,
              productSlug: apexSpeaker.slug,
              quantity: 1,
              priceCents: apexSpeaker.priceCents,
              imageUrl: apexSpeaker.images[0]?.url ?? null,
            },
          ],
        },
      },
    });

    await prisma.review.create({
      data: {
        rating: 5,
        comment: "Immersive sound with crisp highs and deep bass. Setup was effortless!",
        productId: apexSpeaker.id,
        userId: user.id,
        reviewer: user.name,
        externalRef: "seed-internal",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
