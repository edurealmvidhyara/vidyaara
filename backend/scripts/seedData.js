const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const Instructor = require("../models/instructor.model");
const connect = require("../config/db");

// Sample course data based on mockdata structure
const coursesData = [
  {
    title: "The Complete JavaScript Course 2024: From Zero to Expert!",
    subtitle:
      "The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory. Many courses in one!",
    description:
      "JavaScript is the most popular programming language in the world. It powers the entire modern web. It provides millions of high-paying jobs. This course teaches you JavaScript from scratch to an advanced level.",
    headline: "Master modern JavaScript from the very beginning",
    category: "Development",
    subcategory: "Web Development",
    topic: "JavaScript",
    language: "English",
    level: "Beginner",
    thumbnailUrl: "https://img-c.udemycdn.com/course/750x422/851712_fc61_6.jpg",
    price: 0,
    originalPrice: 84.99,
    rating: 4.7,
    totalRatings: 178420,
    totalStudents: 742315,
    lastUpdated: new Date("2024-01-15"),
    duration: 69,
    totalLectures: 319,
    status: "published",
    isActive: true,
    requirements: [
      "No coding experience is necessary to take this course!",
      "Any computer and OS will work — Windows, macOS or Linux",
      "A basic understanding of HTML and CSS is a plus, but not a must!",
    ],
    learningObjectives: [
      "Become an advanced, confident, and modern JavaScript developer from scratch",
      "Build 6 beautiful real-world projects for your portfolio",
      "Become job-ready by understanding how JavaScript really works behind the scenes",
      "How to think and work like a developer: problem-solving, researching, workflows",
    ],
  },
  {
    title: "React - The Complete Guide 2024 (incl. React Router & Redux)",
    subtitle:
      "Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Routing, Animations, Next.js and way more!",
    description:
      "React.js is THE most popular JavaScript library you can use and learn these days to build modern, reactive user interfaces for the web.",
    headline: "Build powerful, fast, user-friendly and reactive web apps",
    category: "Development",
    subcategory: "Web Development",
    topic: "React",
    language: "English",
    level: "Beginner",
    thumbnailUrl:
      "https://img-c.udemycdn.com/course/750x422/1362070_b9a1_2.jpg",
    price: 0,
    originalPrice: 94.99,
    rating: 4.6,
    totalRatings: 192847,
    totalStudents: 856432,
    lastUpdated: new Date("2024-02-10"),
    duration: 48,
    totalLectures: 487,
    status: "published",
    isActive: true,
    requirements: [
      "JavaScript + HTML + CSS fundamentals are absolutely required",
      "ES6+ JavaScript knowledge is beneficial but not a must-have",
      "NO prior React or any other JS framework experience is required!",
    ],
    learningObjectives: [
      "Build powerful, fast, user-friendly and reactive web apps",
      "Provide amazing user experiences by leveraging the power of JavaScript with ease",
      "Apply for high-paid jobs or work as a freelancer in one the most-demanded sectors you can find in web dev right now",
      "Learn all about React Hooks and React Components",
    ],
  },
  {
    title: "Python for Data Science and Machine Learning Bootcamp",
    subtitle:
      "Learn how to use NumPy, Pandas, Seaborn , Matplotlib , Plotly , Scikit-Learn , Machine Learning, Tensorflow , and more!",
    description:
      "Are you ready to start your path to becoming a Data Scientist! This comprehensive course will be your guide to learning how to use the power of Python to analyze data, create beautiful visualizations, and use powerful machine learning algorithms!",
    headline: "Learn to use Python for Data Science and Machine Learning",
    category: "Development",
    subcategory: "Data Science",
    topic: "Python",
    language: "English",
    level: "Intermediate",
    thumbnailUrl: "https://img-c.udemycdn.com/course/750x422/903744_8eb2.jpg",
    price: 0,
    originalPrice: 199.99,
    rating: 4.5,
    totalRatings: 156789,
    totalStudents: 634521,
    lastUpdated: new Date("2024-01-20"),
    duration: 25,
    totalLectures: 165,
    status: "published",
    isActive: true,
    requirements: [
      "Basic understanding of programming (any language) or mathematics",
      "Just some high school mathematics level",
      "Access to a computer with an internet connection",
    ],
    learningObjectives: [
      "Use Python for Data Science and Machine Learning",
      "Use Spark for Big Data Analysis",
      "Implement Machine Learning Algorithms",
      "Learn to use NumPy for Numerical Data",
    ],
  },
  {
    title: "The Web Developer Bootcamp 2024",
    subtitle:
      "10 Hours of React just added. Become a Developer With ONE course - HTML, CSS, JavaScript, React, Node, MongoDB and More!",
    description:
      "Hi! Welcome to the Web Developer Bootcamp, the only course you need to learn web development. There are a lot of options for online developer training, but this course is without a doubt the most comprehensive and effective on the market.",
    headline: "Learn Web Development by building 25+ projects",
    category: "Development",
    subcategory: "Web Development",
    topic: "Full Stack",
    language: "English",
    level: "Beginner",
    thumbnailUrl: "https://img-c.udemycdn.com/course/750x422/625204_436a_3.jpg",
    price: 0,
    originalPrice: 89.99,
    rating: 4.7,
    totalRatings: 267543,
    totalStudents: 891234,
    lastUpdated: new Date("2024-03-01"),
    duration: 74,
    totalLectures: 612,
    status: "published",
    isActive: true,
    requirements: [
      "No programming experience needed - I'll teach you everything you need to know",
      "A computer with access to the internet",
      "No paid software required - I'll teach you how to use free text editors",
    ],
    learningObjectives: [
      "Make REAL web applications using cutting-edge technologies",
      "Continue to learn and grow as a developer, long after the course ends",
      "Create a blog application from scratch using Express, MongoDB, and Semantic UI",
      "Create a complicated yelp-like application from scratch",
    ],
  },
  {
    title: "AWS Certified Solutions Architect - Associate 2024",
    subtitle:
      "Pass the AWS Certified Solutions Architect Associate Certification SAA-C03! Complete Amazon Web Services Cloud training",
    description:
      "Welcome to the most comprehensive and up-to-date AWS Certified Solutions Architect Associate course on Udemy! This course is designed to take you from zero AWS knowledge to passing the AWS Certified Solutions Architect Associate certification.",
    headline: "Pass the AWS SAA-C03 Exam with confidence",
    category: "IT & Software",
    subcategory: "Cloud Computing",
    topic: "Amazon AWS",
    language: "English",
    level: "Intermediate",
    thumbnailUrl:
      "https://img-c.udemycdn.com/course/750x422/362070_d819_10.jpg",
    price: 0,
    originalPrice: 149.99,
    rating: 4.8,
    totalRatings: 89234,
    totalStudents: 345678,
    lastUpdated: new Date("2024-02-15"),
    duration: 27,
    totalLectures: 234,
    status: "published",
    isActive: true,
    requirements: [
      "Basic understanding of IT concepts",
      "No prior AWS experience required",
      "Access to a computer and internet connection",
    ],
    learningObjectives: [
      "Pass the AWS Certified Solutions Architect Associate Certification",
      "Learn to design resilient architectures on AWS",
      "Master AWS services like EC2, S3, RDS, VPC, and more",
      "Understand AWS pricing and cost optimization",
    ],
  },
  {
    title: "Machine Learning A-Z: AI, Python & R + ChatGPT Prize [2024]",
    subtitle:
      "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Code templates included.",
    description:
      "Interested in the field of Machine Learning? Then this course is for you! This course has been designed by two professional Data Scientists so that we can share our knowledge and help you learn complex theory, algorithms, and coding libraries in a simple way.",
    headline: "Master Machine Learning on Python & R",
    category: "Development",
    subcategory: "Data Science",
    topic: "Machine Learning",
    language: "English",
    level: "Beginner",
    thumbnailUrl: "https://img-c.udemycdn.com/course/750x422/950390_270f_3.jpg",
    price: 0,
    originalPrice: 199.99,
    rating: 4.5,
    totalRatings: 178932,
    totalStudents: 723456,
    lastUpdated: new Date("2024-01-30"),
    duration: 44,
    totalLectures: 320,
    status: "published",
    isActive: true,
    requirements: [
      "Just some high school mathematics level",
      "Access to a computer with an internet connection",
      "No prior programming experience required",
    ],
    learningObjectives: [
      "Master Machine Learning on Python & R",
      "Have a great intuition of many Machine Learning models",
      "Make accurate predictions and powerful analysis",
      "Make robust Machine Learning models",
    ],
  },
  {
    title: "Angular - The Complete Guide (2024 Edition)",
    subtitle:
      "Master Angular 17 (formerly Angular 2) and build awesome, reactive web apps with the successor of Angular.js",
    description:
      "Join the most comprehensive Angular course on Udemy and learn how to build amazing web applications with Angular! This course starts from scratch, you neither need to know Angular 1 nor Angular 2.",
    headline: "Master Angular and build awesome reactive web apps",
    category: "Development",
    subcategory: "Web Development",
    topic: "Angular",
    language: "English",
    level: "Beginner",
    thumbnailUrl: "https://img-c.udemycdn.com/course/750x422/756150_c033_2.jpg",
    price: 0,
    originalPrice: 94.99,
    rating: 4.6,
    totalRatings: 156432,
    totalStudents: 567890,
    lastUpdated: new Date("2024-02-20"),
    duration: 34,
    totalLectures: 468,
    status: "published",
    isActive: true,
    requirements: [
      "Basic HTML and CSS knowledge helps but is not required",
      "Prior TypeScript knowledge helps but is not required",
      "Basic JavaScript knowledge is required",
    ],
    learningObjectives: [
      "Develop modern, complex, responsive and scalable web applications with Angular",
      "Fully understand the architecture behind an Angular application and how to use it",
      "Use the gained, deep understanding of the Angular fundamentals to quickly establish yourself as a frontend developer",
      "Create single-page applications with one of the most modern JavaScript frameworks out there",
    ],
  },
  {
    title: "Docker & Kubernetes: The Complete Guide",
    subtitle:
      "Build, test, and deploy Docker applications with Kubernetes while learning production-style development workflows",
    description:
      "Docker and Kubernetes are the newest tech in the Dev Ops world, and have dramatically changed the way we deploy our applications. Docker is a way to package applications into containers that can run on any machine.",
    headline: "Master Docker and Kubernetes for production deployments",
    category: "Development",
    subcategory: "DevOps",
    topic: "Docker",
    language: "English",
    level: "Beginner",
    thumbnailUrl:
      "https://img-c.udemycdn.com/course/750x422/1793828_f8b9_2.jpg",
    price: 0,
    originalPrice: 89.99,
    rating: 4.6,
    totalRatings: 89567,
    totalStudents: 234567,
    lastUpdated: new Date("2024-01-25"),
    duration: 22,
    totalLectures: 342,
    status: "published",
    isActive: true,
    requirements: [
      "Basic terminal/command line knowledge",
      "Basic understanding of web technologies",
      "No prior Docker or Kubernetes experience required",
    ],
    learningObjectives: [
      "Learn Docker from scratch, no previous experience required",
      "Master Kubernetes by building a real-world application",
      "Build a CI + CD pipeline from scratch with Github, Travis CI, and AWS",
      "Understand the purpose and theory of Kubernetes by building your own cluster",
    ],
  },
];

