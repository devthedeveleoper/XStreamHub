import React from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const editSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
});

const EditVideoModal = ({ video, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: {
      title: video.title,
      description: video.description,
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Edit Video Details</h2>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className={`w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                errors.title ? "border-rose-500" : "border-gray-200 dark:border-slate-700"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows="5"
              {...register("description")}
              className={`w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none ${
                errors.description ? "border-rose-500" : "border-gray-200 dark:border-slate-700"
              }`}
            ></textarea>
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideoModal;
