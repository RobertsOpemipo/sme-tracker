// prisma/seed.ts
import {
  PrismaClient,
  PaymentMethod,
  PaymentStatus,
  ExpenseCategory,
  StockAdjustmentReason,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning existing records...");
  await prisma.debtPayment.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.business.deleteMany();

  console.log("🏢 Creating business profile...");
  const business = await prisma.business.create({
    data: {
      name: "Apex Supermart & Provisions",
      phone: "+2348012345678",
      currency: "NGN",
    },
  });

  console.log("📂 Creating categories...");
  const [beverages, provisions, snacks, toiletries, frozen] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Beverages",
        description: "Dairy, breakfast drinks, sodas, and juices",
        businessId: business.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Provisions & Pantry",
        description: "Grains, cereals, cooking oils, and spices",
        businessId: business.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Snacks & Confectionery",
        description: "Biscuits, wafers, candies, and crisps",
        businessId: business.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Toiletries & Household",
        description: "Soaps, detergents, cleaners, and hygiene",
        businessId: business.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Frozen & Chilled Foods",
        description: "Yogurts, poultry, and deli goods",
        businessId: business.id,
      },
    }),
  ]);

  console.log("📦 Stocking product catalog...");
  const products = await Promise.all([
    // Beverages
    prisma.product.create({
      data: {
        name: "Peak Evaporated Milk (160g)",
        sku: "BEV-MLK-001",
        barcode: "8712800000101",
        costPrice: 430,
        sellingPrice: 550,
        currentStock: 64,
        minStockAlert: 12,
        category: beverages.name,
        categoryId: beverages.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Milo Refill Pack (500g)",
        sku: "BEV-MIL-002",
        barcode: "7613035000202",
        costPrice: 2150,
        sellingPrice: 2700,
        currentStock: 18,
        minStockAlert: 8,
        category: beverages.name,
        categoryId: beverages.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Coca-Cola Plastic Bottle (50cl)",
        sku: "BEV-COK-003",
        barcode: "5449000000303",
        costPrice: 280,
        sellingPrice: 350,
        currentStock: 96,
        minStockAlert: 24,
        category: beverages.name,
        categoryId: beverages.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Hollandia Yoghurt Plain (1L)",
        sku: "BEV-HOL-004",
        barcode: "6151100000404",
        costPrice: 1750,
        sellingPrice: 2200,
        currentStock: 4, // LOW STOCK
        minStockAlert: 10,
        category: beverages.name,
        categoryId: beverages.id,
        businessId: business.id,
      },
    }),

    // Provisions & Pantry
    prisma.product.create({
      data: {
        name: "Kellogg's Corn Flakes (450g)",
        sku: "PRO-CRN-005",
        barcode: "5000127000505",
        costPrice: 2500,
        sellingPrice: 3200,
        currentStock: 7, // LOW STOCK
        minStockAlert: 10,
        category: provisions.name,
        categoryId: provisions.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Golden Penny Semovita (2kg)",
        sku: "PRO-SEM-006",
        barcode: "6151100000606",
        costPrice: 2800,
        sellingPrice: 3400,
        currentStock: 22,
        minStockAlert: 5,
        category: provisions.name,
        categoryId: provisions.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Devon King's Pure Vegetable Oil (1L)",
        sku: "PRO-OIL-007",
        barcode: "6151100000707",
        costPrice: 2900,
        sellingPrice: 3500,
        currentStock: 15,
        minStockAlert: 6,
        category: provisions.name,
        categoryId: provisions.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Dangote Refined Granulated Sugar (500g)",
        sku: "PRO-SUG-008",
        barcode: "6151100000808",
        costPrice: 820,
        sellingPrice: 1050,
        currentStock: 0, // OUT OF STOCK
        minStockAlert: 15,
        category: provisions.name,
        categoryId: provisions.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Indomie Instant Noodles Super Pack (120g)",
        sku: "PRO-IND-009",
        barcode: "6151100000909",
        costPrice: 310,
        sellingPrice: 400,
        currentStock: 140,
        minStockAlert: 40,
        category: provisions.name,
        categoryId: provisions.id,
        businessId: business.id,
      },
    }),

    // Snacks & Confectionery
    prisma.product.create({
      data: {
        name: "McVitie's Digestives (250g)",
        sku: "SNK-DIG-010",
        barcode: "5000168001010",
        costPrice: 780,
        sellingPrice: 1000,
        currentStock: 35,
        minStockAlert: 10,
        category: snacks.name,
        categoryId: snacks.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Minimie Chinchin Regular (45g)",
        sku: "SNK-CHI-011",
        barcode: "6151100001111",
        costPrice: 160,
        sellingPrice: 220,
        currentStock: 85,
        minStockAlert: 20,
        category: snacks.name,
        categoryId: snacks.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Pringles Original (165g)",
        sku: "SNK-PRI-012",
        barcode: "5053990001212",
        costPrice: 2600,
        sellingPrice: 3400,
        currentStock: 2, // CRITICAL STOCK
        minStockAlert: 6,
        category: snacks.name,
        categoryId: snacks.id,
        businessId: business.id,
      },
    }),

    // Toiletries & Household
    prisma.product.create({
      data: {
        name: "Dettol Antiseptic Liquid (250ml)",
        sku: "TOI-DET-013",
        barcode: "6001106001313",
        costPrice: 1700,
        sellingPrice: 2250,
        currentStock: 16,
        minStockAlert: 5,
        category: toiletries.name,
        categoryId: toiletries.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sunlight Detergent Powder (900g)",
        sku: "TOI-SUN-014",
        barcode: "8714100001414",
        costPrice: 1550,
        sellingPrice: 2000,
        currentStock: 28,
        minStockAlert: 8,
        category: toiletries.name,
        categoryId: toiletries.id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Oral-B Pro-Health Toothpaste (140g)",
        sku: "TOI-ORL-015",
        barcode: "8001090001515",
        costPrice: 1100,
        sellingPrice: 1450,
        currentStock: 19,
        minStockAlert: 6,
        category: toiletries.name,
        categoryId: toiletries.id,
        businessId: business.id,
      },
    }),

    // Frozen & Chilled
    prisma.product.create({
      data: {
        name: "Farm Fresh Chicken Franks (400g)",
        sku: "FRZ-CHK-016",
        barcode: "6151100001616",
        costPrice: 2200,
        sellingPrice: 2850,
        currentStock: 8,
        minStockAlert: 4,
        category: frozen.name,
        categoryId: frozen.id,
        businessId: business.id,
      },
    }),
  ]);

  console.log("👥 Creating customer ledger accounts...");
  const [cust1, cust2, cust3, cust4, cust5, cust6] = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Alhaji Musa Ibrahim",
        phone: "+2348031122334",
        email: "musa.ibrahim@example.ng",
        businessId: business.id,
        totalOwed: 28650,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Chioma Okonjo-Nwosu",
        phone: "+2348029988776",
        email: "chioma.okonjo@example.ng",
        businessId: business.id,
        totalOwed: 14200,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Dr. Babatunde Adeleke",
        phone: "+2348187766554",
        businessId: business.id,
        totalOwed: 0, // Clean
      },
    }),
    prisma.customer.create({
      data: {
        name: "Mama Funke Canteen (B2B)",
        phone: "+2348054433221",
        email: "canteen.mamafunke@gmail.com",
        businessId: business.id,
        totalOwed: 45000, // High-balance commercial debtor
      },
    }),
    prisma.customer.create({
      data: {
        name: "Emeka Okafor",
        phone: "+2347065544332",
        businessId: business.id,
        totalOwed: 5400,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Amina Yusuf",
        phone: "+2348123344556",
        businessId: business.id,
        totalOwed: 0, // Clean
      },
    }),
  ]);

  console.log("🧾 Creating historical sales transactions...");
  // Sale 1: Walk-in Quick Cash Checkout
  await prisma.sale.create({
    data: {
      businessId: business.id,
      receiptNumber: "REC-20260910-1011",
      subtotal: 3950,
      discount: 150,
      totalAmount: 3800,
      amountPaid: 3800,
      balanceDue: 0,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PAID,
      createdAt: new Date("2026-09-10T10:14:00Z"),
      items: {
        create: [
          {
            productId: products[0].id, // Peak Milk
            quantity: 4,
            unitCostPrice: 430,
            unitSellingPrice: 550,
            totalCostPrice: 1720,
            totalRevenue: 2200,
            grossProfit: 480,
          },
          {
            productId: products[2].id, // Coke
            quantity: 5,
            unitCostPrice: 280,
            unitSellingPrice: 350,
            totalCostPrice: 1400,
            totalRevenue: 1750,
            grossProfit: 350,
          },
        ],
      },
    },
  });

  // Sale 2: POS Card Payment
  await prisma.sale.create({
    data: {
      businessId: business.id,
      receiptNumber: "REC-20260911-1402",
      subtotal: 10800,
      discount: 300,
      totalAmount: 10500,
      amountPaid: 10500,
      balanceDue: 0,
      paymentMethod: PaymentMethod.POS,
      paymentStatus: PaymentStatus.PAID,
      notes: "Stanbic POS Terminal Ref: 981042",
      createdAt: new Date("2026-09-11T13:40:00Z"),
      items: {
        create: [
          {
            productId: products[1].id, // Milo 500g
            quantity: 2,
            unitCostPrice: 2150,
            unitSellingPrice: 2700,
            totalCostPrice: 4300,
            totalRevenue: 5400,
            grossProfit: 1100,
          },
          {
            productId: products[4].id, // Corn Flakes
            quantity: 1,
            unitCostPrice: 2500,
            unitSellingPrice: 3200,
            totalCostPrice: 2500,
            totalRevenue: 3200,
            grossProfit: 700,
          },
          {
            productId: products[13].id, // Sunlight detergent
            quantity: 1,
            unitCostPrice: 1550,
            unitSellingPrice: 2000,
            totalCostPrice: 1550,
            totalRevenue: 2000,
            grossProfit: 450,
          },
          {
            productId: products[10].id, // Chinchin
            quantity: 1,
            unitCostPrice: 160,
            unitSellingPrice: 200,
            totalCostPrice: 160,
            totalRevenue: 200,
            grossProfit: 40,
          },
        ],
      },
    },
  });

  // Sale 3: Bank Transfer Payment
  await prisma.sale.create({
    data: {
      businessId: business.id,
      receiptNumber: "REC-20260912-1644",
      subtotal: 14750,
      discount: 0,
      totalAmount: 14750,
      amountPaid: 14750,
      balanceDue: 0,
      paymentMethod: PaymentMethod.TRANSFER,
      paymentStatus: PaymentStatus.PAID,
      notes: "GTBank instant transfer confirmed",
      createdAt: new Date("2026-09-12T16:22:00Z"),
      items: {
        create: [
          {
            productId: products[6].id, // Devon King's Oil
            quantity: 3,
            unitCostPrice: 2900,
            unitSellingPrice: 3500,
            totalCostPrice: 8700,
            totalRevenue: 10500,
            grossProfit: 1800,
          },
          {
            productId: products[12].id, // Dettol
            quantity: 1,
            unitCostPrice: 1700,
            unitSellingPrice: 2250,
            totalCostPrice: 1700,
            totalRevenue: 2250,
            grossProfit: 550,
          },
          {
            productId: products[9].id, // Digestives
            quantity: 2,
            unitCostPrice: 780,
            unitSellingPrice: 1000,
            totalCostPrice: 1560,
            totalRevenue: 2000,
            grossProfit: 440,
          },
        ],
      },
    },
  });

  // Sale 4: Partial Credit Sale (Alhaji Musa Ibrahim)
  await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust1.id,
      receiptNumber: "REC-20260913-2015",
      subtotal: 38650,
      discount: 0,
      totalAmount: 38650,
      amountPaid: 10000, // Partial payment
      balanceDue: 28650,
      paymentMethod: PaymentMethod.TRANSFER,
      paymentStatus: PaymentStatus.PARTIAL,
      notes: "Initial deposit ₦10,000 paid via transfer; balance scheduled for 28th",
      createdAt: new Date("2026-09-13T11:05:00Z"),
      items: {
        create: [
          {
            productId: products[5].id, // Semovita 2kg
            quantity: 5,
            unitCostPrice: 2800,
            unitSellingPrice: 3400,
            totalCostPrice: 14000,
            totalRevenue: 17000,
            grossProfit: 3000,
          },
          {
            productId: products[6].id, // King's Oil 1L
            quantity: 4,
            unitCostPrice: 2900,
            unitSellingPrice: 3500,
            totalCostPrice: 11600,
            totalRevenue: 14000,
            grossProfit: 2400,
          },
          {
            productId: products[1].id, // Milo 500g
            quantity: 2,
            unitCostPrice: 2150,
            unitSellingPrice: 2700,
            totalCostPrice: 4300,
            totalRevenue: 5400,
            grossProfit: 1100,
          },
          {
            productId: products[14].id, // Oral-B
            quantity: 1,
            unitCostPrice: 1100,
            unitSellingPrice: 1450,
            totalCostPrice: 1100,
            totalRevenue: 1450,
            grossProfit: 350,
          },
          {
            productId: products[2].id, // Coke
            quantity: 2,
            unitCostPrice: 280,
            unitSellingPrice: 400,
            totalCostPrice: 560,
            totalRevenue: 800,
            grossProfit: 240,
          },
        ],
      },
    },
  });

  // Sale 5: Wholesale Carton Order (Mama Funke Canteen - Credit)
  await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust4.id,
      receiptNumber: "REC-20260914-0830",
      subtotal: 55000,
      discount: 0,
      totalAmount: 55000,
      amountPaid: 10000,
      balanceDue: 45000,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PARTIAL,
      notes: "Commercial bulk provision supply for catering",
      createdAt: new Date("2026-09-14T08:30:00Z"),
      items: {
        create: [
          {
            productId: products[8].id, // Indomie pack
            quantity: 100,
            unitCostPrice: 310,
            unitSellingPrice: 380,
            totalCostPrice: 31000,
            totalRevenue: 38000,
            grossProfit: 7000,
          },
          {
            productId: products[5].id, // Semovita
            quantity: 5,
            unitCostPrice: 2800,
            unitSellingPrice: 3400,
            totalCostPrice: 14000,
            totalRevenue: 17000,
            grossProfit: 3000,
          },
        ],
      },
    },
  });

  // Sale 6: Credit Sale (Chioma Okonjo)
  await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust2.id,
      receiptNumber: "REC-20260915-1810",
      subtotal: 14200,
      discount: 0,
      totalAmount: 14200,
      amountPaid: 0,
      balanceDue: 14200,
      paymentMethod: PaymentMethod.CREDIT,
      paymentStatus: PaymentStatus.UNPAID,
      notes: "Household monthly ledger purchase",
      createdAt: new Date("2026-09-15T18:10:00Z"),
      items: {
        create: [
          {
            productId: products[3].id, // Hollandia 1L
            quantity: 2,
            unitCostPrice: 1750,
            unitSellingPrice: 2200,
            totalCostPrice: 3500,
            totalRevenue: 4400,
            grossProfit: 900,
          },
          {
            productId: products[15].id, // Chicken Franks
            quantity: 2,
            unitCostPrice: 2200,
            unitSellingPrice: 2850,
            totalCostPrice: 4400,
            totalRevenue: 5700,
            grossProfit: 1300,
          },
          {
            productId: products[4].id, // Cornflakes
            quantity: 1,
            unitCostPrice: 2500,
            unitSellingPrice: 3100,
            totalCostPrice: 2500,
            totalRevenue: 3100,
            grossProfit: 600,
          },
          {
            productId: products[9].id, // Digestives
            quantity: 1,
            unitCostPrice: 780,
            unitSellingPrice: 1000,
            totalCostPrice: 780,
            totalRevenue: 1000,
            grossProfit: 220,
          },
        ],
      },
    },
  });

  // Sale 7: Full Settlement (Dr. Babatunde Adeleke)
  await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust3.id,
      receiptNumber: "REC-20260916-0915",
      subtotal: 12050,
      discount: 0,
      totalAmount: 12050,
      amountPaid: 12050,
      balanceDue: 0,
      paymentMethod: PaymentMethod.POS,
      paymentStatus: PaymentStatus.PAID,
      createdAt: new Date("2026-09-16T09:15:00Z"),
      items: {
        create: [
          {
            productId: products[11].id, // Pringles
            quantity: 2,
            unitCostPrice: 2600,
            unitSellingPrice: 3400,
            totalCostPrice: 5200,
            totalRevenue: 6800,
            grossProfit: 1600,
          },
          {
            productId: products[15].id, // Chicken Franks
            quantity: 1,
            unitCostPrice: 2200,
            unitSellingPrice: 2850,
            totalCostPrice: 2200,
            totalRevenue: 2850,
            grossProfit: 650,
          },
          {
            productId: products[13].id, // Sunlight
            quantity: 1,
            unitCostPrice: 1550,
            unitSellingPrice: 2000,
            totalCostPrice: 1550,
            totalRevenue: 2000,
            grossProfit: 450,
          },
          {
            productId: products[10].id, // Chinchin
            quantity: 2,
            unitCostPrice: 160,
            unitSellingPrice: 200,
            totalCostPrice: 320,
            totalRevenue: 400,
            grossProfit: 80,
          },
        ],
      },
    },
  });

  // Sale 8: Partial Cash Sale (Emeka Okafor)
  await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust5.id,
      receiptNumber: "REC-20260916-1520",
      subtotal: 8400,
      discount: 0,
      totalAmount: 8400,
      amountPaid: 3000,
      balanceDue: 5400,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PARTIAL,
      notes: "Deposited ₦3,000 cash at register",
      createdAt: new Date("2026-09-16T15:20:00Z"),
      items: {
        create: [
          {
            productId: products[1].id, // Milo
            quantity: 1,
            unitCostPrice: 2150,
            unitSellingPrice: 2700,
            totalCostPrice: 2150,
            totalRevenue: 2700,
            grossProfit: 550,
          },
          {
            productId: products[6].id, // Oil
            quantity: 1,
            unitCostPrice: 2900,
            unitSellingPrice: 3500,
            totalCostPrice: 2900,
            totalRevenue: 3500,
            grossProfit: 600,
          },
          {
            productId: products[3].id, // Hollandia
            quantity: 1,
            unitCostPrice: 1750,
            unitSellingPrice: 2200,
            totalCostPrice: 1750,
            totalRevenue: 2200,
            grossProfit: 450,
          },
        ],
      },
    },
  });

  console.log("💡 Logging operating expenses...");
  await prisma.expense.createMany({
    data: [
      {
        businessId: business.id,
        category: ExpenseCategory.UTILITIES,
        title: "Diesel Fuel for Generator (45 Litres)",
        amount: 54000,
        note: "Emergency power during grid outage",
        date: new Date("2026-09-08T11:00:00Z"),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.PACKAGING,
        title: "Biodegradable Shopping Bags & POS Rolls",
        amount: 8500,
        note: "3 bundles of 500-count bags + 10 rolls thermal 58mm",
        date: new Date("2026-09-10T14:30:00Z"),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.LOGISTICS,
        title: "Wholesale Market Haulage Delivery",
        amount: 14000,
        note: "Transport fee for Indomie and flour pallets from distributor",
        date: new Date("2026-09-12T09:15:00Z"),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.SALARIES,
        title: "Mid-Month Cashier & Shelf-Attendant Stipend",
        amount: 45000,
        note: "Weekly wages for 2 floor staff",
        date: new Date("2026-09-15T17:00:00Z"),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.MISCELLANEOUS,
        title: "Store Cleaning Reagents & Mop Head Replacements",
        amount: 3200,
        note: "Sanitary upkeep",
        date: new Date("2026-09-16T08:00:00Z"),
      },
    ],
  });

  console.log("📋 Adding stock movements audit trail...");
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: products[8].id, // Indomie
        quantity: 200,
        reason: StockAdjustmentReason.RESTOCK,
        note: "Consignment intake from Dufil factory distributor",
      },
      {
        productId: products[7].id, // Dangote Sugar
        quantity: -10,
        reason: StockAdjustmentReason.DAMAGE,
        note: "Torn paper bags during offloading from van",
      },
      {
        productId: products[11].id, // Pringles
        quantity: -1,
        reason: StockAdjustmentReason.EXPIRED,
        note: "Past best-before inspection date",
      },
    ],
  });

  console.log("✅ Seed database populated successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });