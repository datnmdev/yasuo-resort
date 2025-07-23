import axiosInstance from "../libs/axios";
export default {
  signIn: (body) => {
    return axiosInstance.post("/auth/sign-in", body);
  },
  sendOtp: (email) => axiosInstance.post("/auth/send-otp", { email }),
  verifyOtp: (email, otp) =>
    axiosInstance.post("/auth/verify-account", { email, otp }),
  signUp: (body) => axiosInstance.post("/auth/sign-up", body),
  signOut: (body) => {
    return axiosInstance.post("/auth/sign-out", body);
  },
  verifyForgotPassword: (email, otp) =>
    axiosInstance.post("/auth/verify-forgot-password", { email, otp }),
  resetPassword: (email, password, code) =>
    axiosInstance.put("/auth/reset-password", { email, password, code }),
  getProfile: () => axiosInstance.get("/user/get-profile"),
  updateProfile:(data) => {
    axiosInstance.put("/user/update-profile",data)
  }
};
