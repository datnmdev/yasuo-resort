import { Link } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, userAction } from '../../stores/reducers/userReducer';
import Cookies from 'js-cookie';
import { Button } from '@ui/button';
import { FileText, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { Avatar } from '@ui/avatar';

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
      <div className="hidden md:flex items-center space-x-4 mt-12">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-transparent hover:border-gray-300"
              >
                <Avatar className="center-both">
                  <User />
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/contracts" className="flex items-center">
                  {' '}
                  {/* New link for Contracts */}
                  <FileText className="w-4 h-4 mr-2" />
                  My Contracts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-teal-700 border border-teal-200 hover:bg-teal-50"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default SignIn;
