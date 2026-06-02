// components/guardian/AddGuardianForm/PasswordPreview.jsx
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Shield } from "lucide-react";

export const PasswordPreview = () => {
  const { watch } = useFormContext();
  const [password, setPassword] = useState("---");
  
  const guardianName = watch("guardianName");
  const name = watch("name"); // fallback for name field
  const mobile = watch("mobile"); // guardian's mobile number

  useEffect(() => {
    // Use guardian name (either guardianName or name field)
    const nameToUse = guardianName || name;
    
    if (nameToUse?.length >= 3 && mobile) {
      // Get first 3 letters of guardian name
      const first3 = nameToUse.substring(0, 3).toLowerCase();
      
      // Get last 4 digits of mobile number
      const mobileStr = String(mobile).replace(/\D/g, ''); // Remove non-digits
      const last4Digits = mobileStr.slice(-4); // Get last 4 digits
      
      // If we have at least 4 digits
      if (last4Digits.length === 4) {
        const generatedPassword = 
          first3.charAt(0).toUpperCase() + 
          first3.slice(1) + 
          last4Digits;
        
        setPassword(generatedPassword);
      } else {
        setPassword("---");
      }
    } else {
      setPassword("---");
    }
  }, [guardianName, name, mobile]);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
            Guardian Login Password
          </p>
          <p className="text-lg font-mono font-bold text-amber-900 tracking-widest">
            {password}
          </p>
        </div>
      </div>
      <div className="text-[10px] text-amber-700 italic max-w-[150px] text-right">
        Auto-generated from Name + Last 4 digits of Mobile
      </div>
    </div>
  );
};

// Skeleton
export const PasswordPreviewSkeleton = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-200 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-32 bg-amber-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-amber-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-8 w-24 bg-amber-200 rounded animate-pulse" />
    </div>
  </div>
);