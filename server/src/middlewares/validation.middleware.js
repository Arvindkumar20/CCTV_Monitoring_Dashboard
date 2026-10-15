import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
function fixRtspUrl(url) {
  if (!url || typeof url !== 'string') return url;
  // Agar already sahi hai (single @), kuch mat karo
  const atCount = (url.match(/@/g) || []).length;
  if (atCount <= 1) return url;

  // Multiple @ hain — last @ ko separator maano
  const schemeMatch = url.match(/^(rtsps?|rtmps?):\/\//i);
  if (!schemeMatch) return url;
  const scheme = schemeMatch[0];
  const rest = url.slice(scheme.length);

  const pathStart = rest.search(/[/?#]/);
  const authority = pathStart === -1 ? rest : rest.slice(0, pathStart);
  const pathPart  = pathStart === -1 ? ''   : rest.slice(pathStart);

  const lastAt = authority.lastIndexOf('@');
  const creds = authority.slice(0, lastAt);   // "admin:India@123"
  const host  = authority.slice(lastAt + 1);  // "toyota.ddns.net:554"

  const ci = creds.indexOf(':');
  const user = ci === -1 ? creds : creds.slice(0, ci);
  const pass = ci === -1 ? ''    : creds.slice(ci + 1);

  const enc = (s) => { try { return encodeURIComponent(decodeURIComponent(s)); } catch { return encodeURIComponent(s); } };

  return `${scheme}${enc(user)}${pass ? ':' + enc(pass) : ''}@${host}${pathPart}`;
}
/**
 * Method 1: Validation using next() + Global Error Handler (Recommended)
 */
export const validate = (validations) => {
  
  return asyncHandler(async (req, res, next) => {
     if (req.body?.rtspUrl) {
    req.body.rtspUrl = fixRtspUrl(req.body.rtspUrl);   // 👈 YE ADD KARO
  }
  console.log(req.body);

    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    // ✅ Pass errors directly in constructor
    return next(
      new AppError("Validation failed", 400, formattedErrors)
    );
  });
};

/**
 * Method 2: Direct Response (Without Global Error Handler)
 * Use only if you don't want centralized error handling
 */
export const validateWithResponse = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);

      if (errors.isEmpty()) {
        return next();
      }

      const formattedErrors = {};
      errors.array().forEach((error) => {
        formattedErrors[error.path] = error.msg;
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Method 3: Custom Validation (Zod / Joi / Other Schema Validators)
 */
export const validateCustom = (schema) => {
  return asyncHandler(async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (err) {
      const formattedErrors = {};

      // Zod format
      if (err.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e) => {
          const field = e.path?.join(".") || "field";
          formattedErrors[field] = e.message;
        });
      }

      return next(
        new AppError("Validation failed", 400, formattedErrors)
      );
    }
  });
};