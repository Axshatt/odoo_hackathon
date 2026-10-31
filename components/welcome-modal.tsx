"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Repeat2,
  FileText,
  CreditCard,
  Layers3,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [slide, setSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      eyebrow: "PROBLEM & FOUNDATION",
      title: "Subscription Chaos, Solved.",
      subtitle:
        "Businesses struggle with fragmented billing, manual recurring invoices, double-charge risks, and scattered customer quotations.",
      points: [
        {
          icon: Repeat2,
          heading: "State-Driven Lifecycle",
          text: "End-to-end subscription progression from Draft quotation to Confirmed and Active recurring cycles.",
        },
        {
          icon: ShieldCheck,
          heading: "Idempotent Billing Engine",
          text: "Guaranteed single-charge runs using compound indexes so customers never get billed twice in the same period.",
        },
        {
          icon: Layers3,
          heading: "Dynamic Catalog & Variants",
          text: "Modular plans with custom seat volume discounts, tier upgrades, and automated tax calculations.",
        },
      ],
      action: "Next: Automated Billing",
    },
    {
      eyebrow: "OPERATIONS & AUTOMATION",
      title: "One-Click Billing & Settlement.",
      subtitle:
        "Automated batch generation with zero human friction and instant UPI/bank reconciliation.",
      points: [
        {
          icon: FileText,
          heading: "Automated Billing Day Batches",
          text: "Scan hundreds of recurring contracts in one click. Invoices generate with precalculated 18% GST and custom line terms.",
        },
        {
          icon: CreditCard,
          heading: "Instant Reconciled Payments",
          text: "Record full settlements with automatic cycle advance. Next invoice due dates update seamlessly with month-end date clamping.",
        },
        {
          icon: Sparkles,
          heading: "Smart Quotation Offers",
          text: "Pre-configured quotation templates with defined validity windows and seat scaling for sales teams.",
        },
      ],
      action: "Next: Brightloop Intelligence",
    },
    {
      eyebrow: "AI COPILOT & CONTROL",
      title: "Intelligence As Universal Hub.",
      subtitle:
        "Every subscription operation, revenue audit, and operational task accessible from a single conversation point.",
      points: [
        {
          icon: Sparkles,
          heading: "Conversational Actions",
          text: "Trigger batch runs, settle overdue invoices, and configure offers directly through natural language commands.",
        },
        {
          icon: Repeat2,
          heading: "Central Workspace Access",
          text: "Jump straight into Overview metrics, Subscriptions ledger, Products catalog, and Invoice audits with one touch.",
        },
        {
          icon: ShieldCheck,
          heading: "Full Role-Based Security",
          text: "Admin, Staff, and Customer view scoping backed by MongoDB Atlas and secure JWT authorization.",
        },
      ],
      action: "Get Started in Brightloop",
    },
  ];

  const current = slides[slide];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (slide > 0) {
      setSlide(slide - 1);
    }
  };

  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <motion.div
        className="welcome-modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
      >
        <button
          onClick={onClose}
          className="welcome-modal-close-btn"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="welcome-modal-body-wrapper">
          <div className="welcome-modal-left-column">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="welcome-modal-slide-content"
              >
                <span className="welcome-modal-eyebrow">{current.eyebrow}</span>
                <h2 className="welcome-modal-title">{current.title}</h2>
                <p className="welcome-modal-sub">{current.subtitle}</p>

                <div className="welcome-modal-points-list">
                  {current.points.map((pt) => {
                    const Icon = pt.icon;
                    return (
                      <div key={pt.heading} className="welcome-modal-point-item">
                        <div className="welcome-modal-point-icon">
                          <Icon size={16} />
                        </div>
                        <div>
                          <strong>{pt.heading}</strong>
                          <p>{pt.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="welcome-modal-right-brand">
            <div className="welcome-modal-logo-halo">
              <span className="brand-symbol">
                b<span />
              </span>
            </div>
            <div className="welcome-modal-brand-name">
              <span>brightloop</span>
              <span className="brand-dot">.</span>
            </div>
            <span className="welcome-modal-tagline">
              One considered workspace for subscription management
            </span>
          </div>
        </div>

        <div className="welcome-modal-footer">
          <div className="welcome-modal-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                className={`welcome-modal-dot ${i === slide ? "active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="welcome-modal-footer-nav">
            {slide > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="welcome-modal-back-btn"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="welcome-modal-next-btn"
            >
              <span>{current.action}</span>
              {slide < slides.length - 1 ? (
                <ChevronRight size={16} />
              ) : (
                <Check size={16} />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

