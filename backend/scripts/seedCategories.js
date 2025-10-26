const mongoose = require("mongoose");
const Category = require("../models/category.model");
const connect = require("../config/db");

// Category data with the specified format
const categoriesData = [
  {
    title: "Development",
    slug: "development",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 0,
  },
  {
    title: "Business",
    slug: "business",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 1,
  },
  {
    title: "Marketing",
    slug: "marketing",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 2,
  },
  {
    title: "Design",
    slug: "design",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 3,
  },
  {
    title: "Photography",
    slug: "photography",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 4,
  },
  {
    title: "Music",
    slug: "music",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 5,
  },
  {
    title: "Health & Fitness",
    slug: "health-fitness",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 6,
  },
  {
    title: "Lifestyle",
    slug: "lifestyle",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 7,
  },
  {
    title: "Teaching & Academics",
    slug: "teaching-academics",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 8,
  },
  {
    title: "IT & Software",
    slug: "it-software",
    icon: null,
    image: null,
    parent: null,
    level: 1,
    courseCount: 0,
    studentCount: 0,
    isActive: true,
    isFeatured: false,
    keywords: [],
    sortOrder: 9,
  },
];

async function seedCategories() {
  try {
    await connect();
    console.log("Connected to database");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Insert new categories
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`Successfully inserted ${insertedCategories.length} categories:`);
    
    insertedCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.title} (${category.slug})`);
    });

    console.log("\nCategories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seedCategories();
}

module.exports = { seedCategories };
