import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export default function PublicProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE_URL}/users/${id}`)
      .then(({ data }) => {
        const u = data?.data?.user || data?.user || null;
        setUser(u);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [id]);

  const fullName = useMemo(() => {
    if (!user) return "";
    const first = user?.name?.first || "";
    const last = user?.name?.last || "";
    return `${first} ${last}`.trim();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#5624d0] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!user) return null;

  const avatar = user.profilePicture || user.avatarUrl;
  const headline =
    user?.userProfile?.headline || user?.instructorProfile?.headline || "";
  const biography = user?.userProfile?.biography?.content || user?.bio || "";
  const language =
    user?.userProfile?.language ||
    user?.preferences?.language ||
    "English (US)";
  const isInstructor = user.role === "instructor";
  const isVerified = !!user?.instructorProfile?.isVerified;
  const totalCourses = user?.instructorProfile?.totalCourses ?? 0;
  const totalStudents = user?.instructorProfile?.totalStudents ?? 0;
  const enrolledCount = (user?.enrolledCourses || []).length;
  const wishlistCount = (user?.wishlist || []).length;
  const categories = user?.enrolledCategories || [];
  const privacy = user?.privacySettings || {};

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-gray-900">
      {/* Header card */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center text-white text-2xl font-bold">
            {avatar ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img
                src={avatar}
                alt="Profile picture"
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.name?.first?.[0] || "U").toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] bg-gray-900 text-white">
                {user.role}
              </span>
              {isInstructor && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] bg-purple-600 text-white">
                  Instructor
                </span>
              )}
              {isVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] bg-green-600 text-white">
                  Verified
                </span>
              )}
            </div>
            {headline && (
              <p className="text-sm text-gray-700 mb-3">{headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-gray-700">
              <span className="px-2 py-1 rounded bg-white border border-gray-200">
                Language: {language}
              </span>
              <span className="px-2 py-1 rounded bg-white border border-gray-200">
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <span className="px-2 py-1 rounded bg-white border border-gray-200">
                Last login:{" "}
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
          <Link
            to="/profile/edit"
            className="ml-auto bg-[#5624d0] text-white px-4 py-2 rounded text-[12px] font-bold hover:bg-[#401b9c]"
          >
            Edit profile
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* About */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3">About</h2>
          {biography ? (
            <p className="text-[13px] leading-6 whitespace-pre-wrap">
              {biography}
            </p>
          ) : (
            <p className="text-[12px] text-gray-500">No biography provided.</p>
          )}
        </div>

        {/* Quick stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Highlights</h3>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="rounded border border-gray-200 p-3">
              <div className="text-gray-500">Enrolled courses</div>
              <div className="text-xl font-bold">{enrolledCount}</div>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <div className="text-gray-500">Wishlist</div>
              <div className="text-xl font-bold">{wishlistCount}</div>
            </div>
            {isInstructor && (
              <>
                <div className="rounded border border-gray-200 p-3">
                  <div className="text-gray-500">Total courses</div>
                  <div className="text-xl font-bold">{totalCourses}</div>
                </div>
                <div className="rounded border border-gray-200 p-3">
                  <div className="text-gray-500">Total students</div>
                  <div className="text-xl font-bold">{totalStudents}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Social links, Categories, Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-3">Links</h3>
          <div className="flex flex-wrap gap-3 text-[12px]">
            {Object.entries(user?.socialLinks || {})
              .filter(([, v]) => !!v)
              .map(([k, v]) => (
                <a
                  key={k}
                  href={v}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  <span className="capitalize">{k}</span>
                </a>
              ))}
            {(!user?.socialLinks ||
              Object.values(user?.socialLinks || {}).filter(Boolean).length ===
                0) && <span className="text-gray-500">No links added.</span>}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-3">Top categories</h3>
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="px-2 py-1 text-[12px] rounded bg-gray-100 border border-gray-200"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-500">No categories yet.</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-3">Privacy</h3>
          <ul className="space-y-2 text-[12px]">
            <li className="flex items-center justify-between">
              <span>Visible to logged-in users</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  privacy.showProfileToLoggedIn
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {privacy.showProfileToLoggedIn ? "Yes" : "No"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Show courses on profile</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  privacy.showCoursesOnProfile
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {privacy.showCoursesOnProfile ? "Yes" : "No"}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
