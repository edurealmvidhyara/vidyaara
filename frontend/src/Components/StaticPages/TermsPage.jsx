import React from "react";

const TermsPage = () => {
  return (
    <div className="bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Terms and conditions
        </h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Acceptance of terms
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              By accessing or using our platform, you agree to these Terms. You
              must maintain a valid account, respect intellectual property, and
              use the site for lawful purposes. We may update these Terms from
              time to time; continued use signifies acceptance of changes.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm">
              Accounts & access
            </h3>
            <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
              <li>Access to courses is free for registered users.</li>
              <li>Sharing credentials or content is prohibited.</li>
              <li>We may suspend accounts for policy or legal violations.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm">
              Content & instructors
            </h3>
            <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
              <li>Instructors retain ownership of their course materials.</li>
              <li>We license course access for personal learning only.</li>
              <li>We may update or retire content to maintain quality.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm">
              Enrollment & certification
            </h3>
            <ul className="list-disc ml-5 text-gray-700 text-sm space-y-2">
              <li>
                Enrollment in courses is free and available globally unless
                restricted by law.
              </li>
              <li>
                Completion badges or certificates may be issued for learning
                milestones.
              </li>
              <li>
                Certificates are informational and do not represent
                accreditation.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
