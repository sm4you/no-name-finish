import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "بيانات الدخول غير صحيحة");
      }
      localStorage.setItem("no_name_admin_token", data.token || "admin-session-active");
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2eb] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-[#1c1817] text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <Shield className="w-6 h-6 text-[#e6b980]" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1c1817]">
          بوابة إدارة No Name
        </h2>
        <p className="mt-1 text-xs text-[#7a716a]">
          سجلي الدخول للوصول إلى إدارة المنتجات، الطلبات والإعدادات
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#ece4da]">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1c1817] mb-1">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-sm bg-[#faf8f5] border border-[#d8cfc5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a5d3b]"
                />
                <User className="w-4 h-4 text-[#8a817c] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1c1817] mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-sm bg-[#faf8f5] border border-[#d8cfc5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a5d3b]"
                />
                <Lock className="w-4 h-4 text-[#8a817c] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1c1817] hover:bg-[#38312e] text-white font-bold text-sm h-11 rounded-lg mt-2"
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#f2ebe2] text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#8a5d3b] hover:text-[#1c1817] font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>العودة إلى واجهة المتجر</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
