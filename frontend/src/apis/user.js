import axiosInstance from '../libs/axios'
export default {
    signIn: (body) => {
        return axiosInstance().post("/auth/sign-in",body)
    },
}