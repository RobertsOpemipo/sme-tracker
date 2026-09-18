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
        currentStock: 4,
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
        currentStock: 7,
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
        currentStock: 0,
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
        currentStock: 2,
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
        totalOwed: 9200,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Dr. Babatunde Adeleke",
        phone: "+2348187766554",
        businessId: business.id,
        totalOwed: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Mama Funke Canteen (B2B)",
        phone: "+2348054433221",
        email: "canteen.mamafunke@gmail.com",
        businessId: business.id,
        totalOwed: 45000,
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
        totalOwed: 0,
      },
    }),
  ]);

  // Dynamic date helpers to guarantee Daily Reconciliation is populated today
  const now = new Date();
  const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30, 0);
  const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 15, 0);
  const todayAfternoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 45, 0);
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

  console.log("🧾 Creating historical and TODAY's sales transactions...");

  // Sale 1: Historical Walk-in Cash Sale
  await prisma.sale.create({
    data: {
      businessId: business.id,
      receiptNumber: "REC-HIST-1011",
      subtotal: 3950,
      discount: 150,
      totalAmount: 3800,
      amountPaid: 3800,
      balanceDue: 0,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PAID,
      createdAt: eightDaysAgo,
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

  // Sale 2: Historical Credit Sale (Alhaji Musa)
  await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust1.id,
      receiptNumber: "REC-HIST-2015",
      subtotal: 38650,
      discount: 0,
      totalAmount: 38650,
      amountPaid: 10000,
      balanceDue: 28650,
      paymentMethod: PaymentMethod.TRANSFER,
      paymentStatus: PaymentStatus.PARTIAL,
      notes: "Deposit ₦10k paid via transfer; balance scheduled",
      createdAt: fiveDaysAgo,
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
        ],
      },
    },
  });

  // Sale 3: Historical Wholesale Carton Order (Mama Funke)
  await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust4.id,
      receiptNumber: "REC-HIST-0830",
      subtotal: 55000,
      discount: 0,
      totalAmount: 55000,
      amountPaid: 10000,
      balanceDue: 45000,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PARTIAL,
      notes: "Commercial bulk provision supply",
      createdAt: twoDaysAgo,
      items: {
        create: [
          {
            productId: products[8].id, // Indomie
            quantity: 100,
            unitCostPrice: 310,
            unitSellingPrice: 380,
            totalCostPrice: 31000,
            totalRevenue: 38000,
            grossProfit: 7000,
          },
        ],
      },
    },
  });

  // ----------------------------------------------------------------
  // TODAY'S SHIFT SALES (Powers the Daily Reconciliation Z-Report)
  // ----------------------------------------------------------------

  // Today Sale A: Morning Till Cash Sale
  await prisma.sale.create({
    data: {
      businessId: business.id,
      receiptNumber: `REC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-0101`,
      subtotal: 13500,
      discount: 500,
      totalAmount: 13000,
      amountPaid: 13000, // +₦13,000 Expected Cash in Drawer
      balanceDue: 0,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PAID,
      notes: "Morning walk-in breakfast provisions",
      createdAt: todayMorning,
      items: {
        create: [
          {
            productId: products[1].id, // Milo 500g
            quantity: 3,
            unitCostPrice: 2150,
            unitSellingPrice: 2700,
            totalCostPrice: 6450,
            totalRevenue: 8100,
            grossProfit: 1650,
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
            productId: products[0].id, // Milk
            quantity: 4,
            unitCostPrice: 430,
            unitSellingPrice: 550,
            totalCostPrice: 1720,
            totalRevenue: 2200,
            grossProfit: 480,
          },
        ],
      },
    },
  });

  // Today Sale B: Midday POS Terminal Card Swipe
  await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust3.id, // Dr. Babatunde
      receiptNumber: `REC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-0202`,
      subtotal: 21650,
      discount: 0,
      totalAmount: 21650,
      amountPaid: 21650, // +₦21,650 Expected POS Settlement
      balanceDue: 0,
      paymentMethod: PaymentMethod.POS,
      paymentStatus: PaymentStatus.PAID,
      notes: "Stanbic POS Terminal Auth #551982",
      createdAt: todayNoon,
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
            quantity: 2,
            unitCostPrice: 2200,
            unitSellingPrice: 2850,
            totalCostPrice: 4400,
            totalRevenue: 5700,
            grossProfit: 1300,
          },
          {
            productId: products[6].id, // Devon King's Oil
            quantity: 2,
            unitCostPrice: 2900,
            unitSellingPrice: 3500,
            totalCostPrice: 5800,
            totalRevenue: 7000,
            grossProfit: 1200,
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
            unitSellingPrice: 350,
            totalCostPrice: 560,
            totalRevenue: 700,
            grossProfit: 140,
          },
        ],
      },
    },
  });

  // Today Sale C: Afternoon Bank Transfer with Partial Credit (Chioma Okonjo)
  const todayCreditSale = await prisma.sale.create({
    data: {
      businessId: business.id,
      customerId: cust2.id,
      receiptNumber: `REC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-0303`,
      subtotal: 24200,
      discount: 0,
      totalAmount: 24200,
      amountPaid: 15000, // +₦15,000 Direct Bank Transfer Verified
      balanceDue: 9200, // +₦9,200 New Debt Given Today
      paymentMethod: PaymentMethod.TRANSFER,
      paymentStatus: PaymentStatus.PARTIAL,
      notes: "GTBank Transfer Ref #992011; balance booked to family ledger",
      createdAt: todayAfternoon,
      items: {
        create: [
          {
            productId: products[5].id, // Semovita
            quantity: 4,
            unitCostPrice: 2800,
            unitSellingPrice: 3400,
            totalCostPrice: 11200,
            totalRevenue: 13600,
            grossProfit: 2400,
          },
          {
            productId: products[13].id, // Sunlight
            quantity: 2,
            unitCostPrice: 1550,
            unitSellingPrice: 2000,
            totalCostPrice: 3100,
            totalRevenue: 4000,
            grossProfit: 900,
          },
          {
            productId: products[3].id, // Hollandia
            quantity: 3,
            unitCostPrice: 1750,
            unitSellingPrice: 2200,
            totalCostPrice: 5250,
            totalRevenue: 6600,
            grossProfit: 1350,
          },
        ],
      },
    },
  });

  // Today Debt Repayment at Till: Customer brings physical cash to clear past balance
  await prisma.debtPayment.create({
    data: {
      saleId: todayCreditSale.id,
      customerId: cust5.id, // Emeka Okafor brings cash
      amount: 5000, // +₦5,000 Additional Cash in Drawer
      paymentMethod: PaymentMethod.CASH,
      note: "Cash payment at register toward outstanding ledger",
      paidAt: todayAfternoon,
    },
  });

  // ----------------------------------------------------------------
  // POPULATING STORE OPERATIONAL EXPENSES (All Enum Categories)
  // ----------------------------------------------------------------
  console.log("💡 Logging comprehensive store expenses...");
  await prisma.expense.createMany({
    data: [
      {
        businessId: business.id,
        category: ExpenseCategory.RENT,
        title: "Monthly Store Front & Warehouse Lease Allocation",
        amount: 85000,
        note: "Prorated monthly commercial property rental fee",
        date: new Date(now.getFullYear(), now.getMonth(), 2, 10, 0, 0),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.UTILITIES,
        title: "Diesel Fuel Supply for Generator (50 Litres)",
        amount: 55000,
        note: "Morning peak power backup during local feeder trip",
        date: new Date(now.getFullYear(), now.getMonth(), 5, 11, 30, 0),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.UTILITIES,
        title: "EKEDC Prepaid Commercial Electricity Token",
        amount: 25000,
        note: "3-phase power meter top-up",
        date: new Date(now.getFullYear(), now.getMonth(), 8, 9, 0, 0),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.PACKAGING,
        title: "Biodegradable Branded Carrier Bags (3 Bundles)",
        amount: 10500,
        note: "Medium and Jumbo retail checkout bags",
        date: new Date(now.getFullYear(), now.getMonth(), 10, 14, 0, 0),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.PACKAGING,
        title: "POS 58mm Thermal Printer Paper Rolls (Box of 20)",
        amount: 6000,
        note: "Receipt paper rolls for till terminal",
        date: new Date(now.getFullYear(), now.getMonth(), 12, 16, 20, 0),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.LOGISTICS,
        title: "Haulage Truck Delivery Fee (Market Consignment)",
        amount: 18000,
        note: "Offloading of flour, semo, and noodle pallets from central warehouse",
        date: new Date(now.getFullYear(), now.getMonth(), 13, 8, 45, 0),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.SALARIES,
        title: "Store Attendant & Cashier Bi-Weekly Wages",
        amount: 60000,
        note: "Shift compensation for 2 sales attendants",
        date: new Date(now.getFullYear(), now.getMonth(), 15, 17, 0, 0),
      },
      {
        businessId: business.id,
        category: ExpenseCategory.MISCELLANEOUS,
        title: "Store Facility Sanitary Supplies & Industrial Mops",
        amount: 4500,
        note: "Floor disinfectant, hand sanitizers, and detergents",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 15, 0), // Logged today
      },
      {
        businessId: business.id,
        category: ExpenseCategory.MISCELLANEOUS,
        title: "Emergency POS Card Reader Charging Dock Replacement",
        amount: 3800,
        note: "Replacement USB-C dock for counter terminal",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0), // Logged today
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