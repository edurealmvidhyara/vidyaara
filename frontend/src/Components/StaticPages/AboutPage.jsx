import React from "react";

const AboutPage = () => {
  return (
    <div className="bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About us</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Our mission</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              Our mission is to make high‑quality education accessible to
              anyone, anywhere. We partner with experienced instructors and
              industry experts to deliver practical, up‑to‑date courses that
              help learners build real skills for real careers.
            </p>
          </section>

          <section className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">
                Learn by doing
              </h3>
              <p className="text-gray-700 text-sm">
                Hands‑on projects, quizzes, and real‑world assignments for
                deeper retention.
              </p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">
                Expert instructors
              </h3>
              <p className="text-gray-700 text-sm">
                Courses created by practitioners from top companies and
                universities.
              </p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">
                Flexible learning
              </h3>
              <p className="text-gray-700 text-sm">
                Self‑paced lessons with lifetime access across web and mobile.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              What we offer
            </h2>
            <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
              <li>
                Career paths in development, data, design, product, and business
              </li>
              <li>
                Guided projects and capstones to showcase in your portfolio
              </li>
              <li>Certificates of completion to validate your progress</li>
              <li>Community Q&A and instructor feedback on key modules</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Our impact</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">250k+</div>
                <div className="text-xs text-gray-600">Learners enrolled</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">2,000+</div>
                <div className="text-xs text-gray-600">Hours of content</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">4.7/5</div>
                <div className="text-xs text-gray-600">Average rating</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
