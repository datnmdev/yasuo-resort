import { Outlet } from "react-router";
import Logo from "../../components/navigation/Logo";
import Navbar from "../../components/navigation/navbar";
import Footer from "../../components/footer/Footer";
import { useAutoLogin } from "../../hooks/useAutoLogin";

export default function UserLayout() {
  useAutoLogin();
  return (
    <div className="shadow-[0_0_0_15px_#0D584D_inset]">
      <Logo/>
      <Navbar/>
      <div className="p-[15px]">
        <Outlet />
      </div>

      <Footer/>
    </div>
  )
}