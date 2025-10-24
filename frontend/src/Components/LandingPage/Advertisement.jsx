import LinkButton from "../../share/UIElements/LinkButton.jsx";

const Advertisement = () => {
  return (
    <>
      {/* First Advertisement Section - Become an instructor */}
      <div className="m-0 mt-16 font-normal leading-relaxed text-2xl text-gray-900">
        <div className="py-16 w-full max-w-[134rem] mx-auto">
          <div className="flex items-center justify-center h-80">
            <div className="flex p-0">
              <img
                src="/images/advertisement/instructor-2x-v3.jpeg"
                alt="Instructor"
                className="block w-[400px] h-[400px] object-contain max-w-full mr-24"
              />
              <div className="flex flex-col justify-center text-left max-w-[40rem]">
                <h3 className="font-['var(--suisse-works-alternative)'] font-bold text-[1.6rem] leading-tight tracking-tight mb-2">
                  Become an instructor
                </h3>
                <p className="text-[1rem] mt-0 mb-6 font-normal leading-relaxed">
                  Instructors from around the world teach millions of students
                  on Vidhyara. We provide the tools and skills to teach what you
                  love.
                </p>
                <div>
                  <LinkButton>Start teaching today</LinkButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Logo Section */}
      {/* <div className="mt-16 font-normal leading-relaxed text-2xl text-gray-900">
        <section className="bg-gray-50 border-0 py-8 mt-12">
          <div className="flex flex-col justify-center items-center mb-[-1.6rem]">
            <h3 className="font-['var(--suisse-works-alternative)'] font-bold text-2xl leading-tight tracking-tight m-0 mb-2">
              Trusted by companies of all sizes
            </h3>
            <Link
              to="/"
              className="flex flex-wrap justify-evenly items-center cursor-pointer"
            >
              <div className="m-4 inline-flex items-center">
                <img
                  src="/images/advertisement/nasdaq-dark.svg"
                  alt="Nasdaq"
                  style={{ width: 115, height: 44 }}
                  className="w-full h-auto"
                />
              </div>
              <div className="m-4 inline-flex items-center">
                <img
                  src="/images/advertisement/volkswagen-dark.svg"
                  alt="Volkswagen"
                  style={{ width: 44, height: 44 }}
                  className="w-full h-auto"
                />
              </div>
              <div className="m-4 inline-flex items-center">
                <img
                  src="/images/advertisement/box-dark.svg"
                  alt="Box"
                  style={{ width: 67, height: 44 }}
                  className="w-full h-auto"
                />
              </div>
              <div className="m-4 inline-flex items-center">
                <img
                  src="/images/advertisement/netapp-dark.svg"
                  alt="NetApp"
                  style={{ width: 115, height: 44 }}
                  className="w-full h-auto"
                />
              </div>
              <div className="m-4 inline-flex items-center">
                <img
                  src="/images/advertisement/eventbrite-dark.svg"
                  alt="Eventbrite"
                  style={{ width: 115, height: 44 }}
                  className="w-full h-auto"
                />
              </div>
            </Link>
          </div>
        </section>
      </div> */}

      {/* Second Advertisement Section - Vidhyara Business */}
      <div className="m-0 mt-16 font-normal leading-relaxed text-2xl text-gray-900">
        <div className="py-16 w-full max-w-[134rem] mx-auto">
          <div className="flex items-center justify-center h-80">
            <div className="flex p-0">
              <div className="flex flex-col justify-center text-left max-w-[40rem] mr-24">
                <img
                  src="/images/advertisement/logo-ub.svg"
                  alt="Vidhyara Business Logo"
                  className="mb-2 w-[282px] h-12"
                />
                <p className="text-[1rem] mt-0 mb-6 font-normal leading-relaxed">
                  Get unlimited access to 6,000+ of Vidhyara's top courses for
                  your team. Learn and improve skills across business, tech,
                  design, and more.
                </p>
                <div>
                  <LinkButton>Get Vidhyara business</LinkButton>
                </div>
              </div>
              <img
                src="/images/advertisement/ub-2x-v3.jpeg"
                alt="Vidhyara Business"
                className="block w-[400px] h-[400px] object-contain max-w-full m-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Third Advertisement Section - Transform your life */}
      <div className="my-16 mb-24 font-normal leading-relaxed text-2xl text-gray-900">
        <div className="py-16 w-full max-w-[134rem] mx-auto">
          <div className="flex items-center justify-center h-80">
            <div className="flex p-0">
              <img
                src="/images/advertisement/transform-2x-v3.jpeg"
                alt="Transform Education"
                className="block w-[400px] h-[400px] object-contain max-w-full mr-24"
              />
              <div className="flex flex-col justify-center text-left max-w-[40rem]">
                <h3 className="font-['var(--suisse-works-alternative)'] font-bold text-[1.6rem] leading-tight tracking-tight mb-2">
                  Transform your life through education
                </h3>
                <p className="text-[1rem] mt-0 mb-6 font-normal leading-relaxed">
                  Learners around the world are launching new careers, advancing
                  in their fields, and enriching their lives.
                </p>
                <div>
                  <LinkButton>Find out how</LinkButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Advertisement;
