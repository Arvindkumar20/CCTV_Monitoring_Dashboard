// Form validation schema using Zod
import z from "zod";
// export const loginSchema = z.object({
//   mobile: z
//     .string()
//     .min(1, "Mobile number is required")
//     .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
//   password: z
//     .string()
//     .min(1, "Password is required")
//     .min(6, "Password must be at least 6 characters"),
//   rememberMe: z.boolean().optional(),
// });



export const loginSchema = z.object({
  mobile: z
    .string()
    .min(10, "Mobile number must be 10 digits")
    .regex(/^(\+91|0)?[6-9]\d{9}$/, "Enter valid Indian mobile number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase, one lowercase, one number and one special character"
    ),

  rememberMe: z.boolean().optional(),
});

// Zod schema for Create Account form
export const createAccountSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name cannot exceed 50 characters")
    .nonempty("Full name is required"),
  
  email: z
    .string()
    .email("Please enter a valid email")
    .nonempty("Email is required"),
  
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number")
    .nonempty("Mobile number is required"),
  
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .nonempty("Password is required"),

  role: z.enum(['admin', 'principal', 'teacher', 'security']).default('admin')
});
