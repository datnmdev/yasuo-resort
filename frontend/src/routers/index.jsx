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
import Contract from '@src/pages/ContractClone';
import Profile from '@src/pages/Profile';
import EditProfile from '@src/pages/Profile/EditProfile';
import FavoriteRoom from '@src/pages/FavoriteRoom/FavoriteRoom';
import FavoriteService from '@src/pages/FavoriteService/FavoriteService';
import Favorites from '@src/pages/Favorites/Favorites';
import BookingHistory from '@src/pages/BookingHistory/BookingHistory';
import ComboManagement from '@src/pages/ComboManagement';
import VoucherManagement from '@src/pages/VoucherManagement';
import TierManagement from '@src/pages/TierManagement';
import Voucher from '@src/pages/Voucher';
import Combos from '@src/pages/Combos';
import BookingCombo from '@src/pages/BookingCombo';
import BookingComBoConfirmationPage from '@src/pages/BookingCombo';

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
        path: '/voucher',
        element: <Voucher />,
      },
      {
        path: '/combo',
        element: <Combos />,
      },
      {
        path: '/about-us',
        element: <AboutPage />,
      },
      {
        path: '/booking-confirmation/:id',
        element: <BookingPage />,
      },
      {
        path: '/booking-combo/:id',
        element: <BookingComBoConfirmationPage />,
      },
      {
        path: '/contracts',
        element: <Contract />,
      },
      {
        path: '/favorite-rooms',
        element: <FavoriteRoom />,
      },
      {
        path: '/favorite-services',
        element: <FavoriteService />,
      },
      {
        path: '/favorites',
        element: <Favorites />,
      },
      {
        path: '/booking-history',
        element: <BookingHistory />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/profile/edit',
        element: <EditProfile />,
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
      {
        path: 'combo-management',
        element: <ComboManagement />,
      },
      {
        path: 'voucher-management',
        element: <VoucherManagement />,
      },
      {
        path: 'tier-management',
        element: <TierManagement />,
      },
    ],
  },
]);

export default router;
