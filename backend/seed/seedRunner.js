import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../Modals/User.js";
import { Product } from "../Modals/Product.js";
import { Plan } from "../Modals/Plan.js";
import { TaxRule } from "../Modals/TaxRule.js";
import { DiscountRule } from "../Modals/DiscountRule.js";
import { QuotationTemplate } from "../Modals/QuotationTemplate.js";
import { Subscription } from "../Modals/Subscription.js";
import { Invoice } from "../Modals/Invoice.js";
import { Payment } from "../Modals/Payment.js";

const runSeed = async () => {
  try {
    await connectDB();
    console.log("Connected to database for seeding...");

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Plan.deleteMany({}),
      TaxRule.deleteMany({}),
      DiscountRule.deleteMany({}),
      QuotationTemplate.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    console.log("Existing data cleared.");

    const admin = await User.create({
      name: "Adarsh Pandey",
      email: "adarshrpandey10@gmail.com",
      password: "AdminPassword123!",
      role: "Admin",
      companyName: "Brightloop HQ",
      phone: "+91 9876543210",
    });

    const staff1 = await User.create({
      name: "Aakash Sudan",
      email: "aakashsudan190@gmail.com",
      password: "StaffPassword123!",
      role: "Staff",
      companyName: "Brightloop Operations",
      phone: "+91 9876543211",
    });

    const staff2 = await User.create({
      name: "Jamie Lee",
      email: "jamie@codevern.com",
      password: "StaffPassword123!",
      role: "Staff",
      companyName: "Brightloop Operations",
      phone: "+91 9876543212",
    });

    const customer1 = await User.create({
      name: "Alex Lee",
      email: "alex@codevern.com",
      password: "CustomerPassword123!",
      role: "Customer",
      companyName: "Linear Studio",
      phone: "+91 9876543213",
    });

    const customer2 = await User.create({
      name: "Business Stallers",
      email: "business.stallers@gmail.com",
      password: "CustomerPassword123!",
      role: "Customer",
      companyName: "Stallers Digital",
      phone: "+91 9876543214",
    });

    const customer3 = await User.create({
      name: "Acme Lead",
      email: "support@codevern.com",
      password: "CustomerPassword123!",
      role: "Customer",
      companyName: "Acme Technologies",
      phone: "+91 9876543215",
    });

    console.log("Users seeded.");

    const taxRule = await TaxRule.create({
      name: "Standard GST",
      rate: 18,
      country: "India",
      isDefault: true,
    });

    const discountRule = await DiscountRule.create({
      name: "Volume Discount 10%",
      code: "VOLUME10",
      discountType: "percentage",
      value: 10,
      minQuantity: 5,
      appliesTo: "whole_subscription",
    });

    const product1 = await Product.create({
      name: "Brightloop Core Workspace",
      type: "Software",
      salesPrice: 1499,
      costPrice: 400,
      notes: "Main subscription product",
      variants: [
        {
          name: "Brand",
          options: [
            { label: "Standard", priceDelta: 0 },
            { label: "Odoo", priceDelta: 560 },
          ],
        },
      ],
    });

    const product2 = await Product.create({
      name: "Security Shield Addon",
      type: "Addon",
      salesPrice: 499,
      costPrice: 150,
      notes: "Enhanced two factor and encryption",
      variants: [],
    });

    console.log("Products and tax rules seeded.");

    const planStarter = await Plan.create({
      code: "starter",
      name: "Starter",
      price: 1499,
      cycle: "Monthly",
      description: "A good place to begin.",
      features: [
        "Core business workspace",
        "Up to 5 team members",
        "Email support",
      ],
      minQuantity: 1,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
    });

    const planGrowth = await Plan.create({
      code: "growth",
      name: "Growth",
      price: 3999,
      cycle: "Monthly",
      description: "Room for your next chapter.",
      features: [
        "Everything in Starter",
        "Advanced reporting",
        "Priority support",
      ],
      minQuantity: 1,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
    });

    const planScale = await Plan.create({
      code: "scale",
      name: "Scale",
      price: 39990,
      cycle: "Yearly",
      description: "Built for the bigger picture.",
      features: [
        "Everything in Growth",
        "Dedicated account manager",
        "Annual billing",
      ],
      minQuantity: 1,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
    });

    console.log("Plans seeded.");

    await QuotationTemplate.create({
      name: "Enterprise Growth Offer",
      planId: planGrowth._id,
      productLines: [
        {
          productId: product1._id,
          variantName: "Brand",
          variantOption: "Odoo",
          quantity: 10,
          unitPrice: 3999 + 560,
        },
      ],
      validityDays: 30,
      notes: "Pre-configured quotation for enterprise teams",
    });

    const customers = [
      { user: customer1, seats: 12, plan: planGrowth, status: "Active", discount: 10, nextDay: "01" },
      { user: customer3, seats: 8, plan: planStarter, status: "Active", discount: 0, nextDay: "04" },
      { user: customer2, seats: 3, plan: planScale, status: "Active", discount: 0, nextDay: "07" },
      { user: customer1, seats: 6, plan: planGrowth, status: "Active", discount: 0, nextDay: "10" },
      { user: customer3, seats: 4, plan: planStarter, status: "Active", discount: 0, nextDay: "13" },
      { user: customer2, seats: 2, plan: planScale, status: "Quotation", discount: 0, nextDay: "16" },
      { user: customer1, seats: 5, plan: planGrowth, status: "Paused", discount: 0, nextDay: "19" },
      { user: customer3, seats: 9, plan: planStarter, status: "Active", discount: 0, nextDay: "22" },
    ];

    const subscriptions = [];

    for (let i = 0; i < customers.length; i++) {
      const c = customers[i];
      const sub = await Subscription.create({
        subscriptionNumber: `SUB-${1041 + i}`,
        customerId: c.user._id,
        customer: c.user.companyName,
        email: c.user.email,
        planId: c.plan._id,
        seats: c.seats,
        status: c.status,
        start: "2026-10-01",
        next: `2026-11-${c.nextDay}`,
        discount: c.discount,
        paymentTerms: "Immediate",
        lines: [
          {
            productId: product1._id,
            productName: product1.name,
            quantity: c.seats,
            unitPrice: c.plan.price,
            taxes: 18,
            amount: c.plan.price * c.seats,
          },
        ],
        history: [
          {
            fromStatus: null,
            toStatus: c.status,
            changedAt: new Date("2026-10-01T10:00:00Z"),
            changedBy: admin.email,
            note: "Initial seed",
          },
        ],
      });
      subscriptions.push(sub);
    }

    console.log("Subscriptions seeded.");

    const activeSubs = subscriptions.filter((s) => s.status === "Active");
    const invoices = [];

    for (let i = 0; i < activeSubs.length; i++) {
      const s = activeSubs[i];
      const plan = await Plan.findById(s.planId);
      const subtotal = plan.price * s.seats;
      const discount = Math.round((subtotal * (s.discount || 0)) / 100);
      const tax = Math.round(((subtotal - discount) * 18) / 100);
      const total = subtotal - discount + tax;
      const status = i < 2 ? "Confirmed" : "Paid";

      const inv = await Invoice.create({
        invoiceNumber: `INV-${1049 + i}`,
        subscriptionId: s._id,
        customerId: s.customerId,
        customer: s.customer,
        email: s.email,
        period: "2026-10-01",
        issueDate: "2026-10-01",
        due: i < 2 ? "2026-10-25" : "2026-11-06",
        subtotal,
        discount,
        tax,
        total,
        status,
        lines: [
          {
            description: `${plan.name} Plan (${s.seats} seats)`,
            quantity: s.seats,
            unitPrice: plan.price,
            amount: subtotal,
          },
        ],
      });
      invoices.push(inv);
    }

    console.log("Invoices seeded.");

    const paidInvoices = invoices.filter((inv) => inv.status === "Paid");

    for (let n = 0; n < paidInvoices.length; n++) {
      const inv = paidInvoices[n];
      await Payment.create({
        paymentNumber: `PAY-${201 + n}`,
        invoiceId: inv._id,
        subscriptionId: inv.subscriptionId,
        customerId: inv.customerId,
        customer: inv.customer,
        amount: inv.total,
        date: `2026-10-${12 + n * 4}`,
        method: n % 2 ? "UPI" : "Bank transfer",
        note: "October subscription payment",
      });
    }

    console.log("Payments seeded.");
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

runSeed();

