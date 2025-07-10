import {
  CaretDownOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";

const items = [
  {
    key: "1",
    label: (
      <div className="flex space-x-2 min-w-40">
        <LogoutOutlined />
        <span>Sign out</span>
      </div>
    ),
  },
];

export default function Header() {
  return (
    <div className="flex justify-end border-b-[1px] border-solid border-gray-300 p-2">
      <Dropdown menu={{ items }} placement="bottom">
        <div className="flex items-center space-x-0.5">
          <div>
            <Avatar icon={<UserOutlined />} />
          </div>
          <div>
            <CaretDownOutlined className="text-[#BDBDBD]"/>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}
