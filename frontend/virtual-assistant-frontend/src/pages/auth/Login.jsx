import React, { useState } from "react";
import loginImg from "../../assets/login-illustration.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginSchema } from "../../validations/loginSchema";
import InputBox from "../../components/InputBox";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { loginApi } from "../../services/authService";
import Notification from "../../components/Notification";

const Login = () => {
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
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
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
        message: "Welcome back to the dashboard",
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Invalid email or password";
      setToastData({
        success: false,
        title: "Login Failed",
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
            className="max-h-full w-auto object-contain"
          />
        </div>

        {/* Right Login Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-500 mb-9">
              Log in to access the admin dashboard.
            </p>

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

              <InputBox
                type="password"
                placeholder="Password"
                name="password"
                register={register}
                error={errors.password}
              />

              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Forget password?
                </button>
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
                  "Log in"
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
