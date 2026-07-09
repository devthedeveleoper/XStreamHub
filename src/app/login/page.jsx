"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FaGoogle, FaGithub } from "react-icons/fa";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      toast.error("Invalid email or password.");
    } else {
      toast.success("Logged in successfully!");
      router.push("/");
    }
  };

  const handleSocialLogin = (provider) => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 animate-in fade-in duration-300">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full px-4 py-2 mt-1 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-all ${
                errors.email ? "border-rose-500" : "border-gray-200 dark:border-slate-700"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className={`w-full px-4 py-2 mt-1 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-all ${
                errors.password ? "border-rose-500" : "border-gray-200 dark:border-slate-700"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-200 dark:before:border-slate-700 after:flex-1 after:border-t after:border-gray-200 dark:after:border-slate-700">
            <p className="mx-4 text-center font-semibold text-gray-400 dark:text-gray-500 text-xs tracking-wider">OR</p>
        </div>
        
        <div className="space-y-3">
            <button type="button" onClick={() => handleSocialLogin('google')} className="flex w-full items-center justify-center gap-3 rounded-xl bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <FaGoogle className="h-5 w-5 text-rose-500" />
                Continue with Google
            </button>
            <button type="button" onClick={() => handleSocialLogin('github')} className="flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 dark:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 dark:hover:bg-white/20 transition-colors">
                <FaGithub className="h-5 w-5" />
                Continue with GitHub
            </button>
        </div>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;