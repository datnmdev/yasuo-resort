import axios, { HttpStatusCode } from 'axios';
import Cookies from 'js-cookie';

export default function axiosInstance() {
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
        error.response.status === HttpStatusCode.Unauthorized
      ) {
        const refreshToken = (
          await axios({
            url: `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
            method: 'post',
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

  return axiosInstance;
}
