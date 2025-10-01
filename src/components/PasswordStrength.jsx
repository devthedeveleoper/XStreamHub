import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Requirement = ({ met, text }) => (
  <div
    className={`flex items-center text-xs transition-colors ${
      met ? "text-green-600" : "text-gray-400"
    }`}
  >
    {met ? (
      <FaCheckCircle className="mr-2" />
    ) : (
      <FaTimesCircle className="mr-2" />
    )}
    <span>{text}</span>
  </div>
);

const PasswordStrength = ({ password }) => {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!password) return null;

  return (
    <div className="p-3 bg-gray-50 rounded-md mt-2 space-y-1">
      <Requirement met={isLongEnough} text="At least 8 characters" />
      <Requirement met={hasLowerCase} text="Contains a lowercase letter" />
      <Requirement met={hasUpperCase} text="Contains an uppercase letter" />
      <Requirement met={hasNumber} text="Contains a number" />
      <Requirement
        met={hasSpecialChar}
        text="Contains a special character (!@#...)"
      />
    </div>
  );
};

export default PasswordStrength;
