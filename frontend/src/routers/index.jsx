import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/DasboardPage";
import ErrorPage from "../pages/ErrorPage";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import RoomPage from "../pages/Rooms";
import RoomDetailPage from "../pages/Rooms/RoomDetailPage";
import RoomTypeManagement from "../pages/RoomTypeManagement";
import ServiceManagement from "../pages/ServiceManagement";

const router = createBrowserRouter([
  // Cấu hình route cho các trang dành cho user
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
        path:'/login',
        element: <Login />,
      },
      {
        path:'/signup',
        element: <SignUp />,
      },
      {
        path:'/rooms',
        element: <RoomPage />,
      },
      { path: '/rooms/:id', 
        element: <RoomDetailPage /> 
      },
    ],
  },

  // Cấu hình route cho các trang dành cho admin
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "room-type-management",
        element: <RoomTypeManagement />,
      },
      {
        path: "service-management",
        element: <ServiceManagement />,
      },
    ],
  },
]);

export default router;
