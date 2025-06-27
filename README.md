# Cinema App Documentation

## 1. Project Overview

Cinema App is a full-stack web application for managing a cinema. It allows users to browse movies, view showtimes, book tickets, and manage their profiles. The application also includes an admin panel for managing movies, showtimes, bookings, users, and halls, as well as a staff panel for managing ticket sales and check-ins.

## 2. Features

### Customer Features
- Browse the current movie repertoire.
- View movie details, including description, director, rating, and available showtimes.
- Book tickets for a selected showtime.
- Select seats from an interactive seat map.
- User registration and login.
- Manage user profile, including personal data and preferences.
- View booking history and statistics.

### Admin Features
- **Dashboard**: View overall statistics, including total revenue, bookings, active movies, and registered customers.
- **Movie Management**: Add, delete, and view details of movies in the repertoire.
- **Showtime Management**: Add and delete showtimes, assigning movies to specific halls at given dates and times.
- **Booking Management**: View all bookings and manage their statuses.
- **User Management**: View all registered users, including their roles and activity.
- **Hall Management**: Add, edit, and delete cinema halls, specifying their capacity and seating layout.
- **Staff Management**: Add and remove staff members.

### Staff Features
- **Direct Sales**: Sell tickets directly at the counter for walk-in customers.
- **Booking Management**: Check-in customers with existing online bookings.
- **Showtime Overview**: View today's showtimes with real-time occupancy rates.
- **Daily Statistics**: Track daily sales, revenue, and customer numbers.

## 3. Technologies Used

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JSON Web Tokens (JWT)**: For securing API endpoints.
- **bcryptjs**: For hashing passwords.
- **dotenv**: For managing environment variables.
- **cors**: For enabling Cross-Origin Resource Sharing.

### Frontend
- **React**: JavaScript library for building user interfaces.
- **Vite**: Next-generation front-end tooling.
- **React Router**: For handling routing in the application.
- **React Hooks**: For state management and side effects.
- **CSS**: For styling the application, with a modular approach per component/page.

### Development
- **Concurrently**: To run both backend and frontend servers with a single command.
- **ESLint**: For code linting and maintaining code quality.

## 4. Project Structure

```
/
├── server/
│   ├── .env                # Environment variables for the server
│   ├── index.js            # Main server entry point
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   ├── models/             # Mongoose models for database collections
│   │   ├── booking.js
│   │   ├── hall.js
│   │   ├── Movie.js
│   │   ├── showtime.js
│   │   └── user.js
│   ├── package.json        # Server dependencies and scripts
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── halls.js
│   │   ├── movies.js
│   │   ├── showtimes.js
│   │   └── users.js
│   └── seedAdmin.js        # Script to seed the initial admin user
│
├── src/
│   ├── components/
│   │   └── Layout/         # Layout components (e.g., Header)
│   │       ├── Header.css
│   │       └── Header.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication context for the app
│   ├── pages/              # Page components for different routes
│   │   ├── AdminPage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MovieDetailsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── StaffPage.jsx
│   ├── App.css             # Main app styles
│   ├── App.jsx             # Main App component with routing
│   ├── index.css           # Global styles
│   └── main.jsx            # Main entry point for the React app
│
├── .gitignore              # Git ignore file
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
└── vite.config.js          # Vite configuration
```

## 5. Backend Documentation

### 5.1. API Endpoints

#### Authentication (`/api/auth`)

- `POST /register`: Register a new customer.
- `POST /register/staff`: Register a new staff member (Admin only, requires token).
- `POST /login`: Log in a user and return a JWT token.

#### Movies (`/api/movies`)

- `GET /`: Get all movies.
- `GET /:id`: Get a movie by its ID.
- `POST /`: Create a new movie (Admin only, requires token).
- `PUT /:id`: Update a movie by its ID (Admin only, requires token).
- `DELETE /:id`: Delete a movie by its ID (Admin only, requires token).

#### Showtimes (`/api/showtimes`)

- `GET /`: Get all showtimes, populated with movie and hall details.
- `GET /today`: Get all showtimes for the current day.
- `GET /:id`: Get a showtime by its ID.
- `POST /`: Create a new showtime (Admin only, requires token).
- `PATCH /:id`: Update a showtime by its ID (Admin only, requires token).
- `DELETE /:id`: Delete a showtime by its ID (Admin only, requires token).
- `GET /:id/seats`: Get occupied seats for a specific showtime.

#### Bookings (`/api/bookings`)

- `GET /`: Get all bookings (Admin or Staff only, requires token).
- `GET /today`: Get all bookings for the current day (Admin or Staff only, requires token).
- `GET /stats/today`: Get sales statistics for the current day (Admin or Staff only, requires token).
- `GET /:id`: Get a booking by its ID (Requires token).
- `GET /user/:userId`: Get all bookings for a specific user (Owner, Admin or Staff only, requires token).
- `POST /`: Create a new booking (Requires token).
- `PUT /:id`: Update a booking by its ID (Requires token).
- `DELETE /:id`: Delete a booking by its ID (Requires token).

