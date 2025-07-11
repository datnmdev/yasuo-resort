import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
// import DashboardPage from "../pages/DasboardPage";
import ErrorPage from "../pages/ErrorPage";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import RoomPage from "../pages/Rooms";
import RoomDetailPage from "../pages/Rooms/RoomDetailPage";
import ServicePage from "../pages/Services";
import RoomTypeManagementPage from "../pages/RoomTypeManagementPage";
import ServiceManagementPage from "../pages/ServiceManagementPage";
import RoomManagementPage from "../pages/RoomManagementPage";
import BookingRequestPage from "../pages/BookingRequestPage";
import ResetPassword from "@src/pages/ResetPassword";

const router = createBrowserRouter([
  // Cấu hình route cho các trang dành cho user
  {
    path: "/",
    element: <UserLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/rooms",
        element: <RoomPage />,
      },
      { path: '/rooms/:id', 
        element: <RoomDetailPage /> 
      },
      {
        path:'/services',
        element: <ServicePage />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      }
    ],
  },

  // Cấu hình route cho các trang dành cho admin
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      // {
      //   path: "dashboard",
      //   element: <DashboardPage />,
      // },
      {
        path: "room-type-management",
        element: <RoomTypeManagementPage />,
      },
      {
        path: "service-management",
        element: <ServiceManagementPage />,
      },
      {
        path: "room-management",
        element: <RoomManagementPage />,
      },
      {
        path: "booking-request",
        element: <BookingRequestPage />,
      },
    ],
  },
]);

export default router;
