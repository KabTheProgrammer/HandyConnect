// ✅ Removed bio from formData and UI
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { logout, updateUserInfo } from "../features/auth/authSlice";
import BottomNav from "../components/BottomNav";
import { BASE_URL } from "../constants/apiConstants";
import { Loader2, Camera } from "lucide-react";

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall, { isLoading }] = useLogoutMutation();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: { city: "", country: "", coordinates: [] },
    profileImage: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: {
          city: user.location?.city || "",
          country: user.location?.country || "",
          coordinates: user.coordinates?.coordinates || [],
        },
        profileImage: user.profileImage || "",
      });
      setPreview(user.profileImage);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "city" || name === "country") {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("⚠️ Geolocation not supported by your browser.");
      return;
    }

    setFetchingLocation(true);
    setError("");
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `${BASE_URL}/users/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          if (!res.ok) throw new Error("Failed to fetch location details");
          const data = await res.json();
          const city =
            data.address?.city || data.address?.town || data.address?.village || "";
          const country = data.address?.country || "";

          setFormData((prev) => ({
            ...prev,
            location: {
              city,
              country,
              coordinates: [longitude, latitude],
            },
          }));
          setMessage("📍 Current location set successfully!");
        } catch (err) {
          console.error(err);
          setError("⚠️ Failed to fetch location details.");
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("⚠️ Unable to get current location.");
        setFetchingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    if (!user?.token) {
      setError("Unauthorized. Please log in again.");
      navigate("/auth-choice");
      setIsSaving(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);

      data.append(
        "location",
        JSON.stringify({ city: formData.location.city, country: formData.location.country })
      );
      data.append(
        "coordinates",
        JSON.stringify({ type: "Point", coordinates: formData.location.coordinates || [0, 0] })
      );

      if (selectedImage) data.append("profileImage", selectedImage);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await axios.put(`${BASE_URL}/users/profile`, data, config);

      dispatch(updateUserInfo(res.data.user));
      setMessage("✅ Profile updated successfully!");
      setFormData({
        name: res.data.user.name || "",
        email: res.data.user.email || "",
        phone: res.data.user.phone || "",
        location: {
          city: res.data.user.location?.city || "",
          country: res.data.user.location?.country || "",
          coordinates: res.data.user.coordinates?.coordinates || [],
        },
        profileImage: res.data.user.profileImage || "",
      });
      setPreview(res.data.user.profileImage);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "⚠️ Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch {
      console.error("Logout API failed");
    } finally {
      dispatch(logout());
      navigate("/auth-choice");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D8EEF9]/50 to-white flex items-center justify-center p-6 font-sans">
      <div className="bg-white mb-6 shadow-lg rounded-2xl p-6 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#0099E6] mb-6">
          Customer Profile
        </h2>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6 relative">
          <img
            src={preview || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-[#0099E6] shadow-md"
          />
          {isEditing && (
            <label className="absolute bottom-1 right-[38%] bg-[#0099E6] p-2 rounded-full cursor-pointer shadow-md hover:bg-[#0078b5] transition">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        {!isEditing ? (
          <>
            <div className="space-y-3 text-gray-700">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone || "N/A"}</p>
              <p><strong>Location:</strong> {formData.location.city && formData.location.country ? `${formData.location.city}, ${formData.location.country}` : "N/A"}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-5 bg-[#0099E6] hover:bg-[#0088cc] text-white py-2 rounded-lg font-semibold shadow-md transition"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0099E6] outline-none"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0099E6] outline-none"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              placeholder="Phone Number"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0099E6] outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                name="city"
                value={formData.location.city}
                placeholder="City"
                onChange={handleChange}
                className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0099E6] outline-none"
              />
              <input
                type="text"
                name="country"
                value={formData.location.country}
                placeholder="Country"
                onChange={handleChange}
                className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0099E6] outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={fetchingLocation}
              className={`w-full py-2 rounded-lg font-semibold text-white shadow-md transition ${
                fetchingLocation ? "bg-gray-400 cursor-not-allowed" : "bg-[#0099E6] hover:bg-[#0088cc]"
              }`}
            >
              {fetchingLocation ? "Fetching location..." : "📍 Use Current Location"}
            </button>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-1/2 py-2 rounded-lg font-semibold shadow-md transition flex items-center justify-center gap-2 ${
                  isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-[#0099E6] hover:bg-[#0088cc] text-white"
                }`}
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold shadow-md transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {message && <p className="text-center text-green-600 text-sm mt-3">{message}</p>}
        {error && <p className="text-center text-red-600 text-sm mt-3">{error}</p>}

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full mt-6 py-2 rounded-lg font-semibold text-red-600 bg-red-100 hover:bg-red-200 transition"
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default CustomerProfile;
