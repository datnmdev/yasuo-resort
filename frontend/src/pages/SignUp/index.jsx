import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apis from '../../apis';

const SignUp = () => {
  const signUpRef = useRef(null);

  const [step, setStep] = useState(1);

  const [signUpError, setSignUpError] = useState('');
  const [otpError, setOtpError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+84',
    cccd: '',
    dob: '',
    gender: 'male',
    identityIssuedAt: '',
    identityIssuedPlace: '',
    permanentAddress: '',
  });

  const [otp, setOtp] = useState('');
  // Loading states
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  //lấy data từ form
  const handleChangeForm = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (signUpError) setSignUpError('');
  };

  const handleChangeOtp = (e) => {
    setOtp(e.target.value);
    if (otpError) setOtpError('');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.password) {
      setSignUpError('Please fill in name, email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSignUpError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setSignUpError('Password must be at least 6 characters.');
      return;
    }
    if (!formData.dob) {
      setSignUpError('Please select your date of birth.');
      return;
    }
    // Age must be at least 15
    try {
      const today = new Date();
      const dob = new Date(formData.dob);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (isNaN(age) || age < 15) {
        setSignUpError('You must be at least 15 years old to sign up.');
        return;
      }
    } catch (e) {
      setSignUpError('Invalid date of birth.');
      return;
    }

    setSignUpError('');
    setSignUpLoading(true);
    try {
      await apis.user.signUp(formData);
      setStep(2);
    } catch (error) {
      let messageApi = 'Sign up failed. Please try again.';
      const errMsg = error?.response?.data?.error?.message;
      if (Array.isArray(errMsg)) {
        messageApi = errMsg.join(', ');
      } else if (typeof errMsg === 'string') {
        messageApi = errMsg;
      }
      setSignUpError(messageApi);
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    try {
      await apis.user.verifyOtp(formData.email, otp);
      setStep(3);
    } catch (err) {
      console.log('otp error:', err);
      const message = err?.response?.data?.error?.message || 'OTP verification failed.';
      setOtpError(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    try {
      await apis.user.sendOtp(formData.email);
      setOtpError('OTP has been sent to your email');
    } catch (err) {
      const message = err?.response?.data?.error?.message || 'Failed to resend OTP. Please try again.';
      setOtpError(message);
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    signUpRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Clear sign-up error whenever any field changes (covers custom handlers like phone input)
  useEffect(() => {
    if (signUpError) setSignUpError('');
  }, [formData]);

  return (
    <>
      {step === 1 && (
        <div
          ref={signUpRef}
          className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
          style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}
        >
          {/* Bên trái: nội dung giới thiệu */}
          <div className="w-1/2 h-full bg/50 text-white p-10 flex flex-col justify-center">
            <div className="text-center mt-16 mb-12">
              <p className="text-5xl font-bold text-white">Join Yasuo Resort</p>
              <p className="text-5xl font-bold text-white">Experience Tranquility</p>
            </div>
            <div>
              <p className="text-2xl text-white text-center mb-6">
                Become part of our lakeside retreat. Book your stay now and receive exclusive member perks, early
                check-ins, and sunset gatherings at the water’s edge.
              </p>
              <p className="text-2xl text-white text-center mb-16">
                Sign up now to unlock the full Yasuo experience, including event invitations, local guides, and seasonal
                offers tailored just for you.
              </p>
            </div>
          </div>

          {/* Bên phải: form đăng ký */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-2xl p-8 bg-white/70 backdrop-blur-md rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create Account</h2>
              {signUpError && <p className="text-red-600 text-sm mb-4 text-center">{signUpError}</p>}
              <form onSubmit={handleSignUp}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Phone</label>
                      <div className="flex">
                        <input
                          type="text"
                          value="+84"
                          disabled
                          className="w-20 px-3 py-2 border border-r-0 rounded-l-lg text-gray-700"
                          aria-label="Country code"
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={(formData.phone && formData.phone.startsWith('+84')) ? formData.phone.slice(3) : formData.phone}
                          placeholder="Enter phone number"
                          className="flex-1 px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          onChange={(e) => {
                            const digits = (e.target.value || '').replace(/[^0-9]/g, '');
                            setFormData((prev) => ({ ...prev, phone: '+84' + digits }));
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">ID card</label>
                      <input
                        type="text"
                        name="cccd"
                        placeholder='ID card include 12 number'
                        value={formData.cccd}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                        pattern="[0-9]{12}"
                      />
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                        max={(() => {
                          const d = new Date();
                          d.setFullYear(d.getFullYear() - 15);
                          return d.toISOString().split('T')[0];
                        })()}
                        required
                        aria-label="Date of Birth"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Identity Issued Place</label>
                      <input
                        type="text"
                        name="identityIssuedPlace"
                        value={formData.identityIssuedPlace}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Identity Issued At</label>
                      <input
                        type="date"
                        name="identityIssuedAt"
                        value={formData.identityIssuedAt}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Permanent Address</label>
                      <input
                        type="text"
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onChange={handleChangeForm}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-[#0D584D] hover:bg-teal-500 text-white font-semibold py-2 rounded-lg transition duration-300 cursor-pointer"
                  disabled={signUpLoading}
                >
                  {signUpLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </form>

              <p className="text-sm mt-6 text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-600 hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div
          ref={signUpRef}
          className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
          style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}
        >
          {/* Bên trái: nội dung giới thiệu */}
          <div className="w-1/2 h-full bg/50 text-white p-10 flex flex-col justify-center">
            <div className="text-center mt-16 mb-12">
              <p className="text-5xl font-bold text-white">Join Yasuo Resort</p>
              <p className="text-5xl font-bold text-white">Experience Tranquility</p>
            </div>
            <div>
              <p className="text-2xl text-white text-center mb-6">
                Become part of our lakeside retreat. Book your stay now and receive exclusive member perks, early
                check-ins, and sunset gatherings at the water’s edge.
              </p>
              <p className="text-2xl text-white text-center mb-16">
                Sign up now to unlock the full Yasuo experience, including event invitations, local guides, and seasonal
                offers tailored just for you.
              </p>
            </div>
          </div>
          {/* Bên phải: form otp */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-md rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Verify Account</h2>
              <p>An otp has sent to {formData.email}. Please check.</p>
              {otpError && <p className="text-red-600 text-sm mb-4 text-center">{otpError}</p>}
              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  placeholder="OTP"
                  name="otp"
                  className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  onChange={handleChangeOtp}
                  value={otp}
                />
                <button
                  type="submit"
                  className="w-full bg-[#0D584D] hover:bg-teal-500 text-white font-semibold py-2 rounded-lg transition duration-300 cursor-pointer mb-2"
                  disabled={verifyLoading}
                >
                  {verifyLoading ? 'Đang xác thực...' : 'Verify OTP'}
                </button>
                <button
                  onClick={handleResendOtp}
                  className="w-full bg-[#0D584D] hover:bg-teal-500 text-white font-semibold py-2 rounded-lg transition duration-300 cursor-pointer"
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Đang gửi lại OTP...' : 'Resend OTP'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div
          ref={signUpRef}
          className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
          style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}
        >
          {/* Bên trái: nội dung giới thiệu */}
          <div className="w-1/2 h-full bg/50 text-white p-10 flex flex-col justify-center">
            <div className="text-center mt-16 mb-12">
              <p className="text-5xl font-bold text-white">Join Yasuo Resort</p>
              <p className="text-5xl font-bold text-white">Experience Tranquility</p>
            </div>
            <div>
              <p className="text-2xl text-white text-center mb-6">
                Become part of our lakeside retreat. Book your stay now and receive exclusive member perks, early
                check-ins, and sunset gatherings at the water’s edge.
              </p>
              <p className="text-2xl text-white text-center mb-16">
                Sign up now to unlock the full Yasuo experience, including event invitations, local guides, and seasonal
                offers tailored just for you.
              </p>
            </div>
          </div>
          {/* Bên phải: form otp */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-md rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Thanks for joining us</h2>
              <Link to="/login" className="text-teal-600 hover:underline">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;
