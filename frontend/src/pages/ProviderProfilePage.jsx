import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { logout } from "../features/auth/authSlice";
import BottomNav from "../components/BottomNav";
import { BASE_URL } from "../constants/apiConstants";
import { updateUserInfo } from "../features/auth/authSlice";
import { Loader2, Camera } from "lucide-react";
import {
  COUNTRY_DATA,
  formatPhone,
  cleanPhoneForBackend,
} from "../utils/phoneFormat";

const ProviderProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall, { isLoading }] = useLogoutMutation();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    country: "GH",
    phone: "",
    skills: "",
    city: "",
    locationCountry: "",
    profileImage: "",
    location: { type: "Point", coordinates: [] },
  });

  const [originalFormData, setOriginalFormData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Clean phone number for display - remove duplicate country codes
  const cleanPhoneForDisplay = (phone, countryCode = "GH") => {
    if (!phone) return "";
    
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Get country data
    const countryData = COUNTRY_DATA[countryCode];
    if (!countryData) return phone;
    
    const countryCallingCode = countryData.code.replace('+', '');
    
    // Check if the number already has the country code
    if (digitsOnly.startsWith(countryCallingCode)) {
      // Remove the country code for formatting
      const localNumber = digitsOnly.substring(countryCallingCode.length);
      return formatPhone(localNumber, countryCode);
    }
    
    // If it doesn't start with country code, format it as is
    return formatPhone(digitsOnly, countryCode);
  };

  // Clean phone number for backend - ensure proper format
  const cleanPhoneForSubmission = (phone, countryCode = "GH") => {
    if (!phone) return "";
    
    console.log("Cleaning phone for submission:", { phone, countryCode });
    
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Get country data
    const countryData = COUNTRY_DATA[countryCode];
    if (!countryData) return `+${digitsOnly}`;
    
    const countryCallingCode = countryData.code.replace('+', '');
    
    // Check if the number already has the country code
    if (digitsOnly.startsWith(countryCallingCode)) {
      // Already has country code
      return `+${digitsOnly}`;
    }
    
    // Add country code
    return `+${countryCallingCode}${digitsOnly}`;
  };

  // Initialize form data
  useEffect(() => {
    if (user) {
      
      // Get country code
      const countryCode = user.country || 
                         (user.location?.country ? 
                          Object.keys(COUNTRY_DATA).find(
                            code => COUNTRY_DATA[code].name === user.location.country
                          ) : "GH") || "GH";
    
      
      // Format skills
      let formattedSkills = "";
      if (user.skills) {
        if (Array.isArray(user.skills)) {
          formattedSkills = user.skills.join(", ");
        } else if (typeof user.skills === 'string') {
          if (user.skills.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(user.skills);
              if (Array.isArray(parsed)) {
                formattedSkills = parsed.join(", ");
              } else {
                formattedSkills = user.skills;
              }
            } catch {
              formattedSkills = user.skills;
            }
          } else {
            formattedSkills = user.skills;
          }
        }
      }
      
      // Clean phone for display
      const cleanedPhone = cleanPhoneForDisplay(user.phone || "", countryCode);
      
      const initialData = {
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        country: countryCode,
        phone: cleanedPhone,
        skills: formattedSkills,
        city: user.location?.city || "",
        locationCountry: user.location?.country || COUNTRY_DATA[countryCode]?.name || "",
        profileImage: user.profileImage || "",
        location: user.coordinates || { type: "Point", coordinates: [] },
      };
      
      setFormData(initialData);
      setOriginalFormData(initialData);
      setPreview(user.profileImage);
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "country") {
      const newCountry = value;
      // Reformat phone for new country
      const cleanedPhone = cleanPhoneForDisplay(formData.phone, newCountry);
      setFormData({
        ...formData,
        country: newCountry,
        phone: cleanedPhone,
      });
      return;
    }

    if (name === "phone") {
      // Allow user to type freely, we'll clean it on submission
      setFormData({
        ...formData,
        phone: value,
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle current location
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
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "";
          const country = data.address?.country || "";

          setFormData((prev) => ({
            ...prev,
            city,
            locationCountry: country,
            location: { type: "Point", coordinates: [longitude, latitude] },
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

  // Handle form submission
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
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const data = new FormData();

      // Clean phone before sending
      const cleanedPhone = cleanPhoneForSubmission(formData.phone, formData.country);
      console.log("Phone for submission:", cleanedPhone);

      // Add form data
      data.append("name", formData.name || "");
      data.append("email", formData.email || "");
      data.append("bio", formData.bio || "");
      data.append("country", formData.country || "GH");
      data.append("phone", cleanedPhone);
      data.append("skills", formData.skills || "");
      data.append("city", formData.city || "");
      data.append("locationCountry", formData.locationCountry || "");

      // Add coordinates if available
      if (formData.location && formData.location.coordinates && formData.location.coordinates.length === 2) {
        data.append("location[coordinates]", JSON.stringify(formData.location.coordinates));
      }

      // Add image if selected
      if (selectedImage) {
        data.append("profileImage", selectedImage);
      }

      console.log("Submitting form data:", {
        name: formData.name,
        phone: cleanedPhone,
        country: formData.country,
        skills: formData.skills
      });

      const res = await axios.put(`${BASE_URL}/users/profile`, data, config);

      console.log("Response received:", res.data);

      // Update Redux store
      dispatch(updateUserInfo(res.data.user));

      // Update form with new data
      const updatedUser = res.data.user;
      const updatedCountryCode = updatedUser.country || formData.country;
      
      // Clean the phone from response for display
      const cleanedResponsePhone = cleanPhoneForDisplay(updatedUser.phone || "", updatedCountryCode);

      const updatedFormData = {
        ...formData,
        ...updatedUser,
        phone: cleanedResponsePhone,
        country: updatedCountryCode,
        city: updatedUser.location?.city || "",
        locationCountry: updatedUser.location?.country || "",
      };

      console.log("Updated form data after save:", updatedFormData);

      setFormData(updatedFormData);
      setOriginalFormData(updatedFormData);
      
      if (updatedUser.profileImage) {
        setPreview(updatedUser.profileImage);
      }
      
      setSelectedImage(null);
      setMessage("✅ Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "⚠️ Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (originalFormData) {
      setFormData(originalFormData);
      if (originalFormData.profileImage) {
        setPreview(originalFormData.profileImage);
      }
    }
    setSelectedImage(null);
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      dispatch(logout());
      navigate("/auth-choice");
    }
  };

  // Helper to display skills
  const displaySkills = () => {
    if (!formData.skills) return "No skills specified";
    
    if (Array.isArray(formData.skills)) {
      return formData.skills.join(", ");
    }
    
    if (typeof formData.skills === 'string' && formData.skills.includes('[')) {
      try {
        const parsed = JSON.parse(formData.skills);
        if (Array.isArray(parsed)) {
          return parsed.join(", ");
        }
      } catch {
        // If parsing fails, return as-is
      }
    }
    
    return formData.skills;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex items-center justify-center p-6 font-sans">
      <div className="bg-white mb-6 shadow-lg rounded-2xl p-6 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Provider Profile
        </h2>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6 relative">
          <img
            src={preview || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-[#7b6cf6] shadow-md"
          />
          {isEditing && (
            <label className="absolute bottom-1 right-[38%] bg-[#7b6cf6] p-2 rounded-full cursor-pointer shadow-md hover:bg-[#6658e0] transition">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          )}
        </div>

        {!isEditing ? (
          <>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Name:</strong> {formData.name}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Phone:</strong> {formData.phone || "Not provided"}
              </p>
              <p>
                <strong>Skills:</strong> {displaySkills()}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {formData.city && formData.locationCountry
                  ? `${formData.city}, ${formData.locationCountry}`
                  : formData.city || formData.locationCountry || "N/A"}
              </p>
              <p>
                <strong>Bio:</strong> {formData.bio || "No bio available yet."}
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-5 bg-[#0099E6] hover:bg-[#0e7cb6] text-white py-2 rounded-lg font-semibold shadow-md transition"
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
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6] outline-none"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6] outline-none"
            />
            
            <div>
              <label className="block mb-1 font-medium">Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                placeholder="Electrician, Plumber, Carpenter"
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6] outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
            </div>

            <div>
              <label className="block mb-1 font-medium">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-white"
              >
                {Object.entries(COUNTRY_DATA).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.flag} {info.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                placeholder="+233 55 123 4567"
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6] outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current format: {formData.phone}
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                name="city"
                value={formData.city}
                placeholder="City"
                onChange={handleChange}
                className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6] outline-none"
              />
              <input
                type="text"
                name="locationCountry"
                value={formData.locationCountry}
                placeholder="Country"
                onChange={handleChange}
                className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={fetchingLocation}
              className={`w-full py-2 rounded-lg font-semibold text-white shadow-md transition ${
                fetchingLocation
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0099E6] hover:bg-[#0e7cb6]"
              }`}
            >
              {fetchingLocation
                ? "Fetching location..."
                : "📍 Use Current Location"}
            </button>

            <textarea
              name="bio"
              value={formData.bio}
              placeholder="Short Bio"
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6] outline-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-1/2 py-2 rounded-lg font-semibold shadow-md transition flex items-center justify-center gap-2 ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0099E6] hover:bg-[#6658e0] text-white"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold shadow-md transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {message && (
          <p className="text-center text-green-600 text-sm mt-3">{message}</p>
        )}
        {error && (
          <p className="text-center text-red-600 text-sm mt-3">{error}</p>
        )}

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

export default ProviderProfile;