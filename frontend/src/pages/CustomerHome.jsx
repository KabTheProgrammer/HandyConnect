import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetTopProvidersQuery } from "../features/providers/providerApiSlice";
import BottomNav from "../components/BottomNav";
import FilterPanel from "../components/FilterPanel";
import { CiFilter } from "react-icons/ci";
import SkillCategoryList from "../components/SkillCategoryList";

import carpenter from "../../public/images/carpenter.png";
import cleaner from "../../public/images/cleaner.png";
import electrician from "../../public/images/electrician.png";
import painter from "../../public/images/painter.png";
import plumber from "../../public/images/plumber.png";

const skillCategories = [
  { name: "Electrician", image: electrician },
  { name: "Plumber", image: plumber },
  { name: "Carpenter", image: carpenter },
  { name: "Painter", image: painter },
  { name: "Cleaner", image: cleaner },
];

const CustomerHome = () => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ skill: "", maxDistance: 10000 });

  // Geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  const { data, isLoading, isError } = useGetTopProvidersQuery(
    coords
      ? {
          latitude: coords.latitude,
          longitude: coords.longitude,
          maxDistance: filters.maxDistance || 10000,
        }
      : {}
  );

  const providers = data?.providers || [];

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory
      ? p.skills?.includes(selectedCategory)
      : filters.skill
      ? p.skills?.includes(filters.skill)
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4 relative">
  {/* Centered title */}
  <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-800">
    Home
  </h1>

  {/* Right filter button */}
  <button
    onClick={() => setShowFilters(true)}
    className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
  >
    <CiFilter className="text-xl" />
  </button>
</div>


        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Find a provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-100 py-3 pl-4 pr-4 text-gray-800 placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pb-24">
        {/* Skill Categories */}
        <SkillCategoryList
          categories={skillCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Providers */}
        <section className="py-4">
          <h2 className="px-4 text-lg font-semibold text-gray-800">
            Top-Rated Providers Near You
          </h2>
          <div className="mt-4 space-y-3 px-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Loading providers...</p>
            ) : isError ? (
              <p className="text-center text-red-500">
                Failed to load providers.
              </p>
            ) : filteredProviders.length === 0 ? (
              <p className="text-center text-gray-500">No providers found.</p>
            ) : (
              filteredProviders.map((provider) => (
                <div
                  key={provider._id}
                  onClick={() => navigate(`/provider/${provider._id}`)}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md border border-gray-100 transition cursor-pointer"
                >
                  <div
                    className="h-20 w-20 flex-shrink-0 rounded-xl bg-cover bg-center"
                    style={{
                      backgroundImage: provider.profileImage
                        ? `url(${provider.profileImage})`
                        : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(
                            provider.name
                          )}&background=1193d4&color=fff')`,
                    }}
                  ></div>

                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span className="material-symbols-outlined text-base text-amber-500">
                        star
                      </span>
                      <span>
                        {provider.averageRating || 0} •{" "}
                        {provider.numReviews || 0} reviews
                      </span>
                    </div>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {provider.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {provider.skills?.join(", ") || "No skills listed"}
                    </p>
                    <button className="mt-2 self-start rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary text-[#1193d4] bg-[#d4effb] rounded hover:bg-primary/20 transition">
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          skills={skillCategories}
          onApply={(f) => setFilters(f)}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default CustomerHome;
