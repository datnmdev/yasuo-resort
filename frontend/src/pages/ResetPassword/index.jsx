import { useRef, useEffect, useState } from 'react';
import apis from '@apis/index';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const resetPasswordRef = useRef(null);
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');

  useEffect(() => {
    resetPasswordRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  // Bước 1: Gửi OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apis.user.sendOtp(email);
      setStep(2);
    } catch (error) {
      setError(error?.response?.data?.error?.message || 'Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('check email', email, otp);
      const res = await apis.user.verifyForgotPassword(email, otp);
      setResetCode(res.data.data.code);
      setStep(3);
    } catch (error) {
      setError(error?.response?.data?.error?.message || 'OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đổi mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apis.user.resetPassword(email, newPassword, resetCode);
      setStep(4);
    } catch (error) {
      setError(error?.response?.data?.error?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step === 1 && (
        <div
          ref={resetPasswordRef}
          className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
          style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}
        >
          <div className="w-1/2 h-full text-white p-10 flex flex-col justify-center">
            <p className="text-2xl text-white text-center mb-6">
              Welcome to Yasuo Resort, a peaceful retreat where you can relax, refresh, and reconnect.
            </p>
            <p className="text-2xl text-white text-center mb-16">
              Start your morning with breakfast overlooking Lake Michigan. By day, you can explore the area with our
              kayaks and bikes, hike the wooded trails on our property, take a dip in the lake, or wander the many
              shops, galleries, and restaurants in town. At night, come back to watch a spectacular sunset around the
              fire pits, or snuggle up and stargaze from our deck at the water’s edge.
            </p>
          </div>
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white/70 rounded-xl shadow-lg backdrop-blur-md">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Reset Password - Enter your email</h2>
              {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
              <form onSubmit={handleSendOTP}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#0D584D] hover:bg-teal-500 text-white font-semibold py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi OTP...' : 'Send OTP'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div
          ref={resetPasswordRef}
          className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
          style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}
        >
          <div className="w-1/2 h-full text-white p-10 flex flex-col justify-center">
            <p className="text-2xl text-white text-center mb-6">
              Welcome to Yasuo Resort, a peaceful retreat where you can relax, refresh, and reconnect.
            </p>
            <p className="text-2xl text-white text-center mb-16">
              Start your morning with breakfast overlooking Lake Michigan. By day, you can explore the area with our
              kayaks and bikes, hike the wooded trails on our property, take a dip in the lake, or wander the many
              shops, galleries, and restaurants in town. At night, come back to watch a spectacular sunset around the
              fire pits, or snuggle up and stargaze from our deck at the water’s edge.
            </p>
          </div>
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white/70 rounded-xl shadow-lg backdrop-blur-md">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Enter the OTP sent to your email</h2>
              {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
              <form onSubmit={handleVerifyOTP}>
                <input
                  type="text"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#0D584D] hover:bg-teal-500 text-white font-semibold py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Đang xác thực...' : 'Verify OTP'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div
          ref={resetPasswordRef}
          className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
          style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}
        >
          <div className="w-1/2 h-full text-white p-10 flex flex-col justify-center">
            <p className="text-2xl text-white text-center mb-6">
              Welcome to Yasuo Resort, a peaceful retreat where you can relax, refresh, and reconnect.
            </p>
            <p className="text-2xl text-white text-center mb-16">
              Start your morning with breakfast overlooking Lake Michigan. By day, you can explore the area with our
              kayaks and bikes, hike the wooded trails on our property, take a dip in the lake, or wander the many
              shops, galleries, and restaurants in town. At night, come back to watch a spectacular sunset around the
              fire pits, or snuggle up and stargaze from our deck at the water’s edge.
            </p>
          </div>
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white/70 rounded-xl shadow-lg backdrop-blur-md">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Enter your new password</h2>
              {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
              <form onSubmit={handleResetPassword}>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#0D584D] hover:bg-teal-500 text-white font-semibold py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Đang đổi mật khẩu...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {step === 4 && (
        <div
          ref={resetPasswordRef}
          className="w-max-[1200px] h-screen bg-cover bg-center flex p-7"
          style={{ backgroundImage: "url('/homepage-image-1.jpg')" }}
        >
          <div className="w-1/2 h-full text-white p-10 flex flex-col justify-center">
            <p className="text-2xl text-white text-center mb-6">
              Welcome to Yasuo Resort, a peaceful retreat where you can relax, refresh, and reconnect.
            </p>
            <p className="text-2xl text-white text-center mb-16">
              Start your morning with breakfast overlooking Lake Michigan. By day, you can explore the area with our
              kayaks and bikes, hike the wooded trails on our property, take a dip in the lake, or wander the many
              shops, galleries, and restaurants in town. At night, come back to watch a spectacular sunset around the
              fire pits, or snuggle up and stargaze from our deck at the water’s edge.
            </p>
          </div>
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white/70 rounded-xl shadow-lg backdrop-blur-md flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Đổi mật khẩu thành công!</h2>
              <a href="/login" className="text-teal-600 hover:underline">
                Quay lại đăng nhập
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPassword;
