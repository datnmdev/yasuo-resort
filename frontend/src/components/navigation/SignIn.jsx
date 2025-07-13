import { Link } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, userAction } from '../../stores/reducers/userReducer';
import Cookies from 'js-cookie';

const SignIn = () => {
  const isLoggedIn = useSelector(userSelector.isLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    dispatch(userAction.logout());
    navigate('/');
  };

  return (
    <>
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="p-5 px-6 py-3 bg-[#0D584D] hover:bg-[#30dec4] text-white font-semibold rounded-xl shadow-md transition duration-300 ease-in-out cursor-pointer"
        >
          Log out
        </button>
      ) : (
        <Link
          to="/login"
          className="p-5 px-6 py-3 bg-[#0D584D] hover:bg-[#30dec4] text-white font-semibold rounded-xl shadow-md transition duration-300 ease-in-out cursor-pointer"
        >
          Sign in
        </Link>
      )}
    </>
  );
};

export default SignIn;
