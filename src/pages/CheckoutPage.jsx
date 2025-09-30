import React from "react";
import BillingDetailsForm from "../components/feature/checkout/BillingDetailsForm";
import CheckoutSummary from "../components/feature/checkout/CheckoutSummary";
import Roadmap from "../components/common/Roadmap";

const steps = [
  { label: "Account", href: "/account" },
  { label: "My Account", href: "/account" },
  { label: "Product", href: "/products" },
  { label: "View Cart", href: "/cart" },
  { label: "CheckOut", href: "/checkout" },
];

const CheckoutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
        <div className="ml-4 mb-16">
            <Roadmap items={steps.map((item, idx) => ({
                ...item,
                active: idx === steps.length - 1
            }))} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-52 items-start">
            <BillingDetailsForm />
            <CheckoutSummary className="mt-56 md:mt-16" />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
