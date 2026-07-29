// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate, Link } from "react-router-dom";
// import { Eye, EyeOff, Shield, Lock, Smartphone, User, Mail, School } from "lucide-react";

// import { createAccountSchema } from "@/utils/validations";
// import { showErrorAlert, showSuccessAlert } from "@/services/pop";
// import api from "@/services/api";

// export  const CreateAccount=()=> {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setError,
//     reset,
//   } = useForm({
//     resolver: zodResolver(createAccountSchema),
//     defaultValues: {
//       role: "admin",
//     },
//   });

//   const togglePassword = () => setShowPassword(!showPassword);
//   const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

//   const onSubmit = async (data) => {
//     setIsLoading(true);

//     try {
//       const response = await api.post("/api/auth/register", data);
//       if (response.data.success) {
//         showSuccessAlert("Account Created!", "Your account has been created successfully.");
//         // Redirect to login after 2 seconds
//         setTimeout(() => {
//           navigate("/admin-login");
//         }, 2000);
//       }
//     } catch (error) {
//       setIsLoading(false);
      
//       const errorMessage = error.response?.data?.message || "An error occurred during registration";
      
//       // Set form errors
//       if (error.response?.data?.errors) {
//         Object.keys(error.response.data.errors).forEach((key) => {
//           setError(key, {
//             type: "manual",
//             message: error.response.data.errors[key],
//           });
//         });
//       } else {
//         setError("root", {
//           type: "manual",
//           message: errorMessage,
//         });
//       }

//       showErrorAlert("Registration Failed", errorMessage);
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
//           <div className="h-2 w-full bg-emerald-600"></div>

//           <div className="p-8">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100 shadow-sm">
//                 <School className="h-10 w-10" />
//               </div>
//               <h1 className="text-2xl font-bold text-slate-800">
//                 Create Account
//               </h1>
//               <p className="text-slate-500 text-sm mt-1">
//                 Register for school surveillance system access
//               </p>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               {/* Full Name */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Full Name
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <User size={16} className="text-slate-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Enter your full name"
//                     {...register("fullName")}
//                     className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 ${
//                       errors.fullName ? "border-red-500" : "border-slate-300"
//                     }`}
//                   />
//                 </div>
//                 {errors.fullName && (
//                   <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
//                 )}
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail size={16} className="text-slate-400" />
//                   </div>
//                   <input
//                     type="email"
//                     placeholder="Enter your email"
//                     {...register("email")}
//                     className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 ${
//                       errors.email ? "border-red-500" : "border-slate-300"
//                     }`}
//                   />
//                 </div>
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
//                 )}
//               </div>

//               {/* Mobile Number */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Mobile Number
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Smartphone size={16} className="text-slate-400" />
//                   </div>
//                   <input
//                     type="tel"
//                     placeholder="Enter 10-digit mobile number"
//                     {...register("mobile")}
//                     className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 ${
//                       errors.mobile ? "border-red-500" : "border-slate-300"
//                     }`}
//                   />
//                 </div>
//                 {errors.mobile && (
//                   <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>
//                 )}
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock size={16} className="text-slate-400" />
//                   </div>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Create a strong password"
//                     {...register("password")}
//                     className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 ${
//                       errors.password ? "border-red-500" : "border-slate-300"
//                     }`}
//                   />
//                   <button
//                     type="button"
//                     onClick={togglePassword}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
//                 )}
//               </div>

//               {/* Confirm Password */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock size={16} className="text-slate-400" />
//                   </div>
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     placeholder="Re-enter your password"
//                     {...register("confirmPassword")}
//                     className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 ${
//                       errors.confirmPassword ? "border-red-500" : "border-slate-300"
//                     }`}
//                   />
//                   <button
//                     type="button"
//                     onClick={toggleConfirmPassword}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
//                   >
//                     {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && (
//                   <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
//                 )}
//               </div>

//               {/* Role Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Account Type
//                 </label>
//                 <select
//                   {...register("role")}
//                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
//                 >
//                   <option value="admin">Administrator</option>
//                   <option value="principal">Principal</option>
//                   <option value="teacher">Teacher</option>
//                   <option value="security">Security Staff</option>
//                 </select>
//               </div>

//               {/* Register Button */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex justify-center cursor-pointer py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
//               >
//                 {isLoading ? (
//                   <>
//                     <svg
//                       className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Creating Account...
//                   </>
//                 ) : (
//                   "Create Account"
//                 )}
//               </button>

