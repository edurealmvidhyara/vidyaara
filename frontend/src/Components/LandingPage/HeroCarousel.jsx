import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const HeroCarousel = () => {
  const { user } = useSelector((store) => store.auth);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Don't render if user is not properly authenticated
  if (!user?.user || !user?.token) {
    return null;
  }

  const carouselData = [
    {
      id: 1,
      image: "/images/heroCoroursal/hero-1.png",
      title: "Share the gift of learning",
      subtitle:
        "Save 20% on a year of unlimited access to 26K+ top courses for you and a friend.",
      highlightText: "Terms apply.",
      cta: "Share now",
      link: "/",
    },
    {
      id: 2,
      image: "/images/heroCoroursal/hero-2.png",
      title: "Learn in-demand skills",
      subtitle: "Build expertise with courses from world-class instructors",
      cta: "Explore courses",
      link: "/",
    },
  ];

  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevious = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + carouselData.length) % carouselData.length
    );
  const goToNext = () =>
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);

  const fullName = user?.user?.fullName || "User";
  const avatarUrl = user?.user?.profilePicture || user?.user?.avatarUrl || null;
  const initials = (fullName || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full max-w-[1340px] mx-auto px-6 mb-12">
      {/* Welcome Section */}
      <div className="flex items-center gap-4 mb-6 py-4">
        <div className="flex items-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {initials}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Welcome back, {fullName}
          </h1>
          {/* <button
            className="text-purple-700 text-xs hover:underline"
            onClick={() => navigate("/profile")}
          >
            Add occupation and interests
          </button> */}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative w-full h-[400px] overflow-hidden rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {carouselData.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full flex items-center justify-between px-12 text-white"
            >
              {/* Slide Text */}
              <div className="flex-1 max-w-lg z-10">
                <h1 className="text-3xl font-bold mb-3 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm opacity-90 mb-6">
                  {slide.subtitle}{" "}
                  {slide.highlightText && (
                    <span className="text-purple-200 underline cursor-pointer">
                      {slide.highlightText}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => navigate(slide.link)}
                  className="bg-white text-gray-900 px-5 py-2 rounded font-bold text-sm hover:bg-gray-100 transition"
                >
                  {slide.cta}
                </button>
              </div>
              {/* Slide Image */}
              <div className="flex-1 flex justify-center items-center z-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition"
        >
          ‹
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition"
        >
          ›
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Learning Section */}
      <div className="mt-12 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            Let's start learning
          </h2>
          <button
            onClick={() => navigate("/my-learning")}
            className="text-purple-700 text-xs hover:underline"
          >
            My learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
