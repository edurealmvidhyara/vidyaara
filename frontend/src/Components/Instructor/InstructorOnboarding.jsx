import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Onboarding Steps (can be extended)
const QUESTIONS = [
  {
    id: "teaching_experience",
    step: 1,
    total: 3,
    title: "Share your knowledge",
    description:
      "Vidhyara courses are video-based experiences that give students the chance to learn actionable skills. Whether you have experience teaching, or it’s your first time, we’ll help you package your knowledge into an online course that improves student lives.",
    prompt: "What kind of teaching have you done before?",
    options: [
      { id: "informal", label: "In person, informally" },
      { id: "professional", label: "In person, professionally" },
      { id: "online", label: "Online" },
      { id: "other", label: "Other" },
    ],
    illustration: "/images/instructorOnboard/engaging-course-1.webp",
  },
  {
    id: "video_experience",
    step: 2,
    total: 3,
    title: "Create a course",
    description:
      "Over the years we’ve helped thousands of instructors learn how to record at home. No matter your experience level, you can become a video pro too. We’ll equip you with the latest resources, tips, and support to help you succeed.",
    prompt: "How much of a video “pro” are you?",
    options: [
      { id: "beginner", label: "I’m a beginner" },
      { id: "some", label: "I have some knowledge" },
      { id: "experienced", label: "I’m experienced" },
      { id: "ready", label: "I have videos ready to upload" },
    ],
    illustration: "/images/instructorOnboard/video-creation.webp",
  },
  {
    id: "audience",
    step: 3,
    total: 3,
    title: "Expand your reach",
    description:
      "Once you publish your course, you can grow your student audience and make an impact with the support of Vidhyara's marketplace promotions and also through your own marketing efforts. Together, we’ll help the right students discover your course.",
    prompt: "Do you have an audience to share your course with?",
    options: [
      { id: "none", label: "Not at the moment" },
      { id: "small", label: "I have a small following" },
      { id: "sizeable", label: "I have a sizeable following" },
    ],
    illustration: "/images/instructorOnboard/build-audience.webp",
  },
];

const Tile = ({ selected, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      textAlign: "left",
      background: selected ? "#f7f9fa" : "#fff",
      border: `2px solid ${selected ? "#5624d0" : "#d1d7dc"}`,
      borderRadius: 6,
      padding: "14px 16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 9999,
        border: `2px solid ${selected ? "#5624d0" : "#6a6f73"}`,
        display: "inline-block",
        position: "relative",
      }}
    >
      {selected ? (
        <span
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: "#5624d0",
          }}
        />
      ) : null}
    </span>
    <span style={{ fontWeight: 700, color: "#2d2f31" }}>{children}</span>
  </button>
);

const ProgressBar = ({ step, total }) => (
  <div style={{ borderBottom: "1px solid #e4e8eb", padding: "12px 0" }}>
    <div
      style={{
        color: "#5624d0",
        fontWeight: 700,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{`Step ${step} of ${total}`}</span>
      <Link to="/" style={{ color: "#5624d0", textDecoration: "none" }}>
        Exit
      </Link>
    </div>
    <div style={{ height: 4, background: "#e4e8eb", marginTop: 12 }}>
      <div
        style={{
          height: 4,
          width: `${(step / total) * 100}%`,
          background: "#5624d0",
          transition: "width 200ms ease",
        }}
      />
    </div>
  </div>
);

const InstructorOnboarding = () => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const q = QUESTIONS[index];
  const value = answers[q.id];

  const onSelect = (optId) => setAnswers((s) => ({ ...s, [q.id]: optId }));

  const goNext = async () => {
    if (!value) return;
    if (index < QUESTIONS.length - 1) {
      setIndex((i) => i + 1);
    } else {
      // Complete onboarding
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          "/api/users/onboard",
          { onboardingAnswers: answers },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        navigate("/instructor/courses");
      } catch (error) {
        console.error("Error completing onboarding:", error);
        // Still navigate even if there's an error
        navigate("/instructor/courses");
      }
    }
  };
  const goPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const primaryBtnStyle = (disabled) => ({
    height: 40,
    padding: "0 16px",
    backgroundColor: disabled ? "#d1d7dc" : "#5624d0",
    color: "#fff",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div style={{ maxWidth: 1120, margin: "24px auto", padding: "0 24px" }}>
      <ProgressBar step={q.step} total={q.total} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 420px",
          alignItems: "start",
          gap: 32,
          marginTop: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "SuisseWorks, Georgia, Times, serif",
              fontSize: 34,
              margin: 0,
            }}
          >
            {q.title}
          </h1>
          <p
            style={{
              color: "#2d2f31",
              maxWidth: 760,
              lineHeight: 1.5,
              marginTop: 12,
            }}
          >
            {q.description}
          </p>

          <h3 style={{ marginTop: 28, marginBottom: 12 }}>{q.prompt}</h3>
          <div style={{ display: "grid", gap: 12, maxWidth: 540 }}>
            {q.options.map((opt) => (
              <Tile
                key={opt.id}
                selected={value === opt.id}
                onClick={() => onSelect(opt.id)}
              >
                {opt.label}
              </Tile>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={q.illustration}
            alt="illustration"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </div>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#fff",
          borderTop: "1px solid #e4e8eb",
          marginTop: 24,
          padding: "12px 0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          className="login"
          style={{ height: 40, padding: "0 16px" }}
          onClick={goPrev}
        >
          Previous
        </button>
        <button
          style={primaryBtnStyle(!value)}
          disabled={!value}
          onClick={goNext}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default InstructorOnboarding;
