import axios from 'axios';
import Cookies from 'js-cookie';
import { HttpStatusCode } from 'axios';


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Thêm interceptor request để luôn lấy access token mới nhất
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
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
          data: {
            accessToken: Cookies.get('accessToken'),
            refreshToken: Cookies.get('refreshToken'),
          },
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
