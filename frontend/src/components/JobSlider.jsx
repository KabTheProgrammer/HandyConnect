// src/components/JobSlider.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const JobSlider = ({ jobs = [], onView = () => {}, onViewAll = () => {} }) => {
  if (!jobs.length)
    return <p className="text-sm text-gray-500">No new opportunities right now.</p>;

  return (
    <div className="w-full">

      {/* 🔹 Swiper Slider */}
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1.1}
        spaceBetween={12}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        loop={true}
        speed={900}
        breakpoints={{
          640: { slidesPerView: 1.3 },
          768: { slidesPerView: 2 },
        }}
        allowTouchMove={true}
        preventClicks={false}
        preventClicksPropagation={false}
        simulateTouch={true}
        grabCursor={true}
      >
        {jobs.map((job) => (
          <SwiperSlide key={job._id} className="!h-auto">
            <div
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onView(job._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onView(job._id)}
            >
              {/* 🖼️ Image */}
              <div
                className="h-40 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    job.attachments?.[0] || job.images?.[0] || "/placeholder-job.jpg"
                  })`,
                }}
              />

              {/* 📝 Content */}
              <div className="p-3">
                <h4 className="font-semibold text-gray-900 line-clamp-2">
                  {job.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{job.location}</p>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">
                    ₵ {job.budget}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default JobSlider;
