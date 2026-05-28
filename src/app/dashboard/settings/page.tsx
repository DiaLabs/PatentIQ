"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, CreditCard, Palette, Loader2, AlertCircle, CheckCircle2, ChevronRight, Monitor, Moon, Sun, GraduationCap, UploadCloud } from "lucide-react";
import { fetchMentorProfile, createCheckoutSession, type Mentor } from "@/lib/api";
import { DodoPayments } from "dodopayments-checkout";
import { Portal } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "profile" | "billing" | "appearance" | "educator";

const TABS: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Billing & Credits", icon: CreditCard },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "educator", label: "Educator Trial", icon: GraduationCap },
];

const PACKAGES = [
  { amount: 10, price: "₹50", popular: false },
  { amount: 50, price: "₹200", popular: true },
  { amount: 100, price: "₹350", popular: false },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : null;
  const activeTab = (tabParam as Tab) || "profile";
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Billing state
  const [buyingAmount, setBuyingAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCheckoutOverlayOpen, setIsCheckoutOverlayOpen] = useState(false);

  // Educator application state
  const [educatorForm, setEducatorForm] = useState({ profIdImage: "", govIdImage: "", useCase: "" });
  const [isEducatorSubmitting, setIsEducatorSubmitting] = useState(false);
  const [educatorSubmitted, setEducatorSubmitted] = useState(false);

  const [theme, setThemeState] = useState<string>("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setThemeState(saved);

    DodoPayments.Initialize({
      mode: "live",
      displayType: "overlay",
      onEvent: (event) => {
        switch (event.event_type) {
          case "checkout.opened":
            setBuyingAmount(null);
            setIsCheckoutOverlayOpen(true);
            break;
          case "checkout.error":
            setBuyingAmount(null);
            break;
          case "checkout.closed":
            setBuyingAmount(null);
            setIsCheckoutOverlayOpen(false);
            break;
        }
      },
    });
  }, []);

  const setTheme = (t: string) => {
    setThemeState(t);
    if (t === "system") {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      localStorage.setItem("theme", t);
      if (t === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchMentorProfile();
        setMentor(data.mentor);
      } catch (err: any) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleEducatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!educatorForm.profIdImage || !educatorForm.govIdImage || !educatorForm.useCase) return;
    setIsEducatorSubmitting(true);
    // Simulate API call to submit application
    setTimeout(() => {
      setIsEducatorSubmitting(false);
      setEducatorSubmitted(true);
    }, 1500);
  };

  const handlePurchase = async (amount: number) => {
    try {
      setBuyingAmount(amount);
      const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
      const checkoutTheme = isDark ? 'dark' : 'light';
      const session = await createCheckoutSession(amount, checkoutTheme);
      
      let url = session.checkout_url || session.payment_link || session.url;
      if (url) {
        const urlObj = new URL(url);
        urlObj.searchParams.set("theme", checkoutTheme);
        const finalUrl = urlObj.toString();

        DodoPayments.Checkout.open({
          checkoutUrl: finalUrl,
          options: {
            themeConfig: {
              light: {
                bgPrimary: "#ffffff",
                textPrimary: "#111827",
                buttonPrimary: "#4f46e5",
                buttonTextPrimary: "#ffffff",
              },
              dark: {
                bgPrimary: "#18181b",
                textPrimary: "#f9fafb",
                buttonPrimary: "#4f46e5",
                buttonTextPrimary: "#ffffff",
                borderPrimary: "#27272a",
              },
              radius: "6px",
            },
          },
        });
      } else {
        throw new Error("Invalid session response");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start checkout.");
      setBuyingAmount(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderProfile = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Profile Information</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your personal account details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Left Column: Avatar & Summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 lg:p-8 flex flex-col items-center justify-center text-center h-full">
          <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold shrink-0 overflow-hidden mb-5">
            {mentor?.picture_url ? (
              <img src={mentor.picture_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              mentor?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate w-full">{mentor?.name || "Unknown"}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-full mt-0.5">{mentor?.email || "No email"}</p>
        </div>

        {/* Right Column: Detailed Fields */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 lg:p-8 h-full">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">Personal Details</h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Full Name</label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-[#18181b] border border-gray-100 dark:border-zinc-800/50 rounded-md text-gray-900 dark:text-gray-200 text-sm font-medium">
                  {mentor?.name || "Unknown"}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Email Address</label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-[#18181b] border border-gray-100 dark:border-zinc-800/50 rounded-md text-gray-900 dark:text-gray-200 text-sm font-medium">
                  {mentor?.email || "No email"}
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Member Since</label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-[#18181b] border border-gray-100 dark:border-zinc-800/50 rounded-md text-gray-900 dark:text-gray-200 text-sm font-medium">
                {mentor?.created_at ? new Date(mentor.created_at.toString().length < 13 ? mentor.created_at * 1000 : mentor.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderBilling = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Billing & Credits</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your evaluation credits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Current Balance */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-md p-6 lg:p-8 text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative overflow-hidden flex flex-col items-center lg:items-start text-center lg:text-left h-full min-h-[240px]">
          <div className="absolute -right-8 -top-8 h-48 w-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center lg:items-start w-full h-full">
            <p className="text-indigo-100 font-bold tracking-widest uppercase text-xs mb-4">Current Balance</p>
            <div className="flex items-baseline gap-3 mb-auto">
              <span className="text-8xl font-black tracking-tighter leading-none drop-shadow-sm">{mentor?.credits || 0}</span>
              <span className="text-2xl font-medium text-indigo-50">Credits</span>
            </div>
            <p className="text-sm text-indigo-100 mt-10 leading-relaxed max-w-xs font-medium">
              1 evaluation consumes 1 credit.<br />Credits never expire.
            </p>
          </div>
        </div>

        {/* Right Column: Top up packages */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 lg:p-8">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">Top Up Credits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.amount}
                className={cn(
                  "relative bg-gray-50 dark:bg-[#18181b] rounded-md border p-5 flex flex-col items-center text-center transition-all hover:border-indigo-500 dark:hover:border-indigo-400",
                  pkg.popular ? "border-indigo-500 dark:border-indigo-400 shadow-sm shadow-indigo-500/10" : "border-gray-200 dark:border-zinc-800/50 hover:shadow-sm"
                )}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{pkg.amount} Credits</h4>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-5">{pkg.price}</p>
                <Button
                  onClick={() => handlePurchase(pkg.amount)}
                  disabled={buyingAmount !== null}
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {buyingAmount === pkg.amount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Purchase"}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-center text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Need a custom plan? Contact us at{" "}
              <a href="mailto:mail.dialabs@gmail.com" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                mail.dialabs@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderEducatorTrial = () => (
    <div className="flex h-full items-center justify-center min-h-[50vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 max-w-md w-full mx-4"
      >
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Educator verification and free trial features are currently in development. Soon you'll be able to apply for academic grants.
        </p>
      </motion.div>
    </div>
  );

  const renderAppearance = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Appearance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Customize how PatentIQ looks on your device.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Context */}
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 lg:p-8 flex flex-col justify-center h-full min-h-[240px]">
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-5">
            <Monitor className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Theme Preferences</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Choose your preferred viewing mode. Selecting "System" will automatically match your operating system's active theme.
          </p>
        </div>

        {/* Right Column: Options */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 lg:p-8">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">Select Theme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "light", label: "Light", icon: Sun, bg: "bg-gray-50 border-gray-200", fg: "text-gray-900" },
              { id: "dark", label: "Dark", icon: Moon, bg: "bg-zinc-900 border-zinc-800", fg: "text-white" },
              { id: "system", label: "System", icon: Monitor, bg: "bg-gradient-to-br from-gray-50 to-zinc-900 border-gray-200 dark:border-zinc-800", fg: "text-gray-500 dark:text-gray-400" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 rounded-md border-2 transition-all shadow-sm hover:shadow-md",
                  theme === t.id
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-indigo-500/10"
                    : "border-transparent hover:border-gray-200 dark:hover:border-zinc-700 bg-gray-50 dark:bg-[#18181b]"
                )}
              >
                {theme === t.id && (
                  <div className="absolute top-3 right-3 text-indigo-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
                <div className={cn("h-16 w-16 rounded-full border flex items-center justify-center mb-4 shadow-sm", t.bg)}>
                  <t.icon className={cn("h-6 w-6", t.fg)} />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>
        {isCheckoutOverlayOpen && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9990] bg-zinc-950/15 backdrop-blur-[2px]"
            />
          </Portal>
        )}
      </AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 h-full"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-md border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="w-full">
        {/* Content Area */}
        <div className="w-full max-w-7xl">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && <div key="profile">{renderProfile()}</div>}
            {activeTab === "billing" && <div key="billing">{renderBilling()}</div>}
            {activeTab === "appearance" && <div key="appearance">{renderAppearance()}</div>}
            {activeTab === "educator" && <div key="educator">{renderEducatorTrial()}</div>}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
