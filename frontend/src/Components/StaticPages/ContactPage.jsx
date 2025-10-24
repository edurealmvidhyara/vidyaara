import React from "react";

const ContactPage = () => {
  return (
    <div className="bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact us</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              We’re here to help
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              Our team supports learners, instructors, and organizations
              worldwide. Send us a message and we’ll respond within 1–2 business
              days.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">
                Learner support
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Account, payments, and course access
              </p>
              <p className="text-sm text-gray-800">support@example.edu</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">
                Instructor relations
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Publish a course or join our faculty
              </p>
              <p className="text-sm text-gray-800">teach@example.edu</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">
                Business
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Team training and partnerships
              </p>
              <p className="text-sm text-gray-800">business@example.edu</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">Press</h3>
              <p className="text-gray-700 text-sm mb-2">
                Media and speaking requests
              </p>
              <p className="text-sm text-gray-800">press@example.edu</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Office</h2>
            <p className="text-gray-700 text-sm">
              123 Learning Ave, Suite 300, San Francisco, CA
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
