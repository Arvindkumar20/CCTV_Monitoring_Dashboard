// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import { loginSchema } from "@/utils/validations";
// import { showErrorAlert, showSuccessAlert } from "@/services/pop";
// import { Link, useNavigate } from "react-router-dom";
// import { Eye, EyeOff, UserPlus, Shield, Lock, Smartphone } from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";

// export default function AdminLogin() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setError,
//     reset,
//   } = useForm({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       rememberMe: false,
//     },
//   });

//   const togglePassword = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const onSubmit = async (data) => {
//     setIsLoading(true);

//     try {
//       // 🔐 Backend Login Call
//       await login({
//         mobile: data.mobile,
//         password: data.password,
//       });

//       showSuccessAlert();

//       navigate("/dashboard");

//       // reset();

//     } catch (error) {
//       console.log(error)
//       const message =
//         error.response?.data?.message || "Invalid mobile number or password";

//       setError("root", {
//         type: "manual",
//         message,
//       });

//       showErrorAlert("Login Failed", message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-pattern min-h-screen flex items-center justify-center p-4">
//       <style jsx>{`
//         .bg-pattern {
//           background-color: #f1f5f9;
//           background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
//         }
//         .glass-effect {
//           background: rgba(255, 255, 255, 0.95);
//           backdrop-filter: blur(10px);
//         }
//       `}</style>

//       <div className="w-full max-w-md">
//         <div className="glass-effect rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
//           <div className="h-2 w-full bg-blue-600"></div>

//           <div className="p-8">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-600 mb-4 border border-blue-100 shadow-sm">
//                 <Shield className="h-8 w-8" />
//               </div>
//               <h1 className="text-2xl font-bold text-slate-800">
//                 Admin Portal
//               </h1>
//               <p className="text-slate-500 text-sm mt-1">
//                 Secure login to school surveillance system
//               </p>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//               {/* Mobile */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Mobile Number
//                 </label>
//                 <div className="relative">
//                   <Smartphone
//                     size={16}
//                     className="absolute left-3 top-3 text-slate-400"
//                   />
//                   <input
//                     type="tel"
//                     {...register("mobile")}
//                     placeholder="Enter registered mobile"
//                     className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                       errors.mobile ? "border-red-500" : "border-slate-300"
//                     }`}
//                   />
//                 </div>
//                 {errors.mobile && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.mobile.message}
//                   </p>
//                 )}
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock
//                     size={16}
//                     className="absolute left-3 top-3 text-slate-400"
//                   />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     {...register("password")}
//                     placeholder="••••••••"
//                     className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                       errors.password ? "border-red-500" : "border-slate-300"
//                     }`}
//                   />
//                   <button
//                     type="button"
//                     onClick={togglePassword}
//                     className="absolute right-3 top-3 text-slate-400"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.password.message}
//                   </p>
//                 )}
//               </div>

//               {/* Submit */}
//               <Button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-blue-600 hover:bg-blue-700"
//               >
//                 {isLoading ? "Verifying..." : "Secure Login"}
//               </Button>

//               {errors.root && (
//                 <p className="text-red-500 text-xs text-center font-medium">
//                   {errors.root.message}
//                 </p>
//               )}
//             </form>

//             {/* Register */}
//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-500">Don't have an account?</p>
//               <Link to="/register">
//                 <Button
//                   variant="outline"
//                   className="mt-3 w-full flex items-center gap-2 justify-center"
//                 >
//                   <UserPlus size={18} />
//                   Create New Account
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 text-center text-xs text-slate-400">
//           © 2026 School Surveillance System
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/utils/validations";
import { showErrorAlert, showSuccessAlert } from "@/services/pop";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Shield, Lock, Smartphone, Building2, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // 🔐 Backend Login Call
      await login({
        mobile: data.mobile,
        password: data.password,
      });

      showSuccessAlert();

      navigate("/dashboard");

      // reset();

    } catch (error) {
      console.log(error)
      const message =
        error.response?.data?.message || "Invalid mobile number or password";

      setError("root", {
        type: "manual",
        message,
      });

      showErrorAlert("Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-pattern min-h-screen flex items-center justify-center p-4">
      <style jsx>{`
        .bg-pattern {
          background-color: #f1f5f9;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        .gradient-border {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
      `}</style>

      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
          <div className="h-2 w-full gradient-border"></div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-600 mb-4 border border-blue-100 shadow-sm">
                <Shield className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Admin Portal
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Secure access to your organization's surveillance system
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Smartphone
                    size={16}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="tel"
                    {...register("mobile")}
                    placeholder="Enter registered mobile number"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.mobile ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Secure Login"
                )}
              </Button>

              {errors.root && (
                <p className="text-red-500 text-xs text-center font-medium">
                  {errors.root.message}
                </p>
              )}
            </form>

            {/* Register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">Don't have an account?</p>
              <Link to="/register">
                <Button
                  variant="outline"
                  className="mt-3 w-full flex items-center gap-2 justify-center border-2 hover:bg-blue-50 hover:border-blue-200 transition-all"
                >
                  <UserPlus size={18} />
                  Create New Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>© 2026 SecureVision</span>
            <span className="w-px h-3 bg-slate-300"></span>
            <span className="flex items-center gap-1">
              <Camera size={12} />
              Enterprise Surveillance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}