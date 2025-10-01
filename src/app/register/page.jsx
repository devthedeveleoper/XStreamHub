"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import API from "@/lib/api";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useDebounce } from "@/hooks/useDebounce";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import PasswordStrength from "@/components/PasswordStrength";

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
      "Must meet all strength requirements"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  avatar: Yup.mixed().test(
    "fileSize",
    "The file is too large (max 5MB)",
    (value) => {
      if (!value || !value.length) return true;
      return value[0].size <= 5000000;
    }
  ),
});

const RegisterPage = () => {
  const router = useRouter();
  const [usernameStatus, setUsernameStatus] = useState({
    loading: false,
    message: "",
  });
  const [emailStatus, setEmailStatus] = useState({
    loading: false,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const usernameValue = watch("username");
  const emailValue = watch("email");
  const passwordValue = watch("password", "");

  const debouncedUsername = useDebounce(usernameValue, 2000);
  const debouncedEmail = useDebounce(emailValue, 2000);

  useEffect(() => {
    if (!debouncedUsername || errors.username) {
      setUsernameStatus({ loading: false, message: "" });
      return;
    }
    const checkUsername = async () => {
      setUsernameStatus({ loading: true, message: "" });
      try {
        const res = await API.post("/auth/check-username", {
          username: debouncedUsername,
        });
        setUsernameStatus({
          loading: false,
          message: res.data.available
            ? "Username is available!"
            : res.data.message,
        });
      } catch (err) {
        setUsernameStatus({
          loading: false,
          message: err.response?.data?.message || "Error checking username.",
        });
      }
    };
    checkUsername();
  }, [debouncedUsername, errors.username]);

  useEffect(() => {
    if (!debouncedEmail || errors.email) {
      setEmailStatus({ loading: false, message: "" });
      return;
    }
    const checkEmail = async () => {
      setEmailStatus({ loading: true, message: "" });
      try {
        const res = await API.post("/auth/check-email", {
          email: debouncedEmail,
        });
        setEmailStatus({
          loading: false,
          message: res.data.available
            ? "Email is available!"
            : res.data.message,
        });
      } catch (err) {
        setEmailStatus({
          loading: false,
          message: err.response?.data?.message || "Error checking email.",
        });
      }
    };
    checkEmail();
  }, [debouncedEmail, errors.email]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let avatarUrl = null;
      if (data.avatar && data.avatar.length > 0) {
        const formData = new FormData();
        formData.append("avatar", data.avatar[0]);
        const response = await axios.post("/api/upload/avatar", formData);
        avatarUrl = response.data.url;
      }

      await API.post("/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        avatar: avatarUrl,
      });

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error("Login failed after registration.");
      } else {
        toast.success("Registration successful! Welcome.");
        router.push("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Create an Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                {...register("username")}
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {usernameStatus.loading && (
                  <FaSpinner className="animate-spin text-gray-400" />
                )}
                {usernameStatus.message === "Username is available!" && (
                  <FaCheckCircle className="text-green-500" />
                )}
                {usernameStatus.message &&
                  usernameStatus.message !== "Username is available!" &&
                  !errors.username && (
                    <FaTimesCircle className="text-red-500" />
                  )}
              </div>
            </div>
            {errors.username ? (
              <p className="text-xs text-red-600 mt-1">
                {errors.username.message}
              </p>
            ) : (
              <p
                className={`text-xs mt-1 h-4 ${
                  usernameStatus.message === "Username is available!"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {usernameStatus.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {emailStatus.loading && (
                  <FaSpinner className="animate-spin text-gray-400" />
                )}
                {emailStatus.message === "Email is available!" && (
                  <FaCheckCircle className="text-green-500" />
                )}
                {emailStatus.message &&
                  emailStatus.message !== "Email is available!" &&
                  !errors.email && <FaTimesCircle className="text-red-500" />}
              </div>
            </div>
            {errors.email ? (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            ) : (
              <p
                className={`text-xs mt-1 h-4 ${
                  emailStatus.message === "Email is available!"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {emailStatus.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xl"
              >
                {showPassword ? "🙉" : "🙈"}
              </button>
            </div>
            <PasswordStrength password={passwordValue || ""} />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xl"
              >
                {showPassword ? "🙉" : "🙈"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Avatar (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              {...register("avatar")}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-50 hover:file:bg-gray-100"
            />
            {errors.avatar && (
              <p className="text-xs text-red-600 mt-1">
                {errors.avatar.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
