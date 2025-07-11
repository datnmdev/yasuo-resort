import {
  CaretDownOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import { useEffect, useState } from "react";
import useFetch from "../../../../hooks/fetch.hook";
import apis from "../../../../apis/index";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { userAction } from "../../../../stores/reducers/userReducer";
import useToast from "../../../../hooks/toast.hook";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signOutReq, setSignOutReq] = useState(null);
  const {
    data: signOutResData,
    isLoading: isSigningOut,
    setRefetch: setReSigningOut,
  } = useFetch(apis.user.signOut, signOutReq, false);
  const { openNotification, contextHolder } = useToast();

  const items = [
    {
      key: "1",
      label: (
        <div
          className="flex space-x-2 min-w-40"
          onClick={() =>
            setSignOutReq({
              accessToken: Cookies.get("accessToken"),
              refreshToken: Cookies.get("refreshToken"),
            })
          }
        >
          <LogoutOutlined />
          <span>Sign out</span>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (signOutReq) {
      setReSigningOut({
        value: true,
      });
    }
  }, [signOutReq]);

  useEffect(() => {
    if (!isSigningOut) {
      if (signOutResData) {
        if (signOutResData.isSuccess) {
          dispatch(userAction.logout());
          navigate("/");
        } else {
          openNotification({
            title: signOutResData.error.message.toString(),
          });
        }
      }
    }
  }, [isSigningOut]);

  return (
    <div className="flex justify-end border-b-[1px] border-solid border-gray-300 p-2">
      <Dropdown menu={{ items }} placement="bottom">
        <div className="flex items-center space-x-0.5">
          <div>
            <Avatar icon={<UserOutlined />} />
          </div>
          <div>
            <CaretDownOutlined className="text-[#BDBDBD]" />
          </div>
        </div>
      </Dropdown>
      {contextHolder}
    </div>
  );
}
