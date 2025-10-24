import React from "react";
import { Link } from "react-router-dom";
import LinkButton from "../../share/UIElements/LinkButton.jsx";

const FeaturedTopics = () => {
  const categories = [
    {
      title: "Development",
      topics: [
        { name: "Python", students: "33,679,324" },
        { name: "Web Development", students: "10,617,872" },
        { name: "Machine Learning", students: "6,635,995" },
      ],
    },
    {
      title: "Business",
      topics: [
        { name: "Financial Analysis", students: "1,142,265" },
        { name: "SQL", students: "5,299,930" },
        { name: "PMP", students: "1,580,869" },
      ],
    },
    {
      title: "IT and Software",
      topics: [
        { name: "AWS Certification", students: "5,262,105" },
        { name: "Ethical Hacking", students: "10,288,537" },
        { name: "Cyber Security", students: "3,714,347" },
      ],
    },
    {
      title: "Design",
      topics: [
        { name: "Photoshop", students: "10,467,011" },
        { name: "Graphic Design", students: "3,171,160" },
        { name: "Drawing", students: "2,341,110" },
      ],
    },
  ];

  return (
    <div className="bg-[#f7f9fa] text-[#1c1d1f] font-normal leading-[1.4] text-[1.6rem] mt-[6.4rem]">
      <div className="max-w-[134rem] mx-auto px-[2.4rem] py-[3.2rem]">
        <h2 className="text-[1.6rem] font-bold leading-[1.2] tracking-[-0.02rem] mb-[2.4rem]">
          Featured topics by category
        </h2>
        <div className="flex justify-between flex-wrap">
          {categories.map((category, index) => (
            <div
              key={index}
              className="w-[calc(100%/4-1.6rem)] pr-[0.8rem] mb-[1rem]"
            >
              <h2 className="text-[1.2rem] font-bold leading-[1.2] tracking-[-0.02rem] mb-[2.4rem]">
                {category.title}
              </h2>
              <div>
                {category.topics.map((topic, topicIndex) => (
                  <div
                    key={topicIndex}
                    className={topicIndex > 0 ? "mt-[1rem]" : ""}
                  >
                    <div>
                      <Link
                        to="/"
                        className="text-[1rem] font-bold underline text-[#5624d0] cursor-pointer"
                      >
                        {topic.name}
                      </Link>
                    </div>
                    <div className="text-[0.8rem] text-[#6a6f73] mt-[0.8rem]">
                      {topic.students} students
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <LinkButton color="white">Explore more topics</LinkButton>
        </div>
      </div>
    </div>
  );
};

export default FeaturedTopics;
