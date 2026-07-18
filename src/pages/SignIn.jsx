import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/ui/Card";
import allAssets from "../assets/assets";
import CustomLoader from "../components/ui/CustomLoader";
import ErrorDialog from "../components/ui/ErrorDialog";
import { buyersLogin } from "../store/slice/signInSlice";
import { useNavigate } from "react-router-dom";
import knowcraftLogo from "../assets/Knowcraft-Analytics.png";

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.signIn);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  const handlePinChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData) {
      const newPin = [...pin];
      for (let i = 0; i < pastedData.length; i++) {
        newPin[i] = pastedData[i];
      }
      setPin(newPin);
      if (pastedData.length < 4) {
        inputRefs.current[pastedData.length].focus();
      } else {
        inputRefs.current[3].focus();
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fullPin = pin.join("");
    if (fullPin.length !== 4) return;
    try {
      await dispatch(buyersLogin({ email, pin: parseInt(fullPin, 10) })).unwrap();
      navigate("/buyerslist-dashboard");
    } catch (err) {
      // Error is handled in the slice and displayed via ErrorDialog
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5 relative overflow-hidden bg-[#f8fafc]">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/20 mix-blend-multiply blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-400/20 mix-blend-multiply blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[15%] w-[25vw] h-[25vw] rounded-full bg-blue-300/20 mix-blend-multiply blur-[60px]"></div>
      
      <Card className="max-w-xl w-full mx-auto p-10 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/80 relative z-10">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center justify-center px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <img
                src={knowcraftLogo}
                alt="Knowcraft Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 via-indigo-600 to-purple-800">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Enter your credentials to securely access your platform
          </p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 text-left mb-2 pl-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 text-left mb-2 pl-1">
              Security PIN
            </label>
            <div className="flex gap-4 justify-between mt-2">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="password"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-full h-14 text-center text-2xl rounded-2xl bg-gray-50/50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-gray-800 font-bold"
                  required
                />
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-2">
              <CustomLoader />
            </div>
          ) : (
            <button
              type="submit"
              className="w-full mt-4 py-4 px-6 cursor-pointer bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-2xl text-lg font-bold hover:shadow-[0_8px_25px_rgba(79,70,229,0.35)] hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 active:scale-[0.98]"
            >
              Sign in to Dashboard
            </button>
          )}
        </form>
      </Card>
      <ErrorDialog
        message={error}
        onClose={() => setShowErrorDialog(false)}
        isOpen={showErrorDialog}
      />
    </div>
  );
};

export default SignIn;