//               {/* Root error */}
//               {errors.root && (
//                 <p className="text-red-500 text-xs text-center font-medium">
//                   {errors.root.message}
//                 </p>
//               )}
//   {/* <div className="flex flex-col items-center justify-center  w-full max-w-sm mx-auto p-4 bg-white rounded-xl shadow-lg">
//               <p className="text-center text-sm text-gray-500">
//                 Don't have an account?
//               </p>

//               <div className="mt-4 w-full">
//                 <Link to="/register">
//                   <Button
//                     variant="outline"
//                     className="flex items-center justify-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
//                   >
//                     <UserPlus size={20} className="text-blue-500" />
//                     Create New Account
//                   </Button>
//                 </Link>
//               </div>
//             </div> */}
//               {/* Login Link */}
//               <div className="text-center text-sm text-slate-600">
//                 Already have an account?{" "}
//                 <Link to="/admin-login" className="text-emerald-600 hover:text-emerald-700 font-medium">
//                   Sign in here
//                 </Link>
//               </div>
//             </form>

//             {/* Security Badge */}
//             <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center justify-center">
//               <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
//                 <Shield size={16} />
//                 <span className="text-xs font-semibold uppercase tracking-wide">
//                   Secure Registration
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Shield, Lock, Smartphone, User, Mail, Building2, UserPlus, Briefcase, Camera } from "lucide-react";

import { createAccountSchema } from "@/utils/validations";
import { showErrorAlert, showSuccessAlert } from "@/services/pop";
import api from "@/services/api";

export const CreateAccount = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      role: "admin",
    },
  });

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/register", data);
      if (response.data.success) {
        showSuccessAlert("Account Created!", "Your account has been created successfully.");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/admin-login");
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      
      const errorMessage = error.response?.data?.message || "An error occurred during registration";
      
      // Set form errors
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((key) => {
          setError(key, {
            type: "manual",
            message: error.response.data.errors[key],
          });
        });
      } else {
        setError("root", {
          type: "manual",
          message: errorMessage,
        });
      }

      showErrorAlert("Registration Failed", errorMessage);
    }
  };

  // Organization types
  const organizationTypes = [
    { value: "school", label: "School / Education" },
    { value: "hospital", label: "Hospital / Healthcare" },
    { value: "corporate", label: "Corporate Office" },
    { value: "retail", label: "Retail / Shopping" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "warehouse", label: "Warehouse / Logistics" },
    { value: "other", label: "Other Organization" },
  ];

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
          background: linear-gradient(135deg, #059669, #2563eb);
        }
      `}</style>

      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
          <div className="h-2 w-full gradient-border"></div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100 shadow-sm">
                <Building2 className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Create Account
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Register for enterprise surveillance system access
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your organization name"
                    {...register("schoolName")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 ${
                      errors.schoolName ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.schoolName && (
                  <p className="text-red-500 text-xs mt-1">{errors.schoolName.message}</p>
                )}
              </div>

              {/* Organization Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Organization Type
                </label>
                <select
                  {...register("organizationType")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                >
                  <option value="">Select organization type</option>
                  {organizationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.organizationType && (
                  <p className="text-red-500 text-xs mt-1">{errors.organizationType.message}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    {...register("fullName")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 ${
                      errors.fullName ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your work email"
                    {...register("email")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 ${
                      errors.email ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    {...register("mobile")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 ${
                      errors.mobile ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    {...register("password")}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 ${
                      errors.password ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    {...register("confirmPassword")}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 ${
                      errors.confirmPassword ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Role Selection */}
              {/* <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Account Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase size={16} className="text-slate-400" />
                  </div>
                  <select
                    {...register("role")}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 appearance-none"
                  >
                    <option value="admin">System Administrator</option>
                    <option value="principal">Owner</option>
                    <option value="supervisor">Security Supervisor</option>
                    <option value="operator">Security Operator</option>
                    <option value="viewer">Viewer Only</option>
                  </select>
                </div>
              </div> */}

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center cursor-pointer py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Root error */}
              {errors.root && (
                <p className="text-red-500 text-xs text-center font-medium">
                  {errors.root.message}
                </p>
              )}

              {/* Login Link */}
              <div className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/admin-login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign in here
                </Link>
              </div>
            </form>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
                <Shield size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Secure Registration
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
};