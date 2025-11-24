"use client";

import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const checks = {
    length: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strengthPercentage = (passedChecks / Object.keys(checks).length) * 100;

  const getStrengthLabel = () => {
    if (passedChecks <= 1) return "Weak";
    if (passedChecks <= 2) return "Fair";
    if (passedChecks <= 3) return "Good";
    if (passedChecks <= 4) return "Strong";
    return "Very Strong";
  };

  const getStrengthColor = () => {
    if (passedChecks <= 1) return "bg-red-500";
    if (passedChecks <= 2) return "bg-orange-500";
    if (passedChecks <= 3) return "bg-yellow-500";
    if (passedChecks <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Strength</span>
          <span className="font-semibold">{getStrengthLabel()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {checks.length ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-gray-400" />
          )}
          <span className={checks.length ? "text-gray-700" : "text-gray-500"}>
            At least 8 characters
          </span>
        </div>

        <div className="flex items-center gap-2">
          {checks.hasLowerCase ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-gray-400" />
          )}
          <span className={checks.hasLowerCase ? "text-gray-700" : "text-gray-500"}>
            Lowercase letters (a-z)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {checks.hasUpperCase ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-gray-400" />
          )}
          <span className={checks.hasUpperCase ? "text-gray-700" : "text-gray-500"}>
            Uppercase letters (A-Z)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {checks.hasNumbers ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-gray-400" />
          )}
          <span className={checks.hasNumbers ? "text-gray-700" : "text-gray-500"}>
            Numbers (0-9)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {checks.hasSpecialChar ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-gray-400" />
          )}
          <span className={checks.hasSpecialChar ? "text-gray-700" : "text-gray-500"}>
            Special character (!@#$%) - optional
          </span>
        </div>
      </div>
    </div>
  );
}
