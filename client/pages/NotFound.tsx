import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StoreLayout>
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-4">
        <span className="font-serif text-6xl font-bold text-[#8a5d3b]">404</span>
        <h1 className="text-2xl font-bold text-[#1c1817]">الصفحة غير موجودة</h1>
        <p className="text-sm text-[#7a716a]">
          عذراً، لم نتمكن من العثور على الصفحة أو القطعة التي تبحثين عنها.
        </p>
        <div className="pt-4">
          <Button asChild className="bg-[#1c1817] hover:bg-[#38312e] text-white">
            <Link to="/">
              <span>العودة للرئيسية</span>
              <ArrowLeft className="mr-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </StoreLayout>
  );
}
