import React from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ModernHero } from "./ModernHero";
import { ModernFeatured } from "./ModernFeatured";
import { ModernShelves } from "./ModernShelves";

/**
 * Modern Minimalist Template
 * Modular architecture: all sections are isolated in separate files
 * under client/components/store/themes/modern/ for maintainability and extensibility.
 */
export function ModernTheme() {
  return (
    <StoreLayout>
      {/* 1. Hero Section */}
      <ModernHero />

      {/* 2. Featured Drops */}
      <ModernFeatured />

      {/* 3. Category Shelves */}
      <ModernShelves />
    </StoreLayout>
  );
}
