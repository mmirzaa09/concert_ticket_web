# Concert Ticket Admin Dashboard

A simple React/Next.js admin web panel with role-based access control for managing concerts, users, and payments.

## Features

### Authentication
- **Login & Register pages** with form validation
- **Role-based access control** (Admin and Organizer roles)
- **Token storage** in localStorage
- **Protected routes** based on user authentication and role

### Organizer Features
- **Concert Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Concert Status**: Toggle between active/inactive status
- **Concert Details**: Title, description, date, venue, price management

### Admin Features (All organizer features plus)
- **User Management**: View, create, edit, and manage user accounts
- **Payment Monitoring**: View payment transactions and revenue tracking
- **Enhanced Dashboard**: Additional statistics and admin-only content

## Project Structure

```
src/
├── app/
│   ├── concerts/         # Concert management page
│   ├── dashboard/        # Main dashboard
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   ├── users/           # User management (admin only)
│   ├── payments/        # Payment list (admin only)
│   └── layout.tsx       # Root layout with AuthProvider
├── components/
│   ├── Form.tsx         # Reusable form components
│   ├── Table.tsx        # Reusable table component
│   ├── Navbar.tsx       # Navigation bar
│   ├── Sidebar.tsx      # Side navigation
│   ├── ProtectedRoute.tsx # Route protection component
│   └── MainLayout.tsx   # Main app layout
└── context/
    └── AuthContext.tsx  # Authentication context
```

## Test Credentials

For testing the application, use these pre-configured accounts:

### Admin Account
- **Email**: `admin@test.com`
- **Password**: `admin123`
- **Access**: All features including user management and payments

### Organizer Account
- **Email**: `organizer@test.com`
- **Password**: `org123`
- **Access**: Concert management only

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

4. **Login** using one of the test credentials above

5. **Explore the features** based on your role:
   - **Organizers**: Access Dashboard and Concerts
   - **Admins**: Access Dashboard, Concerts, Users, and Payments

## Key Components

### AuthContext
- Manages user authentication state
- Provides login, register, and logout functions
- Stores user data and token in localStorage
- Mock authentication (replace with real API calls)

### ProtectedRoute
- Restricts access based on authentication status
- Supports role-based access control
- Redirects unauthorized users to login

### Form Components
- Reusable form fields (Input, Select, Textarea)
- Built-in validation and error handling
- Consistent styling and behavior

### Table Component
- Displays data in a structured format
- Supports custom rendering for columns
- Loading and empty states

## Navigation

The application uses Next.js App Router with:
- **Fixed navbar** with user info and logout
- **Sidebar navigation** with role-based menu items
- **Responsive design** for mobile devices

## Mock Data

Currently uses mock data for:
- User authentication
- Concert listings
- User management
- Payment transactions

Replace the mock implementations in each component with actual API calls for production use.

## Styling

- **CSS Modules** for component-specific styles
- **Responsive design** with mobile-first approach
- **Consistent color scheme** and spacing
- **Modern UI** with clean, professional appearance

## Next Steps

To make this production-ready:

1. **Replace mock authentication** with real API integration
2. **Add form validation** libraries (e.g., Yup, Zod)
3. **Implement real CRUD operations** with backend API
4. **Add error handling** and loading states
5. **Include unit tests** for components and context
6. **Add environment configuration** for different stages
7. **Implement proper logging** and monitoring
