import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";
import { useSelector } from "react-redux";
import {
  useGetJobByIdQuery,
  useUpdateJobMutation,
  useRemoveJobImagesMutation,
} from "../features/jobs/jobApiSlice";
import { BASE_URL } from "../constants/apiConstants";
import { toast } from "react-toastify";
import BottomNav from "../components/BottomNav";
import jobAvatar from "/images/jobAvatar.png";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: job, isLoading: isJobLoading } = useGetJobByIdQuery(id);
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [removeJobImages] = useRemoveJobImagesMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Prefill data
  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setDescription(job.description || "");
      setBudget(job.budget || "");
      setLocation(job.location || "");
      setExistingImages(job.attachments?.length ? job.attachments : []);
    }
  }, [job]);

  // Handle file select + preview
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    e.target.value = null; // allow same file re-upload
  };

  // Remove previewed (new) image
  const handleRemovePreview = (index) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing (already uploaded) image
  const handleRemoveImage = async (imgUrl) => {
    try {
      await removeJobImages({ id, imageUrls: [imgUrl] }).unwrap();
      setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
      toast.success("Image removed successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove image");
    }
  };

  // Submit changes (upload new files only on Save)
 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!title || !description) {
    toast.error("Please fill in all required fields");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("budget", budget);
  formData.append("location", location);

  // If no selected files and no existing images, use default job avatar
  if (selectedFiles.length === 0 && existingImages.length === 0) {
    try {
      const response = await fetch(jobAvatar); // fetch default image
      const blob = await response.blob();
      const file = new File([blob], "default-job.png", { type: blob.type });
      formData.append("images", file);
    } catch (err) {
      console.error("Failed to attach default image", err);
    }
  } else {
    // Otherwise append selected files
    selectedFiles.forEach((file) => formData.append("images", file));
  }

  try {
    await updateJob({ id, formData }).unwrap();
    toast.success("Job updated successfully");
    navigate("/customer-jobs");
  } catch (err) {
    toast.error(err?.data?.message || "Failed to update job");
  }
};


  const allImages = [...existingImages, ...previewUrls];
  const showDefault = allImages.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-8">
      <div className="flex-1 p-4 space-y-6">
        <h1 className="text-2xl font-bold text-center text-primary">
          Edit Job
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary focus:outline-none bg-white dark:bg-gray-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 h-28 focus:ring focus:ring-primary focus:outline-none bg-white dark:bg-gray-800"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium mb-1">Budget (₵)</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary focus:outline-none bg-white dark:bg-gray-800"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary focus:outline-none bg-white dark:bg-gray-800"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Existing Attachments
              </label>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 border rounded-lg overflow-hidden shadow-sm"
                  >
                    <img
                      src={
                        img.startsWith("http")
                          ? img
                          : `${BASE_URL}${img.startsWith("/") ? img : "/" + img}`
                      }
                      alt={`attachment-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                    >
                      <XCircle className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {previewUrls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={url}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePreview(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload New Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-primary file:text-primary"
              onChange={handleFileChange}
            />
          </div>

          {/* Default Image */}
          {showDefault && (
            <div className="flex justify-center mt-3">
              <img
                src={jobAvatar}
                alt="Default Job"
                className="w-32 h-32 object-cover rounded-lg opacity-70"
              />
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isUpdating}
            className={`w-full py-3 rounded-lg font-semibold bg-blue transition duration-200 flex items-center justify-center gap-2 mb-6
              ${isUpdating
                ? "bg-gray-400 cursor-not-allowed"
                : "text-white bg-[#1193d4] hover:bg-secondary hover:text-primary shadow-lg"}
            `}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>

      <BottomNav userType={user?.role} />
    </div>
  );
};

export default EditJob;
