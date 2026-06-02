// components/settings/SecurityCard.jsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export const SecurityCard = ({ onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    onSubmit?.(formData);
    setFormData({ newPassword: "", confirmPassword: "" });
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-100 bg-red-50/30">
        <CardTitle className="font-bold text-red-800">Change Admin Password</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-bold text-slate-500 uppercase">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 uppercase">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all mt-2"
          >
            Update Admin Credentials
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Skeleton
export const SecurityCardSkeleton = () => (
  <Card className="border-slate-200">
    <CardHeader className="p-6 border-b border-slate-100">
      <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
    </CardHeader>
    <CardContent className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-slate-200 rounded animate-pulse" />
        <div className="h-12 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="h-12 bg-slate-200 rounded animate-pulse" />
    </CardContent>
  </Card>
);