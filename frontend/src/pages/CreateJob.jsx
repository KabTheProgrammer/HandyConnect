import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { IoMdArrowBack } from "react-icons/io";
import { JOB_URL } from "../constants/apiConstants";
import jobAvatar from "/images/jobAvatar.png";

const CreateJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    completionDate: "",
    location: "",
  });

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // ✅ Handle image upload & preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    if (files.length > 0) {
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
    } else {
      setPreviewImages([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, category, budget, completionDate, location } =
      formData;

    // ✅ Check missing fields
    const missingFields = Object.entries({
      title,
      description,
      category,
      budget,
      completionDate,
      location,
    })
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      const formatted = missingFields
        .map((f) => f.replace(/([A-Z])/g, " $1").toLowerCase())
        .join(", ");
      toast.error(`Please fill in the following fields: ${formatted}`);
      return;
    }

    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      if (!token) {
        toast.error("You must be logged in to post a job.");
        setLoading(false);
        return;
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );

      // ✅ Use default avatar if no image is uploaded
      if (images.length === 0) {
        const response = await fetch(jobAvatar);
        const blob = await response.blob();
        const defaultFile = new File([blob], "default-job-avatar.png", {
          type: blob.type,
        });
        data.append("images", defaultFile);
      } else {
        images.forEach((img) => data.append("images", img));
      }

      await axios.post(JOB_URL.BASE, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Job posted successfully!");
      navigate("/customer-jobs");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 font-display min-h-screen shadow-lg rounded-lg">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-primary transition"
        >
          <IoMdArrowBack size={22} />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
          Post a Job
        </h1>
        <div className="w-6" />
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Job Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Job Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Fix Leaky Faucet"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-secondary/20 border border-secondary/40 focus:ring-primary focus:border-primary text-zinc-900 dark:text-white"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Job Description
          </label>
          <textarea
            id="description"
            rows="4"
            placeholder="Describe the job in detail"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-secondary/20 border border-secondary/40 focus:ring-primary focus:border-primary text-zinc-900 dark:text-white"
          ></textarea>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-secondary/20 border border-secondary/40 focus:ring-primary focus:border-primary text-zinc-900 dark:text-white"
          >
            <option value="">Select Category</option>
            <option>Tailoring</option>
            <option>Fashion Design</option>
            <option>Embroidery</option>
            <option>Plumbering</option>
            <option>Electrical</option>
            <option>Mechanic</option>
            <option>Carpenter</option>
            <option>Chef</option>
          </select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label
            htmlFor="budget"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Budget (GHS)
          </label>
          <input
            id="budget"
            type="number"
            min="100"
            max="5000"
            placeholder="Enter budget e.g., 300"
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-secondary/20 border border-secondary/40 focus:ring-primary focus:border-primary text-zinc-900 dark:text-white"
          />
        </div>

        {/* Completion Date */}
        <div className="space-y-2">
          <label
            htmlFor="completionDate"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Preferred Completion Date
          </label>
          <input
            id="completionDate"
            type="date"
            min={today}
            value={formData.completionDate}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-secondary/20 border border-secondary/40 focus:ring-primary focus:border-primary text-zinc-900 dark:text-white"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label
            htmlFor="location"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="Enter Address"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-secondary/20 border border-secondary/40 focus:ring-primary focus:border-primary text-zinc-900 dark:text-white"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Upload Image
          </label>
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-90 border rounded-lg"
          />

          {/* ✅ Image Preview */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {(previewImages.length > 0 ? previewImages : [jobAvatar]).map(
              (src, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 aspect-square"
                >
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover rounded-md"
                    style={{ maxHeight: "80px", objectFit: "cover" }} // ✅ Smaller size
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Submit */}
        <footer className="p-0">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white shadow-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0099E6] hover:bg-[#0088cc]"
            }`}
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default CreateJob;
