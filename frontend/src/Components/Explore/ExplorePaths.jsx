import React from "react";
import { useNavigate } from "react-router-dom";

const paths = [
  {
    id: "full-stack",
    title: "Full-Stack Developer Path",
    description:
      "Master frontend, backend, databases, and deployment with a curated sequence.",
    query: "full stack developer",
  },
  {
    id: "data-science",
    title: "Data Science Path",
    description:
      "Learn Python, statistics, ML, and visualization step by step.",
    query: "data science",
  },
  {
    id: "mobile-dev",
    title: "Mobile Developer Path",
    description:
      "Build iOS/Android apps with React Native and native foundations.",
    query: "mobile development",
  },
];

const ExplorePaths = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Explore learning paths</h1>
      <p className="text-sm text-gray-600 mb-6">
        Pick a path to get a curated set of courses and start learning.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((p) => (
          <button
            key={p.id}
            className="text-left border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow duration-200 bg-white"
            onClick={() => navigate(`/search?q=${encodeURIComponent(p.query)}`)}
          >
            <div className="text-lg font-semibold mb-1">{p.title}</div>
            <div className="text-sm text-gray-600">{p.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExplorePaths;



