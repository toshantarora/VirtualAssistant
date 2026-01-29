import React, { useState } from 'react';
import loginImg from '../../assets/login-illustration.png';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import InputBox from '../../components/InputBox';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/authService';
import Notification from '../../components/Notification';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

const ForgotPassword = () => {
  useDocumentTitle('Forgot Password', 'Reset your Virtual Assistant account password');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({
    success: true,
    title: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await forgotPasswordApi(data.email);

      setToastData({
        success: true,
        title: 'Email Sent',
        message: 'Check your email for a temporary password.',
      });
      setShowToast(true);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to process request';
      setToastData({
        success: false,
        title: 'Error',
        message: errorMessage,
      });
      setShowToast(true);
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
      <div className="min-h-screen flex">
        {/* Left Image Section */}
        <div className="hidden md:flex w-1/2 bg-primary py-8 items-center justify-center">
          <img src={loginImg} alt="Virtual Assistant" className="h-auto w-auto object-contain" />
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
            <Link
              to="/login"
              className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft size={18} className="mr-1" /> Back to Login
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h1>
            <p className="text-gray-500 mb-9">
              Enter your email address to receive a temporary password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputBox
                type="email"
                placeholder="Email Address"
                name="email"
                register={register}
                error={errors.email}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-3xl font-semibold hover:bg-green-800 mt-4 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
