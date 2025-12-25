import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../features/auth/authApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { BASE_URL } from "../constants/apiConstants";
import { Loader2, Camera, Eye, EyeOff } from "lucide-react";
import profile_avatar from "../../public/images/profile_avatar.png";
import { useSearchParams } from "react-router-dom";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const roleFromQuery = searchParams.get("role");
  const [userType, setUserType] = useState(roleFromQuery || "customer");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading, isError, error: apiError }] =
    useRegisterMutation();
  const { user } = useSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(
        user.userType === "provider" ? "/provider-home" : "/customer-home"
      );
    }
  }, [user, navigate]);

  useEffect(() => {
    if (roleFromQuery) setUserType(roleFromQuery);
  }, [roleFromQuery]);

  // Handle optional profile image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Use current location
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
        setCoordinates({ latitude, longitude });

        try {
          const res = await fetch(
            `${BASE_URL}/users/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          if (!res.ok) throw new Error("Failed to fetch location details");
          const data = await res.json();
          setCity(data.address?.city || data.address?.town || "");
          setCountry(data.address?.country || "");
          setMessage("📍 Current location set successfully!");
        } catch (err) {
          console.error(err);
          setError("⚠️ Failed to fetch location details.");
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        setError("⚠️ Unable to get current location.");
        setFetchingLocation(false);
      }
    );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // ✅ Try to automatically get coordinates if none set
      let latitude = coordinates.latitude;
      let longitude = coordinates.longitude;
      let autoFetched = false;

      if (!latitude || !longitude) {
        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                latitude = pos.coords.latitude;
                longitude = pos.coords.longitude;
                setCoordinates({ latitude, longitude });
                autoFetched = true;
                resolve();
              },
              () => resolve() // Ignore errors, just resolve
            );
          });
        }
      }

      const data = new FormData();
      data.append("name", name);
      data.append("email", email);
      data.append("password", password);
      data.append("userType", userType);
      data.append("bio", bio);
      data.append("skills", skills);
      data.append("phone", phone);

      // ✅ Build and attach location object
      const locationData = {
        city,
        country,
        type: "Point",
        coordinates: [longitude || 0, latitude || 0],
      };

      data.append("location", JSON.stringify(locationData));

      if (selectedImage) data.append("profileImage", selectedImage);

      const userData = await register(data).unwrap();
      dispatch(setCredentials(userData));

      // ✅ Optional message if auto-detected
      if (autoFetched) {
        setMessage("📍 Location auto-detected during signup!");
      }

      navigate(
        userData.userType === "provider" ? "/provider-home" : "/customer-home"
      );
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err?.data?.message || "⚠️ Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8] dark:bg-[#101c22] font-display text-[#111827] dark:text-[#e5e7eb] p-6">
      <header className="text-center mb-12">
        <h1 className="text-2xl font-bold">Sign Up</h1>
      </header>

      <form onSubmit={handleSignup} className="max-w-md mx-auto space-y-4">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-4 relative">
          <img
            src={preview || profile_avatar}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-[#7b6cf6] shadow-md"
          />
          <label className="absolute bottom-1 right-[38%] bg-[#7b6cf6] p-2 rounded-full cursor-pointer shadow-md hover:bg-[#6658e0] transition">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] placeholder-[#6b7280] dark:placeholder-[#9ca3af] p-4 focus:ring-2 focus:ring-[#1193d4]"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] placeholder-[#6b7280] dark:placeholder-[#9ca3af] p-4 focus:ring-2 focus:ring-[#1193d4]"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] placeholder-[#6b7280] dark:placeholder-[#9ca3af] p-4 focus:ring-2 focus:ring-[#1193d4]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] placeholder-[#6b7280] dark:placeholder-[#9ca3af] p-4 focus:ring-2 focus:ring-[#1193d4]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] p-4 focus:ring-2 focus:ring-[#1193d4]"
        />

        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] p-4 focus:ring-2 focus:ring-[#1193d4]"
        >
          <option value="customer">Customer</option>
          <option value="provider">Service Provider</option>
        </select>

        {/* ✅ Show only if provider */}
        {userType === "provider" && (
          <>
            <input
              type="text"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] p-4 focus:ring-2 focus:ring-[#1193d4]"
            />
            <input
              type="text"
              placeholder="Skills (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] p-4 focus:ring-2 focus:ring-[#1193d4]"
            />
          </>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6]"
          />
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-1/2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#7b6cf6]"
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

        {isError && (
          <p className="text-red-500 text-sm text-center">
            {apiError?.data?.message || "Registration failed"}
          </p>
        )}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && (
          <p className="text-green-600 text-sm text-center">{message}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1193d4] text-white font-bold py-3 rounded-lg hover:bg-[#0f82bd] transition-colors disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <a
          href="/auth-choice"
          className="text-sm text-[#6b7280] dark:text-[#9ca3af] hover:text-[#1193d4] dark:hover:text-[#1193d4] underline transition-colors"
        >
          Already have an account? Login
        </a>
      </div>
    </div>
  );
};

export default SignupPage;
