import axiosInstance from '../libs/axios'
export default {
    signIn: (body) => {
        return axiosInstance().post("/auth/sign-in",body)
    },
    sendOtp: (email) => axiosInstance().post("/auth/send-otp", { email }),
    verifyOtp: (email, otp) => axiosInstance().post("/auth/verify-account", { email, otp }),
    signUp: (body) => axiosInstance().post("/auth/sign-up", body),
}