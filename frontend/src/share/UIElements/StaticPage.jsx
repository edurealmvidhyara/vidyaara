import React from "react";

const StaticPage = ({ title, content }) => {
  return (
    <div className="bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-gray-700 leading-relaxed text-sm">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;



