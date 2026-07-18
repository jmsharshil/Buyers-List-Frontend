import React, { useState } from "react";
import { MdEmail } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import { CgAdd } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

import { useBack } from "../hooks/helper";
import UserProfile from "../components/Layout/UserProfile";
import { User, Delete, WandSparkles } from "../icons/AnimatedIcons";

const UserList = () => {
  const navigate = useNavigate();
  const goBack = useBack();

  const [search, setSearch] = useState("");

  const handleAddUser = () => {
    navigate("/add-user");
  };

  const users = [
    { id: 1, name: "Tony Stark", email: "tony.stark@starkindustries.com", role: "Admin" },
    { id: 2, name: "Bruce Wayne", email: "bruce.wayne@wayneenterprises.com", role: "Manager" },
    { id: 3, name: "Diana Prince", email: "diana.prince@themyscira.org", role: "Admin" },
    { id: 4, name: "Clark Kent", email: "clark.kent@dailyplanet.com", role: "User" },


    
    // ... add remaining users here
  ];

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.role].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="bg-gray-100 min-h-screen px-4 pt-6 pb-24 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="flex items-center text-gray-500 hover:text-purple-600 transition-colors"
          >
            <IoMdArrowRoundBack className="w-6 h-6 mr-2" />
            <span className="text-lg font-medium">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            <span className="text-3xl font-light">|</span> User Management
          </h1>
        </div>
         <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">
              <UserProfile />
            </span>
          </div>
      </div>

      {/* User Table */}
      <div className="flex justify-center">
        <div className="w-full max-w-[80%] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Table Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
            <div className="flex gap-5 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name, email, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-72 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddUser}
                className="bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center shadow hover:bg-purple-700 transition"
              >
                <CgAdd className="w-5 h-5 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Table Column Headers */}
          <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 bg-gray-100 border-b border-gray-200 text-gray-700 font-semibold text-base items-center">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2 text-center">Role</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100 text-[15px] sm:text-base">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 px-6 py-5 hover:bg-gray-50 transition items-center"
                >
                  <div className="md:col-span-1  font-medium text-gray-900">
                    {index + 1}
                  </div>

                  <div className="md:col-span-3 flex items-center text-lg gap-2 font-medium text-gray-900">
                    <User stroke="#999999" height={24} />
                    {user.name}
                  </div>

                  <div className="md:col-span-4 text-xl flex items-center text-gray-600">
                    <MdEmail className="w-7 h-7 mr-3 text-gray-400" />
                    {user.email}
                  </div>

                  <div className="md:col-span-2 flex justify-center">
                    <span
                      className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                        user.role === "Admin"
                          ? "bg-green-100 text-green-900"
                          : user.role === "Manager"
                          ? "bg-yellow-100 text-yellow-900"
                          : "bg-blue-100 text-blue-900"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="md:col-span-2 flex gap-4 justify-center">
                    <button className="text-red-500 hover:text-red-700 transition">
                      <Delete stroke="#AB301D" height={25} />
                    </button>
                    <button className="text-blue-500 hover:text-blue-700 transition">
                      <WandSparkles stroke="#258F4A" height={25} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No users found.
              </div>
            )}
          </div>

          {/* Table Footer */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleAddUser}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center shadow hover:bg-purple-700 transition"
            >
              <CgAdd className="w-5 h-5 mr-2" />
              Add New User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
