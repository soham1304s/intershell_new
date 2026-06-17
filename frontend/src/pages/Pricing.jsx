import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const plans = [
  { id: "free", name: "Free", monthly: 0, yearly: 0, text: "For exploring with intention.", features: ["5 applications each month", "Basic profile and job search", "1 ATS check each month", "Application tracking"] },
  { id: "premium", name: "Premium", monthly: 299, yearly: 2999, text: "For focused, active job seekers.", features: ["Unlimited applications", "Advanced ATS reports", "Unlimited interview practice", "Monthly career roadmap", "Priority job matches"], popular: true },
  { id: "pro", name: "Pro", monthly: 699, yearly: 6999, text: "For an ambitious career sprint.", features: ["Everything in Premium", "Video interview practice", "Cover letter guidance", "Salary negotiation toolkit", "Portfolio review"] }
];

export default function Pricing() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const subscribe = async (plan) => {
    if (plan.id === "free") return;
    setLoading(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load");

      const orderData = await api("/subscription/order", { method: "POST", body: { plan: plan.id, cycle } });
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SBehtLlmBcVwrN",
        amount: orderData.amount,
        currency: "INR",
        name: "Internshell",
        description: `${plan.name} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await api("/subscription", {
              method: "POST",
              body: {
                plan: plan.id,
                cycle,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            });
            await refreshUser();
            showToast(`${plan.name} is now active`, "success");
          } catch (err) {
            showToast(err.message, "error");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#6558e8"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => showToast(res.error.description, "error"));
      rzp.open();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return <div className="pricing-page page-enter"><div className="page-heading centered"><span className="eyebrow">Simple, honest pricing</span><h1>Invest in the next step.</h1><p>Start free. Upgrade when you want more focused practice and deeper feedback.</p><div className="billing-toggle"><button className={cycle === "monthly" ? "active" : ""} onClick={() => setCycle("monthly")}>Monthly</button><button className={cycle === "yearly" ? "active" : ""} onClick={() => setCycle("yearly")}>Yearly <span>Save 16%</span></button></div></div><div className="pricing-grid">{plans.map((plan) => <article className={`pricing-card ${plan.popular ? "popular" : ""}`} key={plan.id}>{plan.popular && <div className="popular-label"><Sparkles size={14} />Most chosen</div>}<span className="eyebrow">{plan.name}</span><h2>₹{plan[cycle]}<small>{plan.id !== "free" ? cycle === "monthly" ? "/month" : "/year" : " forever"}</small></h2><p>{plan.text}</p><button className={`button full ${plan.popular ? "primary" : "outline"}`} onClick={() => subscribe(plan)} disabled={user.plan === plan.id || loading}>{user.plan === plan.id ? "Current plan" : plan.id === "free" ? "Free by default" : `Choose ${plan.name}`}</button><ul>{plan.features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul></article>)}</div></div>;
}
