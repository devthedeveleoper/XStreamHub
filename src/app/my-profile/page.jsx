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
  FaImage,
} from "react-icons/fa";
import { MdSecurity, MdPerson } from "react-icons/md";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import PasswordStrength from "@/components/PasswordStrength";

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
  bio: Yup.string().max(500, "Bio cannot exceed 500 characters"),
});

const securitySchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .test('empty-or-valid', 'Password must meet requirements', (val) => {
      if (!val) return true; // Optional
      return val.length >= 8 && /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*]/.test(val);
    }),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

const MyProfilePage = () => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security'

  // Image Upload State
  const [upImg, setUpImg] = useState(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [cropType, setCropType] = useState("avatar"); // 'avatar' | 'banner'
  const [isUploading, setIsUploading] = useState(false);

  // Status checks
  const [usernameStatus, setUsernameStatus] = useState({ loading: false, message: "" });
  const [emailStatus, setEmailStatus] = useState({ loading: false, message: "" });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    setValue: setProfileValue,
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerSecurity,
    handleSubmit: handleSecuritySubmit,
    formState: { errors: securityErrors, isSubmitting: isSecuritySubmitting },
    setValue: setSecurityValue,
    watch: watchSecurity,
    reset: resetSecurityForm,
  } = useForm({
    resolver: yupResolver(securitySchema),
  });

  const passwordValue = watchSecurity("password", "");

  useEffect(() => {
    if (session) {
      setProfileValue("username", session.user.name || "");
      setProfileValue("bio", session.user.bio || "");
      setSecurityValue("email", session.user.email || "");
    }
  }, [session, setProfileValue, setSecurityValue]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleImageSelect = (e, type) => {
    if (e.target.files && e.target.files.length > 0) {
      setCropType(type);
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
    const aspect = cropType === "avatar" ? 1 : 16 / 5;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [cropType]);

  const handleSaveCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error("Please select a crop area first.");
      return;
    }
    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        `${cropType}.jpeg`
      );
      const formData = new FormData();
      formData.append("avatar", croppedBlob); // We use avatar field so api/upload/avatar handles it normally

      // We'll reuse the upload/avatar endpoint
      const uploadRes = await axios.post("/api/upload/avatar", formData);
      const url = uploadRes.data.url;

      await API.put("/user/profile", { [cropType]: url });
      
      const newSessionData = { ...session.user };
      if (cropType === 'avatar') newSessionData.image = url;
      if (cropType === 'banner') newSessionData.banner = url;
      
      await updateSession({ user: newSessionData });

      toast.success(`${cropType.charAt(0).toUpperCase() + cropType.slice(1)} updated successfully!`);
      setShowCropperModal(false);
      setUpImg(null);
      setCompletedCrop(null);
    } catch (err) {
      console.error(`${cropType} upload failed:`, err);
      toast.error(`Failed to upload ${cropType}.`);
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
        message: res.data.available ? "Username is available!" : res.data.message,
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
      await API.put("/user/profile", { username: data.username, bio: data.bio });
      await updateSession({
        user: { ...session.user, name: data.username, bio: data.bio },
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const onSecuritySubmit = async (data) => {
    try {
      const payload = { email: data.email };
      if (data.password) payload.password = data.password;
      
      await API.put("/user/profile", payload);
      await updateSession({
        user: { ...session.user, email: data.email },
      });
      toast.success("Security settings updated successfully!");
      if (data.password) {
        resetSecurityForm({ email: data.email, password: "", confirmPassword: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update security settings.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <FaSpinner className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <>
      {showCropperModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full relative border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setShowCropperModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white font-display tracking-tight">Crop your {cropType}</h2>
            {upImg && (
              <div className="max-h-[60vh] overflow-y-auto bg-gray-50 dark:bg-slate-900 rounded-xl p-2 flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={cropType === "avatar" ? 1 : 16 / 5}
                  circularCrop={cropType === "avatar"}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={upImg}
                    onLoad={onImageLoad}
                    className="max-w-full"
                  />
                </ReactCrop>
              </div>
            )}
            <button
              onClick={handleSaveCroppedImage}
              disabled={!completedCrop || isUploading}
              className="mt-6 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl disabled:bg-indigo-400 hover:bg-indigo-700 transition-all w-full shadow-md flex items-center justify-center gap-2"
            >
              {isUploading ? <FaSpinner className="animate-spin" /> : null}
              {isUploading ? "Uploading..." : "Save Image"}
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-6">Settings</h1>
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "profile" 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
                }`}
              >
                <MdPerson size={20} />
                Public Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "security" 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
                }`}
              >
                <MdSecurity size={20} />
                Account Security
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow">
            
            {/* PUBLIC PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                
                {/* Banner & Avatar Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden relative">
                  {/* Banner */}
                  <div className="h-32 sm:h-48 w-full relative bg-indigo-50 dark:bg-slate-800 group">
                    {session?.user?.banner ? (
                      <Image src={session.user.banner} alt="Banner" layout="fill" objectFit="cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-50">
                        <FaImage size={40} className="text-gray-400" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300">
                      <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
                        <FaImage /> Change Banner
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'banner')} />
                    </label>
                  </div>
                  
                  {/* Avatar */}
                  <div className="px-6 pb-6 relative flex justify-between items-end">
                    <div className="relative -mt-12 sm:-mt-16 group inline-block z-10">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name}
                          width={100}
                          height={100}
                          className="rounded-full object-cover ring-4 ring-white dark:ring-slate-900 bg-white dark:bg-slate-900 w-24 h-24 sm:w-32 sm:h-32"
                        />
                      ) : (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-white dark:ring-slate-900 bg-gray-200 dark:bg-slate-800 flex items-center justify-center">
                           <FaUserCircle size={60} className="text-gray-400" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300">
                        <span className="text-white text-xs font-medium text-center">Change<br/>Avatar</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'avatar')} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Section */}
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-display tracking-tight">Profile Details</h2>
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                      <div className="relative">
                        <input
                          {...registerProfile("username", { onBlur: (e) => checkUsername(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {usernameStatus.loading && <FaSpinner className="animate-spin text-gray-400" />}
                          {usernameStatus.message.includes("available") && <FaCheckCircle className="text-emerald-500" />}
                          {usernameStatus.message && !usernameStatus.message.includes("available") && <FaTimesCircle className="text-rose-500" />}
                        </div>
                      </div>
                      <p className={`text-xs mt-1 h-4 ${usernameStatus.message.includes("available") ? "text-emerald-600" : "text-rose-600"}`}>
                        {profileErrors.username ? profileErrors.username.message : usernameStatus.message}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                      <textarea
                        {...registerProfile("bio")}
                        rows="4"
                        placeholder="Tell viewers about your channel..."
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                      />
                      {profileErrors.bio && <p className="text-xs text-rose-500 mt-1">{profileErrors.bio.message}</p>}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isProfileSubmitting}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-70 flex items-center gap-2"
                      >
                        {isProfileSubmitting && <FaSpinner className="animate-spin" />}
                        Save Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-display tracking-tight">Account Security</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Manage your email and update your password.</p>
                  
                  <form onSubmit={handleSecuritySubmit(onSecuritySubmit)} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          {...registerSecurity("email", { onBlur: (e) => checkEmail(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {emailStatus.loading && <FaSpinner className="animate-spin text-gray-400" />}
                          {emailStatus.message.includes("available") && <FaCheckCircle className="text-emerald-500" />}
                          {emailStatus.message && !emailStatus.message.includes("available") && <FaTimesCircle className="text-rose-500" />}
                        </div>
                      </div>
                      <p className={`text-xs mt-1 h-4 ${emailStatus.message.includes("available") ? "text-emerald-600" : "text-rose-600"}`}>
                        {securityErrors.email ? securityErrors.email.message : emailStatus.message}
                      </p>
                    </div>

                    <hr className="border-gray-200 dark:border-slate-700 my-6" />
                    
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Change Password</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (Optional)</label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        {...registerSecurity("password")}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                      {securityErrors.password && <p className="text-xs text-rose-500 mt-1">{securityErrors.password.message}</p>}
                      {passwordValue && <PasswordStrength password={passwordValue} />}
                    </div>

                    {passwordValue && (
                      <div className="animate-in fade-in duration-300">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          {...registerSecurity("confirmPassword")}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                        />
                        {securityErrors.confirmPassword && (
                          <p className="text-xs text-rose-500 mt-1">{securityErrors.confirmPassword.message}</p>
                        )}
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSecuritySubmitting}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-70 flex items-center gap-2"
                      >
                        {isSecuritySubmitting && <FaSpinner className="animate-spin" />}
                        Save Security Settings
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </>
  );
};

export default MyProfilePage;
