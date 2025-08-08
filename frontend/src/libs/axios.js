import axios from 'axios';
import Cookies from 'js-cookie';
import { HttpStatusCode } from 'axios';


const accessToken = Cookies.get('accessToken');
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  async (response) => response,
  async (error) => {
    if (
      error.response &&
      error.response.status === HttpStatusCode.Unauthorized &&
      !error.config.url.includes('/auth/sign-in') &&
      !error.config.url.includes('/auth/sign-up') &&
      !error.config.url.includes('/auth/verify-account') &&
      !error.config.url.includes('/auth/send-otp')
    ) {
      const refreshToken = (
        await axios({
          url: `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          method: 'put',
          withCredentials: true,
        })
      ).data;

      if (refreshToken) {
        Cookies.set('accessToken', refreshToken.accessToken, {
          httpOnly: false,
          secure: true,
          sameSite: 'None',
          expires: 7200 / (60 * 60 * 24),
        });
        Cookies.set('refreshToken', refreshToken.refreshToken, {
          httpOnly: false,
          secure: true,
          sameSite: 'None',
          expires: 2592000 / (60 * 60 * 24),
        });
        error.config.headers.Authorization = `Bearer ${Cookies.get('accessToken')}`;
        return await axios(error.config);
      }
    }
    return await Promise.reject(error);
  }
);


export default axiosInstance
