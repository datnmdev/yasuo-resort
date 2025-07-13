import { Outlet } from 'react-router';
import Navbar from '@src/components/navigation/Navbar';
import { useAutoLogin } from '@src/hooks/useAutoLogin';
import Footer from '@src/components/footer/Footer';
import Logo from '@src/components/navigation/Logo';

export default function UserLayout() {
  useAutoLogin();
  return (
    <div className="min-h-screen">
      <Logo />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
