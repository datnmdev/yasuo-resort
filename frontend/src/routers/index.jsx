import { createBrowserRouter } from 'react-router';
import HomePage from '../pages/HomePage';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
// import DashboardPage from "../pages/DasboardPage";
import ErrorPage from '../pages/ErrorPage';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import RoomPage from '../pages/Rooms';
import ServicePage from '../pages/Services';
import RoomTypeManagementPage from '../pages/RoomTypeManagementPage';
import ServiceManagementPage from '../pages/ServiceManagementPage';
import RoomManagementPage from '../pages/RoomManagementPage';
import BookingRequestPage from '../pages/BookingRequestPage';
import ResetPassword from '@src/pages/ResetPassword';
import AboutPage from '@src/pages/AboutUs';
import BookingPage from '@src/pages/Booking';
import Contract from '@src/pages/Contract';

const router = createBrowserRouter([
  // Cấu hình route cho các trang dành cho user
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/signup',
    element: <SignUp />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: <UserLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: '/rooms',
        element: <RoomPage />,
      },
      {
        path: '/services',
        element: <ServicePage />,
      },
      {
        path: '/about-us',
        element: <AboutPage />,
      },
      {
        path: '/booking-confirmation',
        element: <BookingPage />,
      },
      {
        path: '/contracts',
        element: <Contract />,
      },
    ],
  },

  // Cấu hình route cho các trang dành cho admin
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      // {
      //   path: "dashboard",
      //   element: <DashboardPage />,
      // },
      {
        path: 'room-type-management',
        element: <RoomTypeManagementPage />,
      },
      {
        path: 'service-management',
        element: <ServiceManagementPage />,
      },
      {
        path: 'room-management',
        element: <RoomManagementPage />,
      },
      {
        path: 'booking-request',
        element: <BookingRequestPage />,
      },
    ],
  },
]);

export default router;
