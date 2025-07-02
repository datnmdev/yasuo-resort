import React,  { useRef, useEffect } from 'react'

const SignUp = () => {
    const signUpRef = useRef(null)

    useEffect(() => {
    signUpRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    return (
        <div ref={signUpRef} className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
            style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}>

        {/* Bên trái: nội dung giới thiệu */}
        <div className="w-1/2 h-full bg/50 text-white p-10 flex flex-col justify-center">
            <div className='text-center mt-16 mb-12'>
                <p className='text-5xl font-bold text-white'>Join Yasuo Resort</p>
                <p className='text-5xl font-bold text-white'>Experience Tranquility</p>
            </div>
            <div>
                <p className='text-2xl text-white text-center mb-6'>
                    Become part of our lakeside retreat. Book your stay now and receive exclusive member perks,
                    early check-ins, and sunset gatherings at the water’s edge.
                </p>
                <p className='text-2xl text-white text-center mb-16'>
                    Sign up now to unlock the full Yasuo experience, including event invitations, local guides, 
                    and seasonal offers tailored just for you.
                </p>
            </div>
        </div>

        {/* Bên phải: form đăng ký */}
        <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-md rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create Account</h2>
                <form>
                    <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                    type="submit"
                    className="w-full bg-[#0D584D] hover:bg-green-500 text-white font-semibold py-2 rounded-lg transition duration-300 cursor-pointer"
                    >
                    Sign Up
                    </button>
                </form>

                <p className="text-sm mt-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-green-600 hover:underline">
                    Log In
                    </a>
                </p>
            </div>
        </div>
        </div>
    )
}

export default SignUp