import React from "react";
import { useStore } from "@/components/store/StoreLayout";
import { ClassicTheme } from "@/components/store/themes/classic/ClassicTheme";
import { ModernTheme } from "@/components/store/themes/modern/ModernTheme";

/**
 * Main Home Route
 * Dispatches to the appropriate modular theme based on siteSettings.activeTheme / theme state.
 * All theme sections are organized in dedicated folders:
 * - /client/components/store/themes/classic/
 * - /client/components/store/themes/modern/
 */
export default function Index() {
  const { theme } = useStore();

  if (theme === "modern") {
    return <ModernTheme />;
  }

  // Default is Classic Boutique
  return <ClassicTheme />;
}
