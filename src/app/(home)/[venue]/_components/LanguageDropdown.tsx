"use client";

import { useRef, useEffect, useState } from "react";
import { setAppLanguage } from "@/i18n";

type LangUI = "RU" | "KG" | "ENG";
type LangCode = "ru" | "kg" | "en";

// Mapping between UI labels and i18n language codes
const uiToCode: Record<LangUI, LangCode> = { RU: "ru", KG: "kg", ENG: "en" };
const codeToUi: Record<LangCode, LangUI> = { ru: "RU", kg: "KG", en: "ENG" };

const options: LangUI[] = ["RU", "KG", "ENG"];

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LangUI>("RU");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize selection from localStorage/lang
  useEffect(() => {
    try {
      const stored = (localStorage.getItem("lang") as LangCode | null) || "ru";
      setSelected(codeToUi[stored] || "RU");
    } catch {
      setSelected("RU");
    }
  }, []);

  const onSelect = (lang: LangUI) => {
    setSelected(lang);
    setOpen(false);
    // Switch i18n language, persist, and reload to refetch backend data with Accept-Language
    const code = uiToCode[lang];
    try {
      setAppLanguage(code);
      // Force full reload to let SSR/queries refetch with new Accept-Language
      if (typeof window !== "undefined") window.location.reload();
    } catch {
      // As a fallback still reload
      if (typeof window !== "undefined") window.location.reload();
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="header-icon flex items-center gap-[6px]"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{selected}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={open ? "rotate-180 transition-transform" : "transition-transform"}
        >
          <g clipPath="url(#clip0_54_51960)">
            <path
              d="M13.5 6.75L9 12.375L4.125 6.75"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_54_51960">
              <rect width="18" height="18" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-50 right-0 top-full mt-2 w-[120px] rounded-[12px] border border-gray-100 bg-white p-1 shadow-lg"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="menuitem"
              className={
                "w-full text-left px-3 py-2 rounded-[10px] hover:bg-[#FAFAFA] " +
                (opt === selected ? "font-semibold" : "")
              }
              onClick={() => onSelect(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
