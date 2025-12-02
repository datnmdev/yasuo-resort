import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { userAction } from '../../stores/reducers/userReducer';
import apis from '../../apis';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginRef = useRef(null);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    loginRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Tự động điền mật khẩu nếu Remember me
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const res = await apis.user.signIn({ email, password });
      const { accessToken, refreshToken } = res.data.data;
      setLoginError('');
      // Lưu email và password nếu Remember me
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }
      //role và id
      const decoded = jwtDecode(accessToken);
      const user = {
        id: decoded.id,
        role: decoded.role,
        status: decoded.status,
        isSuccess: res.data.isSuccess,
      };

      Cookies.set('accessToken', accessToken, {
        secure: true,
        sameSite: 'None',
        expires: rememberMe ? 7 : 1,
      });

      Cookies.set('refreshToken', refreshToken, {
        secure: true,
        sameSite: 'None',
        expires: rememberMe ? 30 : 1,
      });

      dispatch(userAction.setUser(user));

      // Điều hướng theo role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const apiMessage = err?.response?.data?.error?.message;
      const fallback = 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
      setLoginError(apiMessage || fallback);
    }
  };

  return (
    <div
      ref={loginRef}
      className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
      style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}
    >
      <div className="w-1/2 h-full text-white p-10 flex flex-col justify-center">
        <p className="text-2xl text-white text-center mb-6">
          Welcome to Yasuo Resort, a peaceful retreat where you can relax, refresh, and reconnect. With nature all
          around us and lake views from every room, deck, and pool, we combine the tranquility of a waterside resort
          with a convenient location just three miles from downtown Saugatuck.
        </p>
        <p className="text-2xl text-white text-center mb-16">
          {`Start your morning with breakfast overlooking Lake Michigan. By day, you can explore the area with our kayaks
          and bikes, hike the wooded trails on our property, take a dip in the lake, or wander the many shops,
          galleries, and restaurants in town. At night, come back to watch a spectacular sunset around the fire pits, or
          snuggle up and stargaze from our deck at the water's edge.`}
        </p>
      </div>

      <div className="w-1/2 h-full flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white/70 rounded-xl shadow-lg backdrop-blur-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Sign In</h2>
          {loginError && <p className="text-red-600 text-sm mb-4 text-center">{loginError}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.952 6.1 7.5 9.75 7.5 1.622 0 3.19-.457 4.52-1.277M21.75 12c-.511-.99-1.24-2.053-2.12-3.077m-2.527-2.568C15.136 5.679 13.62 4.5 12 4.5c-1.62 0-3.136 1.179-5.103 2.855m10.206 0A10.478 10.478 0 0 1 21.75 12c-2.036 3.952-6.1 7.5-9.75 7.5-1.622 0-3.19-.457-4.52-1.277m10.206-10.223L3.98 8.223m0 0L12 19.5m0 0l8.02-11.277"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6.25 0c-2.036 3.952-6.1 7.5-9.75 7.5s-7.714-3.548-9.75-7.5C4.286 8.048 8.35 4.5 12 4.5s7.714 3.548 9.75 7.5z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center mb-6">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0D584D] hover:bg-teal-500 text-white font-semibold py-2 rounded-lg"
            >
              Log In
            </button>
          </form>
          <p className="text-sm mt-6 text-center text-gray-600">
            forgot password?{' '}
            <Link to="/reset-password" className="text-teal-600 hover:underline">
              Reset Password
            </Link>
          </p>
          <p className="text-sm mt-6 text-center text-gray-600">
            {`Don't have an account?`}{' '}
            <Link to="/signup" className="text-teal-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
