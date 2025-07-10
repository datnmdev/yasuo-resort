import {
  BuildOutlined,
  CustomerServiceOutlined,
  TagsOutlined,
  FormOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router";

const items = [
  { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  {
    key: "/admin/booking-requests",
    icon: <FormOutlined />,
    label: "Booking Requests",
  },
  {
    key: "/admin/rooms-management",
    icon: <BuildOutlined />,
    label: "Rooms Management",
  },
  {
    key: "/admin/room-types-management",
    icon: <TagsOutlined />,
    label: "Room Types Management",
  },
  {
    key: "/admin/services-management",
    icon: <CustomerServiceOutlined />,
    label: "Services Management",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <img className="w-40 mx-auto" src="/logo_resort_2.png" alt="logo" />
      <Menu
        defaultSelectedKeys={["/admin/dashboard"]}
        selectedKeys={[location.pathname]}
        mode="inline"
        theme="light"
        items={items}
        style={{ width: 256, height: "100%" }}
        onSelect={(info) => navigate(info.key)}
      />
    </div>
  );
}
