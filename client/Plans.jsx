import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreateSubscription } from "./src/api/Subscription";

const PLAN_CATALOG = {
  monthly: [
    {
      id: "plan_RTFCU02Ktbi1Fi",
      name: "Starter",
      tagline: "Great for individuals",
      storage: "2 TB",
      price: 199,
      period: "/mo",
      cta: "Choose 2 TB",
      features: [
        "Secure cloud storage",
        "Link & folder sharing",
        "Basic support",
      ],
      popular: false,
    },
    {
      id: "plan_RSGQzIncll0pyD",
      name: "Pro",
      tagline: "For creators & devs",
      storage: "5 TB",
      price: 399,
      period: "/mo",
      cta: "Choose 5 TB",
      features: ["Everything in Starter", "Priority uploads", "Email support"],
      popular: true,
    },
    {
      id: "plan_RSGRwZz8Etth4Z",
      name: "Ultimate",
      tagline: "Teams & power users",
      storage: "10 TB",
      price: 699,
      period: "/mo",
      cta: "Choose 10 TB",
      features: ["Everything in Pro", "Version history", "Priority support"],
      popular: false,
    },
  ],
  yearly: [
    {
      id: "plan_RSGQ0zJcEnFyrb",
      name: "Starter",
      tagline: "Great for individuals",
      storage: "2 TB",
      price: 1999,
      period: "/yr",
      cta: "Choose 2 TB",
      features: [
        "Secure cloud storage",
        "Link & folder sharing",
        "Basic support",
      ],
      popular: false,
    },
    {
      id: "plan_RSGRCz4Dk1OHII",
      name: "Pro",
      tagline: "For creators & devs",
      storage: "5 TB",
      price: 3999,
      period: "/yr",
      cta: "Choose 5 TB",
      features: ["Everything in Starter", "Priority uploads", "Email support"],
      popular: true,
    },
    {
      id: "plan_RSGTXYCMqGK3Dd",
      name: "Ultimate",
      tagline: "Teams & power users",
      storage: "10 TB",
      price: 6999,
      period: "/yr",
      cta: "Choose 10 TB",
      features: ["Everything in Pro", "Version history", "Priority support"],
      popular: false,
    },
  ],
};

function classNames(...cls) {
  return cls.filter(Boolean).join(" ");
}

function Price({ value }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-semibold text-slate-700">₹</span>
      <span className="text-4xl font-bold tracking-tight text-slate-900">
        {value}
      </span>
    </div>
  );
}

function PlanCard({ plan, onSelect }) {
  return (
    <div
      className={classNames(
        "relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition",
        "hover:shadow-md",
        plan.popular
          ? "border-blue-500/60 ring-1 ring-blue-500/20"
          : "border-slate-200"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-2 right-4 select-none rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white shadow">
          Most Popular
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
          <p className="text-sm text-slate-500">{plan.tagline}</p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
          {plan.storage}
        </span>
      </div>

      <div className="mb-4 flex items-end gap-2">
        <Price value={plan.price} />
        <span className="mb-[6px] text-sm text-slate-500">{plan.period}</span>
      </div>

      <ul className="mb-5 space-y-2 text-sm text-slate-600">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 flex-none"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect?.(plan)}
        className={classNames(
          "mt-auto cursor-pointer inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2",
          plan.popular
            ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600"
            : "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900"
        )}
      >
        {plan.cta}
      </button>
    </div>
  );
}

export default function Plans() {
  const [mode, setMode] = useState("monthly");
  const plans = PLAN_CATALOG[mode];

async function handleSelect(plan) {
  try {
    const res = await CreateSubscription(plan.id);
    console.log("Backend response:", res);

    if (!res.subscriptionId) {
      alert("Failed to create subscription");
      return;
    }
    openRazorpayPopup(res.subscriptionId);

  } catch (err) {
    console.error("Error:", err);
    alert("Error creating subscription");
  }
}




  
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Choose your plan
        </h1>
        <Link to="/">Home</Link>
      </header>

      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
        <button
          onClick={() => setMode("monthly")}
          className={classNames(
            "rounded-lg px-4 py-2 text-sm font-medium border-2 cursor-pointer",
            mode === "monthly" ? "border-blue-500" : "border-white"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setMode("yearly")}
          className={classNames(
            "rounded-lg px-4 py-2 text-sm font-medium border-2 cursor-pointer",
            mode === "yearly" ? "border-blue-500" : "border-white"
          )}
        >
          Yearly{" "}
          <span className="ml-1 hidden text-xs text-blue-600 sm:inline">
            (2 months off)
          </span>
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={`${mode}-${plan.id}`}
            plan={plan}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Small helper text */}
      <p className="mt-6 text-xs text-slate-500">
        Prices are indicative for demo. Integrate with Razorpay Subscriptions to
        start billing. You can prefill the plan IDs inside a static config.
      </p>
    </div>
  );
}




function openRazorpayPopup(subscriptionId) {
  const options = {
    key: "rzp_test_RTFBYFE9yirDdi", 
    subscription_id: subscriptionId, 
    name: "StorageApp",
    description: "Monthly Cloud Storage Subscription",
    image: "https://yourapp.com/logo.png", // optional
    theme: {
      color: "#3399cc",
    },
    handler: function (response) {
      console.log("Payment success:", response);
      alert("Payment Successful!");
      // You can call backend verification here
    },
    modal: {
      ondismiss: function () {
        console.log("Payment popup closed");
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
}
