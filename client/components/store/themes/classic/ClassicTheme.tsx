import React from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ClassicHero } from "./ClassicHero";
import { ClassicNewCollection } from "./ClassicNewCollection";
import { ClassicCategories } from "./ClassicCategories";
import { ClassicEditorial } from "./ClassicEditorial";
import { ClassicDiscover } from "./ClassicDiscover";
import { ClassicShelves } from "./ClassicShelves";
import { ClassicTrustBadges } from "./ClassicTrustBadges";

/**
 * Classic Boutique Template
 * Modular architecture: all sections are isolated in separate files
 * under client/components/store/themes/classic/ for maintainability and extensibility.
 */
export function ClassicTheme() {
  return (
    <StoreLayout>
      {/* 1. Hero Section */}
      <ClassicHero />

      {/* 2. New Arrivals Grid */}
      <ClassicNewCollection />

      {/* 3. Shop by Category */}
      <ClassicCategories />

      {/* 4. Editorial Vision Banner */}
      <ClassicEditorial />

      {/* 5. Discover Your Style - Video Reels */}
      <ClassicDiscover />

      {/* 6. Collection Shelves (Horizontal Drag) */}
      <ClassicShelves />

      {/* 7. Trust Badges Strip */}
      <ClassicTrustBadges />
    </StoreLayout>
  );
}