#### Users (`/api/users`)

- `GET /`: Get all users (Admin only, requires token, passwords are excluded).
- `GET /:id`: Get a user by ID (password is excluded).
- `POST /`: Create a new user.
- `PUT /:id`: Update a user by ID (requires token).
- `DELETE /:id`: Delete a user by ID (Admin or owner only, requires token).

#### Halls (`/api/halls`)

- `GET /`: Get all halls.
- `GET /:id`: Get a hall by its ID.
- `POST /`: Create a new hall (Admin only, requires token).
- `PATCH /:id`: Update a hall by its ID (Admin only, requires token).
- `DELETE /:id`: Delete a hall by its ID (Admin only, requires token).

### 5.2. Models

- **User**: Stores user information, including name, email, hashed password, role (`customer`, `staff`, `admin`), and preferences.
- **Movie**: Stores movie details like title, duration, description, genre, poster URL, etc.
- **Hall**: Stores cinema hall information, including name, capacity, and seating layout.
- **Showtime**: Links a movie to a hall at a specific date and time, and includes ticket price and seat availability.
- **Booking**: Stores booking details, including the user, showtime, selected seats, and total price.

### 5.3. Middleware

- **auth.js**: A middleware function that verifies the JWT token from the `Authorization` header to protect routes. It attaches the authenticated user object to the request.

## 6. Frontend Documentation

### 6.1. Components

- **Header**: The main navigation bar of the application. It displays different links based on the user's authentication status and role.
- **ProtectedRoute**: A component that wraps around routes that require authentication. It checks for a valid user session and role before rendering the child component.

### 6.2. Pages

- **HomePage**: The main landing page that displays the current movie repertoire.
- **MovieDetailsPage**: Displays detailed information about a selected movie, including its description, showtimes, and other metadata.
- **LoginPage**: Handles both user login and registration. It includes a form that toggles between the two modes.
- **BookingPage**: A multi-step process for booking tickets. It includes seat selection on an interactive map, entering customer data, a mock payment form, and a confirmation screen.
- **ProfilePage**: Allows authenticated users to view and edit their profile information, manage preferences, and see their booking history and personal statistics.
- **AdminPage**: A comprehensive dashboard for administrators to manage all aspects of the cinema, including movies, showtimes, bookings, users, halls, and staff.
- **StaffPage**: A dedicated panel for cinema staff to handle walk-in ticket sales and check-in customers with online reservations.

### 6.3. Context

- **AuthContext.jsx**: Provides authentication state and functions (`login`, `logout`, `register`) to the entire application. It stores the user's data and JWT token in local storage to maintain the session.

## 7. Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd cinema-app-new
    ```

2.  **Install backend dependencies**:
    ```bash
    cd server
    npm install
    ```

3.  **Install frontend dependencies**:
    ```bash
    cd ..
    npm install
    ```

4.  **Set up environment variables**:
    - Create a `.env` file in the `server` directory.
    - Add the following line, replacing the connection string with your MongoDB URI:
      ```
      MONGO_URI=mongodb://127.0.0.1:27017/cinema
      JWT_SECRET=your_jwt_secret
      ```

5.  **Seed the database with an admin user**:
    - From the `server` directory, run:
      ```bash
      npm run seed-admin
      ```
    - This will create a default admin user with the following credentials:
      - **Email**: `admin@cinema.local`
      - **Password**: `admin123`

6.  **Run the application**:
    - From the root directory of the project, run:
      ```bash
      npm run dev
      ```
    - This command will start both the backend server (on port 5000) and the frontend development server (on port 5173) concurrently.

7.  **Access the application**:
    - Open your browser and navigate to `http://localhost:5173`.

## 8. Recent Bug Fixes and Improvements

- **Routing and Redirects**: The main application routing in `App.jsx` has been completely restructured to better handle public and protected routes. The login redirect logic has been fixed to ensure users are sent to the correct page after authentication.
- **Admin Panel Data**: Fixed a bug in the Admin Panel where movie and hall names were not appearing in the showtimes list. Also resolved an issue where the "Users" and "Staff" tabs were empty due to a missing authorization header.
- **Movie Details Page**: Created the `MovieDetailsPage.jsx` component and its corresponding CSS file to display detailed information about movies. Fixed a data fetching issue that was preventing movie details from being displayed.
- **Login Page**: Fixed a runtime error that was causing the login page to appear blank.
- **Backend Security**: Enhanced security by adding authentication middleware to several API endpoints, ensuring that only authorized users can access sensitive data and perform restricted actions.