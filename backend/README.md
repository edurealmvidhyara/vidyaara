# Udemy Clone Backend API - Free Learning Platform

A comprehensive backend API for a free Udemy clone with instructor and student user types. All courses are completely free to access.

## Database Schema

### User Model

- **Two user types**: `instructor` and `student`
- **Instructor features**: Create/manage courses, track students, ratings
- **Student features**: Enroll in courses, wishlist, learning progress

### Course Model

- **Instructor-only creation**: Only instructors can create courses
- **Rich content structure**: Sections, lectures, videos, documents
- **Publishing workflow**: Draft → Published → Archived
- **Analytics**: Views, enrollments, ratings
- **Free platform**: No pricing or payment functionality

### Wishlist Model

- **Student-only feature**: Students can save courses they like
- **Course metadata**: Stores course info for quick access
- **Duplicate prevention**: Unique constraint on user + course

## API Endpoints

### Authentication

- `POST /api/users/register` - Register new user (student/instructor)
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

### User Management

- `GET /api/users/instructors` - Get all instructors
- `GET /api/users/instructor/:id` - Get specific instructor profile

### Courses

- `GET /api/courses` - Get all published courses (public)
- `GET /api/courses/:id` - Get specific course (public)
- `POST /api/courses` - Create new course (instructor only)
- `PUT /api/courses/:id` - Update course (instructor only)
- `DELETE /api/courses/:id` - Delete course (instructor only)
- `GET /api/courses/instructor/my-courses` - Get instructor's courses
- `PATCH /api/courses/:id/publish` - Publish/unpublish course
- `GET /api/courses/categories/list` - Get all categories
- `GET /api/courses/instructor/:instructorId` - Get courses by instructor

### Wishlist

- `GET /api/wishlist` - Get user's wishlist (authenticated)
- `POST /api/wishlist` - Add course to wishlist (authenticated)
- `DELETE /api/wishlist/:courseId` - Remove from wishlist (authenticated)
- `GET /api/wishlist/check/:courseId` - Check if in wishlist (authenticated)
- `DELETE /api/wishlist` - Clear entire wishlist (authenticated)

## Environment Variables

```env
MONGO_URL=mongodb://localhost:27017/udemy-clone
PORT=5000
JWT_SECRET=your-secret-key-here
```

## Features

### For Instructors

- Create and manage courses
- Course publishing workflow
- Student analytics
- Profile management
- Course content management
- **Free platform**: No payment processing needed

### For Students

- Browse published courses
- Add courses to wishlist
- View instructor profiles
- Course enrollment tracking
- Learning progress
- **Free access**: All courses are completely free

### General

- JWT authentication
- Role-based access control
- Input validation
- Error handling
- Database indexing for performance
- **No payment system**: Simplified free learning experience

## Data Flow

1. **Course Display**: Frontend loads course data from existing backend
2. **User Management**: New backend handles user registration/login
3. **Wishlist**: Students can save courses to their wishlist
4. **Course Creation**: Instructors can create courses (future feature)
5. **Free Learning**: All courses accessible without payment

## Course Sorting Options

- `newest` - Most recently created courses
- `oldest` - Oldest courses first
- `rating` - Highest rated courses
- `students` - Most enrolled courses
- `popular` - Most viewed courses
- `title` - Alphabetical by title

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Start server: `npm run dev`
4. API will be available at `http://localhost:5000`

## Free Platform Benefits

- **No payment complexity**: Simplified user experience
- **Focus on learning**: Pure educational platform
- **Easy onboarding**: No financial barriers
- **Community-driven**: Instructors share knowledge freely
