import { notification } from "antd";

export default function useToast() {
  const [notificationApi, contextHolder] = notification.useNotification();

  const openNotification = (notificationInfo) => {
    notificationApi.open({
      message: notificationInfo.title,
      description: notificationInfo.description ?? "",
      showProgress: true,
      pauseOnHover: true,
    });
  };

  return { openNotification, contextHolder };
}
