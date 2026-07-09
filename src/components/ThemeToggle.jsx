"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
      aria-label="Toggle Theme"
    >
      {resolvedTheme === "dark" ? (
        <MdLightMode size={20} />
      ) : (
        <MdDarkMode size={20} />
      )}
    </button>
  );
}
