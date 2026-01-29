import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import loginImg from '../../assets/login-illustration.png';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { loginSchema } from '../../validations/loginSchema';
import InputBox from '../../components/InputBox';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { loginApi } from '../../services/authService';
import Notification from '../../components/Notification';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const Login = () => {
  useDocumentTitle('Login', 'Login to access the Virtual Assistant admin dashboard');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({
    success: true,
    title: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await loginApi(data);
      const token = res?.data?.token;

      login(token, res?.data);
      setToastData({
        success: true,
        title: res?.message,
        message: 'Welcome back to the dashboard',
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Invalid email or password';
      setToastData({
        success: false,
        title: 'Login Failed',
        message: errorMessage,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Notification
        show={showToast}
        setShow={setShowToast}
        success={toastData.success}
        title={toastData.title}
        message={toastData.message}
      />
      <div className="min-h-screen  flex">
        {/* Left Image Section */}
        <div className="hidden md:flex w-1/2 bg-primary py-8 items-center justify-center">
          <img
            src={loginImg}
            alt="Virtual Assistant"
            //className="w-full h-full  object-cover"
            className="h-auto w-auto object-contain"
          />
        </div>

        {/* Right Login Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-500 mb-9">Log in to access the admin dashboard.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-4  border-grey  rounded-3xl border  focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-4 border-grey border rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary"
            /> */}
              <InputBox
                type="email"
                placeholder="Email Address"
                name="email"
                register={register}
                error={errors.email}
              />

              <div className="relative">
                <InputBox
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  name="password"
                  register={register}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
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
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="text-right flex justify-between items-center">
<div/>
              {/*  <Link to="/signup" className="text-sm text-primary hover:underline">
                  Create an Account
                </Link> */}
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-3xl font-semibold hover:bg-green-800 mt-4 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