async function seedDatabase() {
  try {
    await connect();

    // Clear existing data
    await Course.deleteMany({});

    await User.deleteMany({});

    await Instructor.deleteMany({});

    // Create sample instructors

    const sampleInstructors = [
      {
        name: {
          first: "John",
          last: "Smith",
        },
        email: "john.instructor@example.com",
        passwordHash: await bcryptjs.hash("password123", 12),
        role: "instructor",
        isVerified: true,
        instructorProfile: {
          bio: "Experienced web developer with 10+ years in the industry",
          expertise: ["JavaScript", "React", "Node.js"],
          isOnboarded: true,
        },
      },
      {
        name: {
          first: "Sarah",
          last: "Johnson",
        },
        email: "sarah.instructor@example.com",
        passwordHash: await bcryptjs.hash("password123", 12),
        role: "instructor",
        isVerified: true,
        instructorProfile: {
          bio: "Data Science expert and Python enthusiast",
          expertise: ["Python", "Machine Learning", "Data Analysis"],
          isOnboarded: true,
        },
      },
      {
        name: { first: "Mike", last: "Chen" },
        email: "mike.instructor@example.com",
        passwordHash: await bcryptjs.hash("password123", 12),
        role: "instructor",
        isVerified: true,
        instructorProfile: {
          bio: "Full-stack developer and cloud architect",
          expertise: ["AWS", "Docker", "Kubernetes"],
          isOnboarded: true,
        },
      },
      {
        name: { first: "Emily", last: "Davis" },
        email: "emily.instructor@example.com",
        passwordHash: await bcryptjs.hash("password123", 12),
        role: "instructor",
        isVerified: true,
        instructorProfile: {
          bio: "Frontend specialist with expertise in modern frameworks",
          expertise: ["Angular", "React", "Vue.js"],
          isOnboarded: true,
        },
      },
    ];

    const instructors = await User.insertMany(sampleInstructors);

    // Create instructor profiles
    for (const instructor of instructors) {
      await Instructor.create({
        user: instructor._id,
        name: `${instructor.name.first} ${instructor.name.last}`,
        title: instructor.instructorProfile.expertise.join(", ") + " Expert",
        bio: {
          short:
            "Experienced instructor specializing in " +
            instructor.instructorProfile.expertise.join(", "),
          full:
            "Experienced instructor with expertise in " +
            instructor.instructorProfile.expertise.join(", ") +
            ". Passionate about teaching and helping students achieve their goals.",
        },
        socialLinks: {
          website: `https://www.${instructor.name.first.toLowerCase()}${instructor.name.last.toLowerCase()}.com`,
          linkedin: `https://linkedin.com/in/${instructor.name.first.toLowerCase()}-${instructor.name.last.toLowerCase()}`,
          twitter: `https://twitter.com/${instructor.name.first.toLowerCase()}${instructor.name.last.toLowerCase()}`,
        },
      });
    }

    // Assign courses to instructors randomly
    const coursesToInsert = coursesData.map((courseData, index) => {
      const randomInstructor = instructors[index % instructors.length];

      return {
        ...courseData,
        instructorId: randomInstructor._id,
        instructorName: `${randomInstructor.name.first} ${randomInstructor.name.last}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // Insert courses
    const insertedCourses = await Course.insertMany(coursesToInsert);

    // Update instructor course counts
    for (const instructor of instructors) {
      const courseCount = await Course.countDocuments({
        instructorId: instructor._id,
      });
      await User.findByIdAndUpdate(instructor._id, {
        "instructorProfile.totalCourses": courseCount,
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
