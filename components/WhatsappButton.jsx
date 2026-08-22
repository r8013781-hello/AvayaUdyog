"use client";

import { MessageCircle } from "lucide-react";
import { trackWhatsAppClick } from "../lib/tracking";

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/917980640714"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick("floating_button")}
      className="group fixed bottom-6 right-6 z-[75]"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="relative flex">
        <span
          className="absolute inset-0 animate-ping rounded-full bg-[#25d366]/20"
          aria-hidden="true"
        />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#25d366] to-[#0f9d58] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.55)] ring-1 ring-white/25 transition-transform duration-300 ease-smooth group-hover:scale-105">
          <MessageCircle size={24} strokeWidth={2} />
        </span>

        {/* Tooltip */}
        <span className="pointer-events-none absolute right-full top-1/2 mr-3.5 -translate-y-1/2 translate-x-1 whitespace-nowrap opacity-0 transition-all duration-300 ease-smooth group-hover:translate-x-0 group-hover:opacity-100">
          <span className="relative block rounded-xl2 border border-line bg-white px-4 py-2.5 text-[0.78rem] font-semibold text-ink shadow-lift">
            Chat with our design team
            <span
              className="absolute right-0 top-1/2 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-t border-line bg-white"
              aria-hidden="true"
            />
          </span>
        </span>
      </span>
    </a>
  );
}
