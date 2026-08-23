"use client";

import { ArrowUpRight } from "lucide-react";
import { useContactModal } from "./ContactModalProvider";

/**
 * The same consultation-modal CTA pattern used across Hero/About/Services/
 * AboutCompany, extracted so the new SEO landing pages can trigger it
 * without a second tracking implementation — useContactModal() already
 * fires trackConsultationOpen() with whatever trigger_source is passed in.
 */
export default function PageCTAButton({ triggerSource, children, className = "" }) {
  const openContactModal = useContactModal();

  return (
    <button
      type="button"
      onClick={() => openContactModal(triggerSource)}
      className={`btn-primary group ${className}`}
    >
      {children}
      <ArrowUpRight
        size={16}
        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
