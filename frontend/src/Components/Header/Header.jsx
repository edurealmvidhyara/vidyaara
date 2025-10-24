import { Link, useLocation, useNavigate } from "react-router-dom";
import LanguageIcon from "@mui/icons-material/Language";
import SearchIcon from "@mui/icons-material/Search";
// import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
// import Badge from "@mui/material/Badge";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProfileDropdown from "./ProfileDropdown";
import { courseService } from "../../services/courseService";
import blackLogo from "../../assets/black-logo-cropped.svg";

export const Header = () => {
  const { user } = useSelector((store) => store.auth);
  // const { wishlist } = useSelector((store) => store.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Redirect from login page if already logged in
    if (token && user.user && window.location.pathname === "/login") {
      navigate("/");
    }
  }, [navigate, user.user]);

  const isInstructorPage = location.pathname.startsWith("/instructor");
  const isLoggedIn = !!user?.user;
  const isInstructor = user?.user?.role === "instructor";

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [splitSuggestions, setSplitSuggestions] = useState({
    related: [],
    courses: [],
  });
  const suggestionsCacheRef = useRef(new Map());
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  const onChangeQuery = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const q = value.trim();
      if (!q) {
        // Show last cached results if any
        const cached = suggestionsCacheRef.current.get("") || [];
        setSuggestions(cached);
        const related = cached.filter((d) => !!d.subtitle);
        const courses = cached.filter((d) => !d.subtitle);
        setSplitSuggestions({ related, courses });
        setOpen(cached.length > 0);
        return;
      }
      try {
        // serve from cache if present
        if (suggestionsCacheRef.current.has(q)) {
          const cachedData = suggestionsCacheRef.current.get(q);
          setSuggestions(cachedData);
          const related = cachedData.filter((d) => !!d.subtitle);
          const courses = cachedData.filter((d) => !d.subtitle);
          setSplitSuggestions({ related, courses });
          setOpen(cachedData.length > 0);
          return;
        }
        const res = await courseService.getSearchSuggestions(q, 8);
        const data = res?.data || [];
        setSuggestions(data);
        // naive split: items with subtitle are treated as related queries, others as direct courses
        const related = data.filter((d) => !!d.subtitle);
        const courses = data.filter((d) => !d.subtitle);
        setSplitSuggestions({ related, courses });
        suggestionsCacheRef.current.set(q, data);
        if (!suggestionsCacheRef.current.has("")) {
          suggestionsCacheRef.current.set("", data);
        }
        setOpen(true);
      } catch (err) {
        setSuggestions([]);
        setSplitSuggestions({ related: [], courses: [] });
        setOpen(false);
      }
    }, 400);
  };

  const onFocus = () => {
    if (suggestions.length > 0) setOpen(true);
  };

  const onBlur = () => {
    setTimeout(() => setOpen(false), 150);
  };

  const goToCourse = (id) => {
    navigate(`/course/${id}`);
    setOpen(false);
  };

  const goToSearchResults = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length === 0) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="max-w-full">
      <div className="flex items-center justify-between px-6 h-[72px] bg-white flex-nowrap">
        <div className="flex items-center gap-8 flex-1 min-w-0">
          <Link to="/" className="flex-shrink-0 text-purple-700 cursor-pointer">
            <img
              src={blackLogo}
              alt="Vidhyara"
              className="h-8"
            />
          </Link>

          {!isInstructorPage && (
            <form
              onSubmit={goToSearchResults}
              className="relative flex items-center w-[520px] max-w-full border border-gray-900 rounded-full px-3 bg-white h-10"
            >
              <button
                className="bg-transparent text-gray-900 border-none text-xs mr-2"
                type="button"
              >
                <SearchIcon />
              </button>
              <input
                type="text"
                placeholder="Search for anything"
                className="bg-transparent border-none w-full h-full text-sm focus:outline-none"
                value={query}
                onChange={onChangeQuery}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {open && (
                <div className="absolute left-0 top-10 w-full bg-white border border-gray-200 shadow-xl rounded-md z-50 p-3">
                  <div className="text-xs font-semibold text-gray-500 px-2 pb-2">
                    Search suggestions
                  </div>

                  {/* Related terms */}
                  {splitSuggestions.related.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[11px] uppercase tracking-wide text-gray-500 px-2 pb-1">
                        Related
                      </div>
                      <ul>
                        {splitSuggestions.related.map((s) => (
                          <li key={`r-${s.id}`}>
                            <button
                              className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded text-left"
                              onMouseDown={() =>
                                navigate(
                                  `/search?q=${encodeURIComponent(s.title)}`
                                )
                              }
                            >
                              <span className="text-gray-500">
                                <SearchIcon fontSize="small" />
                              </span>
                              <div className="flex-1">
                                <div className="text-sm text-gray-900 line-clamp-1">
                                  {s.title}
                                </div>
                                {s.subtitle && (
                                  <div className="text-xs text-gray-500 line-clamp-1">
                                    {s.subtitle}
                                  </div>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Direct courses */}
                  {splitSuggestions.courses.length > 0 && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-gray-500 px-2 pb-1">
                        Courses
                      </div>
                      <ul>
                        {splitSuggestions.courses.map((s) => (
                          <li key={`c-${s.id}`}>
                            <button
                              className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded text-left"
                              onMouseDown={() => goToCourse(s.id)}
                            >
                              <span className="text-gray-500">
                                <SearchIcon fontSize="small" />
                              </span>
                              <div className="flex-1">
                                <div className="text-sm text-gray-900 line-clamp-1">
                                  {s.title}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestions.length === 0 && (
                    <div className="px-2 py-2 text-sm text-gray-500">
                      No results
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Show Teach button only for instructors */}
          {isLoggedIn && isInstructor && !isInstructorPage && (
            <Link
              to="/instructor/courses"
              className="text-[13px] font-light text-gray-800 px-3 py-2 rounded hover:bg-purple-100 cursor-pointer"
            >
              Teach
            </Link>
          )}

          {/* Show Teach on Vidhyara for non-logged in users */}
          {!user?.user && (
            <Link
              to="/teach"
              className="text-[#1c1d1f] hover:text-[#5624d0] text-sm font-medium cursor-pointer"
            >
              Teach on Vidhyara
            </Link>
          )}

          {isLoggedIn && !isInstructorPage && (
            <Link
              to="/learning"
              className="text-[13px] font-light text-gray-800 px-3 py-2 rounded hover:bg-purple-100 cursor-pointer"
            >
              My learning
            </Link>
          )}

          {/* Wishlist icon commented out */}
          {/* {isLoggedIn && !isInstructorPage && (
            <Link to="/wishlist" className="cursor-pointer">
              <button className="bg-transparent border-none text-gray-500 p-2 rounded hover:bg-purple-100 cursor-pointer">
                <Badge color="secondary" badgeContent={wishlist?.length || 0}>
                  <FavoriteBorderOutlinedIcon />
                </Badge>
              </button>
            </Link>
          )} */}

          {isLoggedIn ? (
            <ProfileDropdown user={user.user} />
          ) : (
            <>
              <Link to="/login">
                <button className="px-4 py-2 border border-gray-900 font-semibold text-sm hover:bg-gray-100">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-4 py-2 border border-gray-900 bg-gray-900 text-white font-semibold text-sm">
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
