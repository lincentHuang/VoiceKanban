"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputClass } from "@/components/ui/input";

interface AuthPasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
}

export const AuthPasswordField: React.FC<AuthPasswordFieldProps> = ({
  value,
  onChange,
  showPassword,
  setShowPassword,
}) => {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
        密碼（至少 6 碼）
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className={inputClass("md", "pr-10")}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
