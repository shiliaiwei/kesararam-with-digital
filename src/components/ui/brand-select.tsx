"use client";

/**
 * BrandSelect — a brutalist, road-sign-styled dropdown that replaces the native
 * <select> (whose option popup is OS-rendered and can't be brand-styled).
 *
 * Design DNA (see .claude/skills/kwd-brand-design):
 *   - 2px solid black border, sharp 90° corners, hard offset shadow (no blur)
 *   - UPPERCASE · tracked · bold labels
 *   - highlight = yellow #eab308 fill + black; selected = black fill + yellow text
 *   - Lucide icons only (ChevronDown / Check), flat monochrome
 *
 * Built on @base-ui/react/select for accessibility, keyboard nav, portalled
 * positioning and click-outside — only the skin is custom. Bilingual by design:
 * pass already-localized labels in `options`.
 */
import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BrandSelectOption {
  value: string;
  /** Already-localized label (EN or ខ្មែរ — the caller picks). */
  label: React.ReactNode;
}

export interface BrandSelectProps {
  /** Controlled value. Omit (with `defaultValue`) for an uncontrolled form field. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Uncontrolled initial value — pair with `name` so native <form> submit works. */
  defaultValue?: string;
  options: BrandSelectOption[];
  /** Accessible name (the control has no visible <label>). */
  ariaLabel?: string;
  /** Shown on the trigger when no value is selected. */
  placeholder?: React.ReactNode;
  /** Extra classes for the trigger button. */
  className?: string;
  /** Font passthrough (e.g. the page's Khmer font) — applied to trigger + items. */
  fontStyle?: React.CSSProperties;
  size?: "sm" | "default";
  disabled?: boolean;
  /** Form integration — Base UI renders a hidden input so <form> submit + validation work. */
  name?: string;
  id?: string;
  required?: boolean;
  /** Make the trigger fill its container (forms usually want full width). */
  fullWidth?: boolean;
  /** Surface theme: "light" (default) or "dark" for .kwd-dash dark dashboards. */
  variant?: "light" | "dark";
  /** Inline style override for the trigger (e.g. a semantic status-color background). */
  triggerStyle?: React.CSSProperties;
}

export function BrandSelect({
  value,
  onValueChange,
  defaultValue,
  options,
  ariaLabel,
  placeholder,
  className,
  fontStyle,
  size = "default",
  disabled,
  name,
  id,
  required,
  fullWidth,
  variant = "light",
  triggerStyle,
}: BrandSelectProps) {
  // Controlled when `value` is provided; otherwise uncontrolled (form field).
  const controlled = value !== undefined;
  const dark = variant === "dark";
  return (
    <SelectPrimitive.Root
      {...(controlled
        ? { value, onValueChange: (v) => onValueChange?.((v as string | null) ?? "") }
        : { defaultValue, onValueChange: (v) => onValueChange?.((v as string | null) ?? "") })}
      items={options}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        style={{ borderRadius: 0, ...fontStyle, ...triggerStyle }}
        className={cn(
          "inline-flex select-none items-center justify-between gap-2 border-2 font-bold uppercase tracking-wide outline-none transition-colors",
          fullWidth ? "w-full" : "w-fit",
          dark
            ? "border-[#ffd700]/40 bg-[#111] text-white hover:bg-white/5 focus-visible:bg-white/5 data-[popup-open]:bg-[#ffd700] data-[popup-open]:text-black"
            : "border-black bg-white text-black hover:bg-yellow-50 focus-visible:bg-yellow-50 data-[popup-open]:bg-yellow-400 data-[popup-open]:text-black",
          "disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm"
            ? "px-2 py-1 text-[10px] md:text-[11px]"
            : "px-2.5 py-1.5 text-[11px] md:text-xs",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon
          render={
            <ChevronDown
              size={size === "sm" ? 14 : 16}
              strokeWidth={2.5}
              className="pointer-events-none shrink-0"
            />
          }
        />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          sideOffset={6}
          align="start"
          alignItemWithTrigger={false}
          className="isolate z-50"
        >
          <SelectPrimitive.Popup
            style={{ borderRadius: 0, boxShadow: "4px 4px 0 #000", ...fontStyle }}
            className={cn(
              "z-50 max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto p-0",
              dark
                ? "border-2 border-[#ffd700]/40 bg-[#1a1a1a] text-white"
                : "border-2 border-black bg-white text-black"
            )}
          >
            <SelectPrimitive.List>
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center justify-between gap-2 outline-none",
                    "last:border-b-0 px-3 py-2 border-b-2",
                    "text-[11px] md:text-xs font-bold uppercase tracking-wide",
                    dark
                      ? "border-white/10 text-white data-[highlighted]:bg-[#ffd700] data-[highlighted]:text-black focus:bg-[#ffd700] focus:text-black data-[selected]:bg-[#ffd700] data-[selected]:text-black"
                      : "border-black/10 text-black data-[highlighted]:bg-yellow-400 data-[highlighted]:text-black focus:bg-yellow-400 focus:text-black data-[selected]:bg-black data-[selected]:text-yellow-400"
                  )}
                >
                  <SelectPrimitive.ItemText className="flex-1 whitespace-nowrap">
                    {opt.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator
                    render={
                      <span className="pointer-events-none flex shrink-0 items-center justify-center" />
                    }
                  >
                    <Check size={14} strokeWidth={3} className="pointer-events-none" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
