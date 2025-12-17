# Code Snippet Manager

A full-stack MERN application for developers to save, organize, and share code snippets with syntax highlighting, search functionality, and user authentication.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with registration and login
- **Snippet Management**: Create, read, update, and delete code snippets
- **Syntax Highlighting**: Support for 25+ programming languages
- **Search & Filter**: Advanced search with language and tag filtering
- **Public/Private Snippets**: Control visibility of your code snippets
- **Forking**: Fork and modify public snippets from other users
- **Tags & Collections**: Organize snippets with tags and collections
- **User Profiles**: View user profiles and their public snippets
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Advanced Features
- **View Tracking**: Track snippet views and popularity
- **Like System**: Like and unlike snippets
- **Dashboard**: Personal dashboard with statistics
- **Real-time Updates**: Toast notifications for user feedback
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error handling throughout the application
- **Pagination**: Efficient data loading with pagination

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Syntax Highlighter** - Code highlighting
- **React Select** - Dropdown components

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd code-snippet
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create environment variables:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/code-snippet-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create environment variables:
```bash
cp .env.example .env
```

Update `.env` with your API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the database and collections on first run.

## 📁 Project Structure

```
code-snippet/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Snippet.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── snippets.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateSnippet.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── SnippetDetail.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Snippets
- `GET /api/snippets` - Get public snippets
- `GET /api/snippets/my` - Get user's snippets
- `GET /api/snippets/:id` - Get single snippet
- `POST /api/snippets` - Create snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet
- `POST /api/snippets/:id/fork` - Fork snippet
- `POST /api/snippets/:id/like` - Like/unlike snippet
- `GET /api/snippets/languages/list` - Get available languages
- `GET /api/snippets/tags/list` - Get popular tags

### Users
- `GET /api/users/profile/:username` - Get user profile
- `GET /api/users/search` - Search users
- `GET /api/users/stats/:userId` - Get user statistics
- `GET /api/users/liked-snippets` - Get liked snippets

## 🎯 Usage

### 1. Register/Login
- Create an account with username, email, and password
- Login to access your dashboard and create snippets

### 2. Create Snippets
- Click "Create Snippet" from the navigation
- Fill in title, description, code, language, and tags
- Choose visibility (public/private)
- Save to your collection

### 3. Manage Snippets
- View all your snippets in the dashboard
- Edit or delete existing snippets
- Filter by visibility and search

### 4. Discover Snippets
- Browse public snippets on the home page
- Use advanced search with filters
- View snippets by language or tags

### 5. Interact with Community
- Like snippets you find helpful
- Fork public snippets to modify them
- View user profiles and their contributions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: Prevent abuse with rate limiting
- **Security Headers**: Helmet.js for security headers
- **CORS**: Proper CORS configuration
- **Sanitization**: Input sanitization to prevent XSS

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Easy on the eyes dark theme
- **Syntax Highlighting**: Beautiful code highlighting
- **Micro-interactions**: Smooth transitions and hover effects
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: Semantic HTML and ARIA labels

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Update `MONGODB_URI` to your production database
3. Set `NODE_ENV=production`
4. Use a process manager like PM2
5. Configure reverse proxy (nginx)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Update `VITE_API_URL` to production API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify database permissions

**CORS Issues**
- Check frontend API URL in `.env`
- Ensure backend CORS is properly configured

**Authentication Issues**
- Clear browser localStorage
- Check JWT secret in backend `.env`
- Verify token expiration settings

**Build Errors**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all services are running
4. Check network connectivity

## 📈 Future Enhancements

- [ ] Real-time collaboration
- [ ] Code execution playground
- [ ] Advanced analytics dashboard
- [ ] Social features (following, comments)
- [ ] Code snippet templates
- [ ] Export functionality
- [ ] API documentation
- [ ] Mobile app
- [ ] Team workspaces
- [ ] Version history for snippets

## 📞 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Happy Coding! 🚀**
