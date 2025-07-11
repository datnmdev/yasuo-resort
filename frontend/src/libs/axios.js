import axios from 'axios';
import Cookies from 'js-cookie';


const accessToken = Cookies.get('accessToken');
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  withCredentials: true,
});

// axiosInstance.interceptors.response.use(
//   async (response) => response,
//   async (error) => {
//     if (
//       error.response &&
//       error.response.status === HttpStatusCode.Unauthorized
//     ) {
//       const refreshToken = (
//         await axios({
//           url: `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
//           method: 'post',
//           withCredentials: true,
//         })
//       ).data;

//       if (refreshToken) {
//         Cookies.set('accessToken', refreshToken.accessToken, {
//           httpOnly: false,
//           secure: true,
//           sameSite: 'None',
//           expires: 7200 / (60 * 60 * 24),
//         });
//         Cookies.set('refreshToken', refreshToken.refreshToken, {
//           httpOnly: false,
//           secure: true,
//           sameSite: 'None',
//           expires: 2592000 / (60 * 60 * 24),
//         });
//         error.config.headers.Authorization = `Bearer ${Cookies.get('accessToken')}`;
//         return await axios(error.config);
//       }
//     }
//     return await Promise.reject(error);
//   }
// );

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 và KHÔNG phải từ login, mới thử refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes('/auth/sign-in') &&
      Cookies.get("accessToken") && Cookies.get("refreshToken")
    ) {
      try {
        const refreshRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
        });

        const { accessToken, refreshToken } = refreshRes.data;

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

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return await axios(originalRequest);
      } catch (refreshError) {
        const hadToken = Cookies.get('accessToken');
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        if (hadToken) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance
