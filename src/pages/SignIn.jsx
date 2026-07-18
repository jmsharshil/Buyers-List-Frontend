import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/ui/Card";
import allAssets from "../assets/assets";
import CustomLoader from "../components/ui/CustomLoader";
import ErrorDialog from "../components/ui/ErrorDialog";
import { microsoftLogin } from "../store/slice/signInSlice";

const SignIn = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.signIn);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleLogin = () => {
    dispatch(microsoftLogin());
  };

  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-xl mx-auto p-8 text-center bg-white rounded-2xl shadow-2xl">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-[#4F46E5] rounded-lg flex items-center justify-center mb-6">
            <img
              src={allAssets.Logo}
              alt="Knowcraft Analytics Logo"
              className="w-8 h-8"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Knowcraft Analytics
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Sign in with your Microsoft account to continue
          </p>
        </div>
        {loading ? (
          <CustomLoader />
        ) : (
          <button
            onClick={handleLogin}
            className="w-full py-4 px-6 cursor-pointer bg-[#4F46E5] text-white rounded-xl text-xl font-semibold flex items-center justify-center gap-3 shadow-xl "
          >
            Sign in with Microsoft
            <img
              src={allAssets.MicrosoftIcon}
              alt="Microsoft Logo"
              className="w-6 h-6"
            />
          </button>
        )}
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
