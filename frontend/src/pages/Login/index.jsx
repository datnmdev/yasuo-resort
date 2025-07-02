import React, { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router'

const Login = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = (e) => {
        e.preventDefault()

        if (!email || !password) {
            alert('Vui lòng nhập đầy đủ email và password.')
            return
        }

        // giả lập gửi API
        console.log('Đăng nhập với:', { email, password })

        // đăng nhập thành công
        alert('Đăng nhập thành công!')
    }

    const loginRef = useRef(null)

    useEffect(() => {
        loginRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, [])

    return (
    <div ref={loginRef} className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
         style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}>
        
        <div className="w-1/2 h-full bg/50 text-white p-10 flex flex-col justify-center">
            <div className='text-center mt-16 mb-12'>
                <p className='text-5xl font-bold text-white'>
                    Experience Saugatuck 
                </p>
                <p className='text-5xl font-bold text-white'>
                    & Stay on Lake Michigan
                </p>
            </div>
            <div className=''>
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
        </div>

        <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg bg-white/70 backdrop-blur-md ">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Sign In</h2>
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
                className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                type="submit"
                className="w-full bg-[#0D584D] hover:bg-green-500 text-white font-semibold py-2 rounded-lg transition duration-300 cursor-pointer"
                >
                Log In
                </button>
            </form>

            <p className="text-sm mt-6 text-center text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-green-600 hover:underline">
                Sign Up
                </Link>
            </p>
            </div>
        </div>
    </div>
  )
}

export default Login