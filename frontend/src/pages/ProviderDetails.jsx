// src/pages/ProviderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ===========================
   📍 Map Component
=========================== */
const ProviderMap = ({ provider }) => {
  const coords = provider?.coordinates?.coordinates;
  const hasCoords = Array.isArray(coords) && coords.length === 2;
  const city = provider?.location?.city;
  const country = provider?.location?.country;

  // 🧭 Build the right map URL
  let mapSrc = "";

  if (hasCoords && coords[0] !== 0 && coords[1] !== 0) {
    // GeoJSON is [lon, lat], Google needs (lat,lon)
    const [lon, lat] = coords;
    mapSrc = `https://www.google.com/maps?q=${lat},${lon}&z=14&output=embed`;
  } else if (city || country) {
    // Use place search if coordinates missing
    const query = encodeURIComponent(`${city || ""} ${country || ""}`);
    mapSrc = `https://www.google.com/maps?q=${query}&z=12&output=embed`;
  } else {
    return <p className="text-slate-500 italic">No location available</p>;
  }

  return (
    <iframe
      title="Provider Location"
      src={mapSrc}
      width="100%"
      height="220"
      className="rounded-xl mt-2"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
    ></iframe>
  );
};

/* ===========================
   👤 Provider Details Page
=========================== */
const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);

  useEffect(() => {
    const fetchProvider = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${apiBase}/users/${id}`;
        const res = await axios.get(url, {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        });

        const providerData = res.data.provider || res.data;
        setProvider(providerData);

        // Calculate distance (if both have coordinates)
        const userCoords = user?.coordinates?.coordinates;
        const providerCoords = providerData?.coordinates?.coordinates;

        if (
          Array.isArray(userCoords) &&
          userCoords.length === 2 &&
          Array.isArray(providerCoords) &&
          providerCoords.length === 2
        ) {
          const km = haversineDistance(
            userCoords[1],
            userCoords[0],
            providerCoords[1],
            providerCoords[0]
          );
          setDistanceKm(km.toFixed(2));
        } else {
          setDistanceKm(null);
        }
      } catch (err) {
        console.error("Failed to fetch provider:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load provider"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id, user]);

  // 🔹 Helper functions
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.charAt(0)?.toUpperCase() || "";
    const last =
      parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";
    return (first + last).slice(0, 2);
  };

  const displayRating = (p) => {
    const avg = p?.averageRating ?? p?.rating ?? 0;
    const count =
      p?.numReviews ?? p?.reviewCount ?? (p?.reviews ? p.reviews.length : 0);
    return { avg, count };
  };

  const renderStars = (avg) => {
    const full = Math.round(avg);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="material-symbols-outlined text-base"
            style={{
              color: i < full ? "#1193d4" : "#cbd5e1",
              fontVariationSettings: `'FILL' ${i < full ? 1 : 0}`,
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const handleBookProvider = () => {
    if (!user) {
      navigate("/auth-choice");
      return;
    }
    navigate(`/chat/${provider?._id}`, { state: { provider } });
  };

 const handleChatWithProvider = async () => {
  if (!user) {
    navigate("/auth-choice");
    return;
  }

  try {
    const res = await axios.post(
      `${apiBase}/chat/provider/${provider._id}`,
      {},
      {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      }
    );

    const chat = res.data;

    if (!chat?._id) {
      alert("Chat not found. Try again.");
      return;
    }

    navigate(`/chat/${chat._id}`, { state: { chat, provider } });
  } catch (err) {
    console.error("Failed to start chat:", err);
    alert(
      err.response?.data?.message ||
        "Failed to start chat. Try again later."
    );
  }
};



  /* ===========================
     🧱 UI Layout
  =========================== */
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <svg
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-center flex-1 pr-8">
            Provider Details
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow pb-28">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : provider ? (
          <>
            {/* Profile Header */}
            <div className="p-4 flex flex-col items-center text-center">
              <div
                className="w-28 h-28 rounded-full bg-cover bg-center mb-4 flex items-center justify-center overflow-hidden"
                style={
                  provider.profileImage
                    ? { backgroundImage: `url("${provider.profileImage}")` }
                    : undefined
                }
              >
                {!provider.profileImage && (
                  <div className="w-full h-full flex items-center justify-center rounded-full bg-primary text-white text-3xl font-bold">
                    {getInitials(provider.name)}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold">{provider.name}</h2>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-1">
                {renderStars(displayRating(provider).avg)}
                <span>
                  {displayRating(provider).avg.toFixed(1)} (
                  {displayRating(provider).count} reviews)
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                {provider.skills?.join(", ") || "No skills listed"}
                {distanceKm && ` • ${distanceKm} km away`}
              </p>
            </div>

            {/* Bio Section */}
            <div className="px-4 pb-4">
              <h3 className="text-lg font-bold mb-2">Bio</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {provider.bio ||
                  "This provider hasn’t added a bio yet. You can chat to learn more."}
              </p>
            </div>

            {/* Location Section */}
            <div className="px-4 pb-4">
              <h3 className="text-lg font-bold mb-2">Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {provider.useCurrentLocation
                  ? "Using current live location"
                  : provider.location?.city || provider.location?.country
                  ? `${provider.location.city || ""}, ${
                      provider.location.country || ""
                    }`
                  : "No location data available"}
              </p>
              <ProviderMap provider={provider} />
            </div>

            {/* Book Button */}
            <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
              <div className="max-w-md mx-auto flex items-center justify-between gap-3">
                <button
                  onClick={handleChatWithProvider}
                  
                  className="flex-1 py-3 rounded-full bg-[#D8EEF9] text-[#0073CF] font-semibold shadow-sm hover:bg-[#c7e4f6] transition"
                >
                  Chat with Provider
                </button>

                <button
                  // onClick={handleBookProvider}
                  className="flex-1 py-3 rounded-full bg-[#0099E6] text-white font-semibold shadow-md hover:bg-[#0088cc] transition"
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="px-4 pt-4 pb-20">
              <h3 className="text-lg font-bold mb-3">Customer Reviews</h3>
              {provider.reviews?.length ? (
                provider.reviews.map((r) => (
                  <div
                    key={r._id}
                    className="p-3 mb-3 rounded-lg bg-slate-100 dark:bg-slate-800"
                  >
                    <p className="font-semibold">
                      {r.customer?.name || "Customer"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No reviews yet.</p>
              )}
            </div>
          </>
        ) : (
          <div className="p-4">Provider not found</div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ProviderDetails;
