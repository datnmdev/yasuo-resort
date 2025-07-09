import React,  { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router'
import apis from '../../apis'

const SignUp = () => {
    const signUpRef = useRef(null)

    const [step, setStep] = useState(1);

    const [signUpError, setSignUpError] = useState("")
    const [otpError, setOtpError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        cccd: "",
        dob: "",
        gender: "male",
        identityIssuedAt: "",
        identityIssuedPlace: "",
        permanentAddress: "",
    });

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    //lấy data từ form
    const handleChangeForm = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleChangeOtp = (e) => {
        setOtp(e.target.value)
    }

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await apis.user.signUp(formData);
            setStep(2)
        } catch (error) {
            const messageApi = error.response.data?.error?.message
            setSignUpError(messageApi)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const resOtp = await apis.user.verifyOtp(formData.email,otp);
            setStep(3)
        } catch (err) {
            const message = err.response?.data?.error?.message || "OTP verification failed.";
            setOtpError(message);
        }
    }

    const handleResendOtp = async (e) =>{
        e.preventDefault();
        await apis.user.sendOtp(formData.email);
    }

    useEffect(() => {
    signUpRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    return (
        <>
            {step === 1 &&
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
                            {signUpError && (
                            <p className="text-red-600 text-sm mb-4 text-center">{signUpError}</p>
                            )}
                            <form onSubmit={handleSignUp}>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    name="name"
                                    defaultValue=""
                                    value={formData.name}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    defaultValue=""
                                    value={formData.email}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    defaultValue=""
                                    value={formData.password}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                />
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    name="phone"
                                    defaultValue=""
                                    value={formData.phone}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                />
                                <input
                                    type="text"
                                    placeholder="CCCD/ID Number"
                                    name="cccd"
                                    defaultValue=""
                                    value={formData.cccd}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                />
                                <input
                                    type="date"
                                    placeholder="Date of Birth"
                                    name="dob"
                                    defaultValue=""
                                    value={formData.dob}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                />
                                <select
                                    name="gender"
                                    defaultValue=""
                                    value={formData.gender}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Identity Issued Place"
                                    name="identityIssuedPlace"
                                    defaultValue=""
                                    value={formData.identityIssuedPlace}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                />
                                <input
                                    type="date"
                                    placeholder="Identity Issued At"
                                    name="identityIssuedAt"
                                    defaultValue=""
                                    value={formData.identityIssuedAt}
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
                                />
                                <input
                                    type="text"
                                    placeholder="Permanent Address"
                                    name="permanentAddress"
                                    defaultValue=""
                                    value={formData.permanentAddress}
                                    className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeForm}
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
                                <Link to="/login" className="text-green-600 hover:underline">
                                Log In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            }
            {step === 2 &&
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
                    {/* Bên phải: form otp */}
                    <div className="w-1/2 h-full flex items-center justify-center">
                        <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-md rounded-xl shadow-lg">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Verify Account</h2>
                            <p>An otp has send to {formData.email}. Please check.</p>
                            {otpError && (
                                <p className="text-red-600 text-sm mb-4 text-center">{otpError}</p>
                            )}
                            <form onSubmit={handleVerifyOtp}>
                                <input
                                    type="text"
                                    placeholder="Otp"
                                    name="otp"
                                    defaultValue=""
                                    className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={handleChangeOtp}
                                />
                                
                                <button
                                    type="submit"
                                    className="w-full bg-[#0D584D] hover:bg-green-500 text-white font-semibold py-2 rounded-lg transition duration-300 cursor-pointer"
                                >
                                    Send OTP
                                </button>
                                <button
                                    onClick={handleResendOtp}
                                    className="w-full bg-[#0D584D] hover:bg-green-500 text-white font-semibold py-2 rounded-lg transition duration-300 cursor-pointer"
                                >
                                    Resend Otp
                                </button>
                            </form>
                        </div>
                    </div>
                    
                </div>
            }
            {step === 3 && 
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
                    {/* Bên phải: form otp */}
                    <div className="w-1/2 h-full flex items-center justify-center">
                        <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-md rounded-xl shadow-lg">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Thanks for joining us</h2>
                            <Link to="/login" className="text-green-600 hover:underline">Go to Login</Link>
                        </div>
                    </div>
                
                </div>
            }
        </>
        
    )
}

export default SignUp