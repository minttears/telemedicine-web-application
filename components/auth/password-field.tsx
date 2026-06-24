"use client";

import { useState } from "react";

type PasswordFieldProps = {
  autoComplete: string;
  helpText?: string;
  id: string;
  label: string;
  name?: string;
  onChange: (value: string) => void;
  value: string;
};

export function PasswordField({
  autoComplete,
  helpText,
  id,
  label,
  name,
  onChange,
  value,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const buttonLabel = isVisible ? "Скрыть пароль" : "Показать пароль";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-800" htmlFor={id}>
          {label}
        </label>
        <button
          aria-controls={id}
          aria-label={buttonLabel}
          className="text-sm font-medium text-teal-700 transition hover:text-teal-800"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {buttonLabel}
        </button>
      </div>
      <input
        autoComplete={autoComplete}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        id={id}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        type={isVisible ? "text" : "password"}
        value={value}
      />
      {helpText ? (
        <p className="text-xs leading-5 text-slate-500">{helpText}</p>
      ) : null}
    </div>
  );
}
