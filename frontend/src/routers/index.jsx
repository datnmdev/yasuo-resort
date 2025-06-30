import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/DasboardPage";
import ErrorPage from "../pages/ErrorPage";

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
    ],
  },
]);

export default router;
