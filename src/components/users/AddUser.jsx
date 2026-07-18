import React from "react";
import Card from "../ui/Card";
import InputField from "../ui/InputField";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import UserProfile from "../Layout/UserProfile";
import { useBack } from "../../hooks/helper";

const AddUser = () => {
  const navigate = useNavigate();
  const handleAddUser = () => {
    // Logic to add user can be implemented here
    navigate("/users");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 relative">
      {/* Back button - positioned outside the card */}
      <div className="absolute flex justify-between top-6 left-6">
        <button
          onClick={useBack()}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <Card className="w-[500px] mx-auto p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Enter user details
        </h2>
        <div className="space-y-6">
          <InputField
            label="User Email :"
            type="email"
            placeholder="Enter email"
          />
          <InputField
            label="Select Role :"
            type="select"
            options={[
              { value: "MANAGER", label: "MANAGER" },
              { value: "ADMIN", label: "ADMIN" },
            ]}
          />
          <button
            onClick={handleAddUser}
            className="w-full py-3 px-6 bg-[#4F46E5] text-white rounded-lg font-medium "
          >
            ADD USER
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AddUser;
