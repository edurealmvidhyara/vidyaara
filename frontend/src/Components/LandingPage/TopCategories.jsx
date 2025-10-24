import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";

const TopCategories = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await courseService.getHomeCategories();
        const list = res?.data || res || [];
        setCategories(list);
      } catch (e) {
        setCategories([]);
      }
    };
    load();
  }, []);

  const onClickCategory = (title) => {
    navigate(`/search?category=${encodeURIComponent(title)}`);
  };

  return (
    <div className="text-custom-black font-normal leading-[1.4] text-base mt-[3.2rem]">
      <section className="max-w-[134rem] mx-auto px-[2.4rem]">
        <h2 className="text-xl font-bold leading-[1.4] tracking-[0.02rem] mb-[3rem]">
          Top categories
        </h2>
        <div className="flex flex-wrap -mx-[1rem] justify-center -mb-[3.2rem]">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => onClickCategory(category.title)}
              className="block mx-[1rem] mb-[1.6rem] max-w-[calc(100%/5-1rem)] cursor-pointer text-left"
            >
              <div className="overflow-hidden ">
                <img
                  src={category.image || `/images/top-categories/lohp-category-${(category.slug || category.title || "").toLowerCase().replace(/\s+/g, "-")}-2x-v2.jpeg`}
                  className="bg-custom-bg block object-contain transition-transform duration-100 ease-[cubic-bezier(0.2,0,1,0.9)] max-w-full h-auto hover:scale-108"
                  alt={category.title}
                />
              </div>
              <div className="pt-[0.8rem] pb-[1.6rem]">
                <span className="font-bold leading-[1.2] text-base tracking-[-0.02rem]">
                  {category.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TopCategories;
