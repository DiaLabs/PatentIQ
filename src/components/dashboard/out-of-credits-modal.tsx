"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { createCheckoutSession } from "@/lib/api";
import { DodoPayments } from "dodopayments-checkout";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function OutOfCreditsModal({
  isOpen,
  onClose,
  title = "Out of Credits",
  subtitle = "Your evaluation queue has been paused."
}: TopUpModalProps) {
  const [selectedTier, setSelectedTier] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckoutOverlayOpen, setIsCheckoutOverlayOpen] = useState(false);

  // Initialize DodoPayments SDK on mount
  useEffect(() => {
    DodoPayments.Initialize({
      mode: "test", // Change to "live" for production
      displayType: "overlay",
      onEvent: (event) => {
        console.log("Dodo Checkout event:", event);
        switch (event.event_type) {
          case "checkout.opened":
            setIsLoading(false);
            setIsCheckoutOverlayOpen(true);
            break;
          case "checkout.error":
            setIsLoading(false);
            console.error("Checkout error:", event.data?.message);
            break;
          case "checkout.closed":
            setIsLoading(false);
            setIsCheckoutOverlayOpen(false);
            break;
        }
      },
    });
  }, []);

  const tiers = [
    { credits: 10, price: "₹50", id: 10, popular: false },
    { credits: 50, price: "₹200", id: 50, popular: true },
    { credits: 100, price: "₹350", id: 100, popular: false },
  ];

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
      const theme = isDark ? 'dark' : 'light';
      // Call backend to create Dodo Checkout Session
      const session = await createCheckoutSession(selectedTier, theme);

      // Open the overlay checkout
      let url = session.checkout_url || session.payment_link;
      if (url) {
        const urlObj = new URL(url);
        urlObj.searchParams.set("theme", theme);
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
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
      alert("Failed to initiate checkout. Please try again.");
      setIsLoading(false);
    }
  };

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
      <AnimatePresence>
        {isOpen && (
          <Portal>
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-zinc-950/5 backdrop-blur-[2px] transition-all"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 z-10"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <Coins className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Select Package
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {tiers.map((tier) => (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
                        className={`relative flex flex-col items-center justify-center text-center p-2 sm:p-4 rounded-md cursor-pointer transition-all border-2 ${selectedTier === tier.id
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-sm"
                          : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                          }`}
                      >
                        {tier.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-sm whitespace-nowrap shadow-sm">
                            Popular
                          </span>
                        )}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 w-full mt-1 sm:mt-0">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            {tier.credits} Credits
                          </span>
                          <span className="font-bold text-base sm:text-xl text-indigo-600 dark:text-indigo-400 mt-0.5 sm:mt-1">
                            {tier.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="h-12 font-bold rounded-md border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-lg shadow-indigo-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Checkout"
                    )}
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Need a custom plan? Contact us at{" "}
                    <a href="mailto:mail.dialabs@gmail.com" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                      mail.dialabs@gmail.com
                    </a>
                  </p>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
