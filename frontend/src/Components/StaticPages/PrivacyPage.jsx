import React from "react";

const PrivacyPage = () => {
  return (
    <div className="bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Privacy policy
        </h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Information we collect
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              We collect information you provide (account details, course
              activity) and technical data (device, usage, cookies) to deliver
              and improve our services.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm">
              How we use data
            </h3>
            <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
              <li>Provide, personalize, and improve learning experiences.</li>
              <li>Process payments and prevent fraud.</li>
              <li>Communicate updates and relevant course recommendations.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm">Your choices</h3>
            <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
              <li>Access, update, or delete your account information.</li>
              <li>Manage email preferences and cookie settings.</li>
              <li>Request data export subject to verification.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm">Security</h3>
            <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
              <li>Encryption in transit and secure payment processors.</li>
              <li>Access controls and regular security reviews.</li>
              <li>Incident response and user notifications if required.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
