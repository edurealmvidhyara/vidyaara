import React, { useState, useEffect } from "react";
import { courseService } from "../../services/courseService";
import CourseCard from "../ProdCard/CourseCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Carousel from "./Carousel";
import { Skeleton } from "@mui/material";

const Arrow = ({ direction, children }) => (
  <div
    className={`w-[4.8rem] h-[4.8rem] bg-black border border-[#6a6f73] rounded-full flex justify-center items-center absolute top-[15%] ${
      direction === "right" ? "right-[-1.6rem]" : "left-[-1.6rem]"
    } m-auto cursor-pointer z-[2] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.08)]`}
  >
    <FontAwesomeIcon icon={children} className="text-white text-[1.5rem]" />
  </div>
);

const CoursesSection = ({
  title,
  highlight,
  data,
  activeIndex,
  setActiveIndex,
  loading,
}) => {
  const chevronWidth = 50;

  if (loading) {
    return (
      <div className="mt-[4.8rem]">
        <h2 className="mb-[1.6rem] max-w-[80rem] font-bold text-[1.5rem] tracking-[0.02rem] leading-[1.2]">
          {title}{" "}
          {highlight && <span className="text-[#8710d8]">"{highlight}"</span>}
        </h2>
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={280}
              height={320}
              className="rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[4.8rem] hover:cursor-pointer">
      <h2 className="mb-[1.6rem] max-w-[80rem] font-bold text-[1.5rem] tracking-[0.02rem] leading-[1.2]">
        {title}{" "}
        {highlight && <span className="text-[#8710d8]">"{highlight}"</span>}
      </h2>
      <Carousel data={data} />
    </div>
  );
};

const StudentContainer = () => {
  const [activeItemIndex1, setActiveItemIndex1] = useState(0);
  const [activeItemIndex2, setActiveItemIndex2] = useState(0);
  const [studentsViewingCourses, setStudentsViewingCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        // Fetch different sets of courses for variety
        const [studentsViewing, recommended] = await Promise.all([
          courseService.getAllCourses({
            sort: "students",
            limit: 10,
          }),
          courseService.getAllCourses({
            sort: "rating",
            limit: 10,
          }),
        ]);

        if (studentsViewing.success && studentsViewing.data?.courses) {
          const transformedStudentsViewing = studentsViewing.data.courses;

          setStudentsViewingCourses(transformedStudentsViewing);
        }

        if (recommended.success && recommended.data?.courses) {
          // Transform API data for recommended courses
          const transformedRecommended = recommended.data.courses;
          setRecommendedCourses(transformedRecommended);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="mt-[6.4rem] px-[2.4rem]">
      <CoursesSection
        title="Students are viewing"
        data={studentsViewingCourses}
        activeIndex={activeItemIndex1}
        setActiveIndex={setActiveItemIndex1}
        loading={loading}
      />

      <CoursesSection
        title="Top rated courses in"
        highlight="Development"
        data={recommendedCourses}
        activeIndex={activeItemIndex2}
        setActiveIndex={setActiveItemIndex2}
        loading={loading}
      />
    </div>
  );
};

export default StudentContainer;
