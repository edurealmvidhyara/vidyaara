import React, { useState } from "react";
import ItemsCarousel from "react-items-carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import CourseCard from "../ProdCard/CourseCard";

const Carousel = ({ data }) => {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const chevronWidth = 50;

  return (
    <div className="relative">
      <ItemsCarousel
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        numberOfCards={5}
        gutter={15}
        leftChevron={
          <div className="w-12 h-12 bg-black border border-gray-500 rounded-full flex justify-center items-center absolute top-[15%] -left-6 z-10 hover:shadow-lg cursor-pointer">
            <FontAwesomeIcon
              className="text-white text-[1.5rem]"
              icon={faAngleLeft}
            />
          </div>
        }
        rightChevron={
          <div className="w-12 h-12 bg-black border border-gray-500 rounded-full flex justify-center items-center absolute top-[15%] -right-6 z-10 hover:shadow-lg cursor-pointer">
            <FontAwesomeIcon
              className="text-white text-[1.5rem]"
              icon={faAngleRight}
            />
          </div>
        }
        outsideChevron={false}
        chevronWidth={chevronWidth}
      >
        {data.map((course) => (
          <CourseCard course={course} key={course.id} />
        ))}
      </ItemsCarousel>
    </div>
  );
};

export default Carousel;
