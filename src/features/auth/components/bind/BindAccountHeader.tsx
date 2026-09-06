"use client";

import React from "react";
import { Link2 } from "lucide-react";

export const BindAccountHeader: React.FC = () => {
  return (
    <div className="text-center pb-2 shrink-0">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md mb-2">
        <Link2 className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        綁定正式帳號
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        將目前的訪客資料無縫合併至正式帳號
      </p>
    </div>
  );
};
