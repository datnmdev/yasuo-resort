import React, { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { userAction} from '../../stores/reducers/userReducer'
import apis from '../../apis'

const Login = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const loginRef = useRef(null)
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        loginRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])
    
    const handleLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            alert('Vui lòng nhập đầy đủ email và password.')
            return
        }
    
        try {
            const res = await apis.user.signIn({ email, password })
            const { accessToken, refreshToken } = res.data.data
            setLoginError('');
            //role và id
            const decoded = jwtDecode(accessToken)
            const user = {
                id: decoded.id,
                role: decoded.role,
                status: decoded.status,
                isSuccess: res.data.isSuccess
            }
        
            Cookies.set('accessToken', accessToken, {
                secure: true,
                sameSite: 'None',
                expires: rememberMe ? 7 : 1,
            })
        
            Cookies.set('refreshToken', refreshToken, {
                secure: true,
                sameSite: 'None',
                expires: rememberMe ? 30 : 1,
            })
        
            dispatch(userAction.setUser(user))
        
            // Điều hướng theo role
            if (user.role === 'admin') {
                navigate('/admin/dashboard')
            } else {
                navigate('/')
            }
        } catch (err) {
            const apiMessage = err?.response?.data?.error?.message;
            const fallback = 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
            setLoginError(apiMessage || fallback);
        }
    }

    return (
        <div ref={loginRef} className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
            style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}>
        <div className="w-1/2 h-full text-white p-10 flex flex-col justify-center">
            <p className='text-2xl text-white text-center mb-6'>
                Welcome to Yasuo Resort, a peaceful retreat where you can relax, refresh, and reconnect.  
                With nature all around us and lake views from every room, deck, and pool, we combine the tranquility 
                of a waterside resort with a convenient location just three miles from downtown Saugatuck.  
                </p>
                <p className='text-2xl text-white text-center mb-16'>
                Start your morning with breakfast overlooking Lake Michigan. By day, you can explore the area with 
                our kayaks and bikes, hike the wooded trails on our property, take a dip in the lake, or wander the 
                many shops, galleries, and restaurants in town. At night, come back to watch a spectacular sunset 
                around the fire pits, or snuggle up and stargaze from our deck at the water’s edge.
            </p>
        </div>
  
        <div className="w-1/2 h-full flex items-center justify-center">
          <div className="w-full max-w-md p-8 bg-white/70 rounded-xl shadow-lg backdrop-blur-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Sign In</h2>
            {loginError && (
            <p className="text-red-600 text-sm mb-4 text-center">{loginError}</p>
            )}
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex items-center mb-6">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700">Remember me</label>
              </div>
              <button
                type="submit"
                className="w-full bg-[#0D584D] hover:bg-green-500 text-white font-semibold py-2 rounded-lg"
              >
                Log In
              </button>
            </form>
            <p className="text-sm mt-6 text-center text-gray-600">
              Don't have an account? <Link to="/signup" className="text-green-600 hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
  )
}

export default Login