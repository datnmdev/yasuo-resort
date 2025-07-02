import { Outlet } from "react-router";
import Logo from "../../components/navigation/Logo";
import Navbar from "../../components/navigation/navbar";
import Footer from "../../components/footer/Footer";

export default function UserLayout() {
  return (
    <div className="">
      <Logo/>
      <Navbar/>
      <div>
        <Outlet />
      </div>

      <Footer/>
    </div>
  )
}