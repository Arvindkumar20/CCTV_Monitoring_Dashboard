export class AccessControlError extends Error {
  constructor(message, code = "ACCESS_CONTROL_ERROR", statusCode = 500, meta = {}) {
    super(message);
    this.name = "AccessControlError";
    this.code = code;
    this.statusCode = statusCode;
    this.meta = meta;
  }
}

export class ValidationError extends AccessControlError {
  constructor(message, meta) {
    super(message, "VALIDATION_ERROR", 400, meta);
  }
}

export class NotFoundError extends AccessControlError {
  constructor(message, meta) {
    super(message, "NOT_FOUND", 404, meta);
  }
}

export class ConflictError extends AccessControlError {
  constructor(message, meta) {
    super(message, "CONFLICT", 409, meta);
  }
}

export class ForbiddenError extends AccessControlError {
  constructor(message, meta) {
    super(message, "FORBIDDEN", 403, meta);
  }
}