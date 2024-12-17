# Recipe Sharing Platform

A fully featured recipe sharing web application that allows users to register, log in, create and share recipes, comment, like, and manage their profiles. Administrators have advanced capabilities to manage users and oversee the platform's content.

## Features

### Backend

- **MVC Architecture**: Built using Node.js, Express, and EJS templating.
- **User Authentication**: Secure sign-up and log-in functionalities with Passport.js.
- **Persistent Data Storage**: MongoDB with Mongoose for database management.
- **Admin Capabilities**: Advanced functions accessible only to admin users.
- **Session Management**: Handled via express-session and connect-mongo.
- **RESTful API (Optional)**: CRUD operations with potential API key authentication.
- **Data Validation & Error Handling**: Ensures data integrity and secure access.

### Frontend

- **Responsive Design**: Compatible with multiple devices using Bootstrap.
- **Dynamic Interfaces**: Different views for admins and regular users.
- **Web Forms**: For user registration, login, and profile editing with validation.
- **Advanced HTML5 APIs**: Enhancements like location-aware features and client-side storage.
- **JavaScript Interactions**: Enhanced user experience with vanilla JS and optional frameworks.

### Deployment

- **Glitch**: Deployed on Glitch with real-time collaboration features.
- **MongoDB Atlas**: Optional external storage solution for the database.

## Technologies Used

- **Backend**: Node.js, Express.js, Passport.js, MongoDB, Mongoose, EJS
- **Frontend**: HTML5, CSS3, Bootstrap, JavaScript
- **Deployment**: Glitch, MongoDB Atlas (optional)
- **Others**: dotenv, bcrypt, connect-flash, express-session, connect-mongo