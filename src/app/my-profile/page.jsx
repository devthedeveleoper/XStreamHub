"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import API from "@/lib/api";
import axios from "axios";
import Image from "next/image";
import {
  FaUserCircle,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const getCroppedImg = (image, crop, fileName) => {
  const canvas = document.createElement("canvas");

  const scaleX = image.naturalWidth / image.width;

  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;

  canvas.height = crop.height;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty");

          return;
        }

        blob.name = fileName;

        resolve(blob);
      },
      "image/jpeg",
      0.8
    );
  });
};

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

const profileSchema = Yup.object().shape({
  username: Yup.string().required("Username is required").min(3),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const passwordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your new password"),
});

const MyProfilePage = () => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [upImg, setUpImg] = useState(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropperModal, setShowCropperModal] = useState(false);
  const ASPECT_RATIO = 1;
  const [isUploading, setIsUploading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({
    loading: false,
    message: "",
  });
  const [emailStatus, setEmailStatus] = useState({
    loading: false,
    message: "",
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue,
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    if (session) {
      setValue("username", session.user.name || "");
      setValue("email", session.user.email || "");
    }
  }, [session, setValue]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result.toString()));
      reader.readAsDataURL(e.target.files[0]);
      setShowCropperModal(true);
    }
  };

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, ASPECT_RATIO));
  }, []);

  const handleSaveCroppedAvatar = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error("Please select a crop area first.");
      return;
    }
    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        "avatar.jpeg"
      );
      const formData = new FormData();
      formData.append("avatar", croppedBlob);

      const uploadRes = await axios.post("/api/upload/avatar", formData);

      await API.put("/user/profile", { avatar: uploadRes.data.url });
      await updateSession({
        user: { ...session.user, image: uploadRes.data.url },
      });

      toast.success("Avatar updated successfully!");
      setShowCropperModal(false);
      setUpImg(null);
      setCompletedCrop(null);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error("Failed to upload avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const checkUsername = async (username) => {
    if (!username || username === session.user.name) {
      setUsernameStatus({ loading: false, message: "" });
      return;
    }
    setUsernameStatus({ loading: true, message: "" });
    try {
      const res = await API.post("/auth/check-username", { username });
      setUsernameStatus({
        loading: false,
        message: res.data.available
          ? "Username is available!"
          : res.data.message,
      });
    } catch (err) {
      setUsernameStatus({
        loading: false,
        message: err.response?.data?.message || "Error.",
      });
    }
  };

  const checkEmail = async (email) => {
    if (!email || email === session.user.email) {
      setEmailStatus({ loading: false, message: "" });
      return;
    }
    setEmailStatus({ loading: true, message: "" });
    try {
      const res = await API.post("/auth/check-email", { email });
      setEmailStatus({
        loading: false,
        message: res.data.available ? "Email is available!" : res.data.message,
      });
    } catch (err) {
      setEmailStatus({
        loading: false,
        message: err.response?.data?.message || "Error.",
      });
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      await API.put("/user/profile", data);
      await updateSession({
        user: { ...session.user, name: data.username, email: data.email },
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await API.put("/user/profile", { password: data.password });
      toast.success("Password changed successfully!");
      resetPasswordForm();
    } catch (err) {
      toast.error("Failed to change password.");
    }
  };

  if (status === "loading") {
    return <div className="text-center p-10">Loading Profile...</div>;
  }

  return (
    <>
      {showCropperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
            <button
              onClick={() => setShowCropperModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Crop your avatar</h2>
            {upImg && (
              <div className="max-h-96 overflow-y-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={ASPECT_RATIO}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={upImg}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            )}
            <button
              onClick={handleSaveCroppedAvatar}
              disabled={!completedCrop || isUploading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300 w-full"
            >
              {isUploading ? "Uploading..." : "Save Cropped Avatar"}
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center space-x-4">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <FaUserCircle size={80} className="text-gray-300" />
            )}
            <div className="flex flex-col">
              <label
                htmlFor="avatarInput"
                className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
              >
                Change Avatar
              </label>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
          <form
            onSubmit={handleProfileSubmit(onProfileSubmit)}
            className="space-y-4"
          >
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
                  {...registerProfile("username", {
                    onBlur: (e) => checkUsername(e.target.value),
                  })}
                  className="w-full mt-1 px-3 py-2 border rounded-md pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {usernameStatus.loading && (
                    <FaSpinner className="animate-spin text-gray-400" />
                  )}
                  {usernameStatus.message.includes("available") && (
                    <FaCheckCircle className="text-green-500" />
                  )}
                  {usernameStatus.message &&
                    !usernameStatus.message.includes("available") && (
                      <FaTimesCircle className="text-red-500" />
                    )}
                </div>
              </div>
              {profileErrors.username ? (
                <p className="text-xs text-red-500 mt-1">
                  {profileErrors.username.message}
                </p>
              ) : (
                <p
                  className={`text-xs mt-1 h-4 ${
                    usernameStatus.message.includes("available")
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
                  {...registerProfile("email", {
                    onBlur: (e) => checkEmail(e.target.value),
                  })}
                  className="w-full mt-1 px-3 py-2 border rounded-md pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {emailStatus.loading && (
                    <FaSpinner className="animate-spin text-gray-400" />
                  )}
                  {emailStatus.message.includes("available") && (
                    <FaCheckCircle className="text-green-500" />
                  )}
                  {emailStatus.message &&
                    !emailStatus.message.includes("available") && (
                      <FaTimesCircle className="text-red-500" />
                    )}
                </div>
              </div>
              {profileErrors.email ? (
                <p className="text-xs text-red-500 mt-1">
                  {profileErrors.email.message}
                </p>
              ) : (
                <p
                  className={`text-xs mt-1 h-4 ${
                    emailStatus.message.includes("available")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {emailStatus.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Save Changes
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                {...registerPassword("password")}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
              {passwordErrors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {passwordErrors.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...registerPassword("confirmPassword")}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Change Password
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default MyProfilePage;
