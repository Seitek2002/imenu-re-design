"use client";

import { useRef, useEffect, useState } from "react";

type Lang = "RU" | "KG" | "ENG";

const options: Lang[] = ["RU", "KG", "ENG"];

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Lang>("RU");
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

  const onSelect = (lang: Lang) => {
    setSelected(lang);
    setOpen(false);
    // TODO: hook into i18n switcher here if needed
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
