# 01Blog - Social Learning Platform

A fullstack social blogging platform built with Spring Boot and Angular, designed for students to share their learning experiences, discoveries, and progress throughout their educational journey.

## 🚀 Features

### Backend Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (User/Admin)
- **User Management**: User registration, login, profile management
- **Posts**: Create, read, update, delete posts with media upload (images/videos)
- **Social Interactions**: Like posts, comment on posts, follow/unfollow users
- **Notifications**: Real-time notifications for new posts from followed users
- **Reporting System**: Users can report inappropriate content, admins can moderate
- **Admin Panel**: Complete admin dashboard for user and content management
- **Media Upload**: Secure file upload with local storage
- **RESTful API**: Well-documented REST endpoints with consistent response format

### Frontend Features (Angular)

- **Responsive UI**: Built with Angular Material for modern, responsive design
- **User Dashboard**: Personal blog page with full post management
- **Social Feed**: Homepage with posts from followed users
- **Real-time Interactions**: Like, comment, and follow functionality
- **Media Preview**: Image and video upload with previews
- **Admin Interface**: Complete admin panel for content moderation

## 🛠️ Technology Stack

### Backend

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **PostgreSQL** database
- **Maven** for dependency management
- **Docker** for database containerization

### Frontend

- **Angular 21**
- **Angular Material** for UI components
- **TypeScript**
- **RxJS** for reactive programming
- **Angular CLI** for development

## 📋 Prerequisites

- **Java 17** or higher
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **PostgreSQL** (or use Docker)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 01blog
```

### 2. Backend Setup

#### Using Docker (Recommended)

```bash
# Start PostgreSQL database
docker-compose up -d

# Navigate to backend directory
cd backend

# Run the application
./mvnw spring-boot:run
```

#### Manual Setup

```bash
# Install PostgreSQL and create database
createdb blogdb

# Update database credentials in backend/src/main/resources/application.properties
# Default credentials: username=tenno, password=vor_speaks_truth

# Navigate to backend directory
cd backend

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

The frontend will start on `http://localhost:4200`

## 🔐 Default Credentials

### Admin User

- **Username**: admin
- **Password**: admin123
- **Email**: admin@noctua.com

### Regular User

Create a new account through the registration form.

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### User Endpoints

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{userId}` - Get user by ID
- `GET /api/users/{userId}/posts` - Get user's posts

### Post Endpoints

- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/feed` - Get posts from followed users
- `POST /api/posts` - Create new post
- `PUT /api/posts/{postId}` - Update post
- `DELETE /api/posts/{postId}` - Delete post

### Social Features

- `POST /api/likes/{postId}` - Like/unlike a post
- `POST /api/subscriptions/{userId}` - Follow/unfollow a user
- `GET /api/subscriptions/{userId}` - Get user's subscriptions
- `GET /api/subscriptions/followers/{userId}` - Get user's followers

### Comments

- `GET /api/comments/post/{postId}` - Get comments for a post
- `POST /api/comments` - Create comment
- `DELETE /api/comments/{commentId}` - Delete comment

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{notificationId}/read` - Mark notification as read

### Reporting

- `POST /api/reports` - Submit a report
- `GET /api/reports/user` - Get user's reports

### Admin Endpoints (Admin role required)

- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/{userId}/ban` - Ban user
- `DELETE /api/admin/users/{userId}` - Delete user
- `GET /api/admin/posts` - Get all posts
- `DELETE /api/admin/posts/{postId}` - Delete post
- `GET /api/admin/reports` - Get all reports
- `POST /api/admin/reports/{reportId}/resolve` - Resolve report

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- `users` - User accounts and profiles
- `posts` - Blog posts with media
- `comments` - Comments on posts
- `likes` - Post likes
- `subscriptions` - User follow relationships
- `notifications` - User notifications
- `reports` - Content reports
- `media` - File upload metadata

## 🔧 Configuration

### Environment Variables

Create `.env` file in the backend directory:

```properties
# Database
DB_URL=jdbc:postgresql://localhost:5432/blogdb
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10MB
```

### File Upload Configuration

- Maximum file size: 10MB
- Supported formats: Images (JPEG, PNG, GIF) and Videos (MP4, AVI)
- Files stored in `uploads/` directory

## 🧪 Testing

### Backend Tests

```bash
cd backend
./mvnw test
```

### Frontend Tests

```bash
cd frontend
ng test
```

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
./mvnw clean package
java -jar target/blog-backend-1.0.0.jar
```

### Frontend Deployment

```bash
cd frontend
ng build --prod
# Serve the dist/ directory with any web server
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Madagha** - _Initial work_

## 🙏 Acknowledgments

- Spring Boot and Angular communities
- All contributors and testers
- Educational institutions supporting open-source learning platforms
