import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Lock, User, Eye, EyeOff, ShieldAlert } from "lucide-react";

export const ParentLogin = ({ onLogin, loading: externalLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onLogin(formData);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || externalLoading;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full rounded-2xl shadow-xl p-8 border-blue-100">
        <CardContent className="p-0">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <Camera className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Parent Connect
            </h1>
            <p className="text-slate-500 mt-2">Secure Classroom Monitoring</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Mobile Number / Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  value={formData.identifier}
                  onChange={(e) =>
                    setFormData({ ...formData, identifier: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your ID"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Secure Login"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Encrypted & Private Connection
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Login Skeleton
export const ParentLoginSkeleton = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-4 animate-pulse" />
        <div className="h-8 w-48 bg-slate-200 rounded mx-auto mb-2 animate-pulse" />
        <div className="h-4 w-32 bg-slate-200 rounded mx-auto animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);