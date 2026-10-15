import { ValidationError } from "../errors.js";

export function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`"${field}" must be a non-empty string`, { field });
  }
  return value.trim();
}

export function optionalString(value, field) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new ValidationError(`"${field}" must be a string or null`, { field });
  }
  return value.trim();
}

export function requireArray(value, field) {
  if (!Array.isArray(value)) {
    throw new ValidationError(`"${field}" must be an array`, { field });
  }
  return value;
}

export function optionalDate(value, field) {
  if (value === undefined || value === null) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) {
    throw new ValidationError(`"${field}" must be a valid date`, { field });
  }
  return d;
}

export function requireEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new ValidationError(`"${field}" must be one of: ${allowed.join(", ")}`, { field });
  }
  return value;
}