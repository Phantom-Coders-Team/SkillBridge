export interface PasswordRequirement {
  id: "length" | "uppercase" | "lowercase" | "number" | "special";
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 5
  strength: "very-weak" | "weak" | "fair" | "strong" | "very-strong";
  strengthLabel: string;
  strengthColor: string;
  strengthPercent: number;
  requirements: PasswordRequirement[];
  errors: string[];
}

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;

export function evaluatePassword(
  password: string,
  userContext?: { name?: string; email?: string }
): PasswordValidationResult {
  const trimmed = password || "";

  const reqLength = trimmed.length >= 8 && trimmed.length <= 128;
  const reqUpper = /[A-Z]/.test(trimmed);
  const reqLower = /[a-z]/.test(trimmed);
  const reqNumber = /[0-9]/.test(trimmed);
  const reqSpecial = SPECIAL_CHAR_REGEX.test(trimmed);

  const requirements: PasswordRequirement[] = [
    { id: "length", label: "At least 8 characters (max 128)", met: reqLength },
    { id: "uppercase", label: "At least one uppercase letter (A-Z)", met: reqUpper },
    { id: "lowercase", label: "At least one lowercase letter (a-z)", met: reqLower },
    { id: "number", label: "At least one number (0-9)", met: reqNumber },
    { id: "special", label: "At least one special character (!@#$%...)", met: reqSpecial },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const errors: string[] = [];

  if (trimmed.length > 0) {
    if (!reqLength) {
      if (trimmed.length < 8) errors.push("Password must be at least 8 characters.");
      else errors.push("Password cannot exceed 128 characters.");
    }
    if (!reqUpper) errors.push("Password must contain at least one uppercase letter.");
    if (!reqLower) errors.push("Password must contain at least one lowercase letter.");
    if (!reqNumber) errors.push("Password must contain at least one number.");
    if (!reqSpecial) errors.push("Password must contain at least one special character.");

    // Check user context (trivial password check)
    if (userContext) {
      const lowerPass = trimmed.toLowerCase();
      if (userContext.email) {
        const emailPrefix = userContext.email.split("@")[0]?.toLowerCase();
        if (emailPrefix && emailPrefix.length >= 3 && lowerPass.includes(emailPrefix)) {
          errors.push("Password cannot contain your email username.");
        }
      }
      if (userContext.name) {
        const nameParts = userContext.name.toLowerCase().split(/\s+/).filter((p) => p.length >= 3);
        for (const part of nameParts) {
          if (lowerPass.includes(part)) {
            errors.push("Password cannot contain your name.");
            break;
          }
        }
      }
    }
  }

  // Calculate score and strength accurately
  let score = 0;
  if (trimmed.length > 0) {
    if (trimmed.length < 8) {
      // Passwords shorter than 8 characters are inherently weak
      score = Math.min(metCount, 2);
    } else if (metCount === 5 && errors.length === 0) {
      // All 5 core criteria met and no personal info: score 4 for length 8-11, score 5 (very strong) for length >= 12
      score = trimmed.length >= 12 ? 5 : 4;
    } else {
      // When some criteria are missing or personal info detected, max score is capped at 3
      score = Math.min(metCount, 3);
    }
  }

  let strength: PasswordValidationResult["strength"] = "very-weak";
  let strengthLabel = "Very Weak";
  let strengthColor = "bg-red-500 text-red-600 dark:text-red-400";
  let strengthPercent = 0;

  if (trimmed.length === 0) {
    strengthPercent = 0;
    strengthLabel = "Empty";
  } else if (score <= 1) {
    strength = "very-weak";
    strengthLabel = "Very Weak";
    strengthColor = "bg-rose-500 text-rose-600 dark:text-rose-400";
    strengthPercent = 20;
  } else if (score === 2) {
    strength = "weak";
    strengthLabel = "Weak";
    strengthColor = "bg-orange-500 text-orange-600 dark:text-orange-400";
    strengthPercent = 40;
  } else if (score === 3) {
    strength = "fair";
    strengthLabel = "Moderate";
    strengthColor = "bg-amber-500 text-amber-600 dark:text-amber-400";
    strengthPercent = 60;
  } else if (score === 4) {
    strength = "strong";
    strengthLabel = "Strong";
    strengthColor = "bg-sky-500 text-sky-600 dark:text-sky-400";
    strengthPercent = 80;
  } else {
    strength = "very-strong";
    strengthLabel = "Very Strong";
    strengthColor = "bg-emerald-500 text-emerald-600 dark:text-emerald-400";
    strengthPercent = 100;
  }

  const isValid = metCount === 5 && errors.length === 0;

  return {
    isValid,
    score,
    strength,
    strengthLabel,
    strengthColor,
    strengthPercent,
    requirements,
    errors,
  };
}

export function getPasswordValidationError(
  password: string,
  confirmPassword?: string,
  userContext?: { name?: string; email?: string }
): string | null {
  if (!password || password.trim().length === 0) {
    return "Password is required.";
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return "Passwords do not match.";
  }

  const result = evaluatePassword(password, userContext);
  if (!result.isValid) {
    return result.errors[0] || "Password does not meet the minimum security requirements.";
  }

  return null;
}
