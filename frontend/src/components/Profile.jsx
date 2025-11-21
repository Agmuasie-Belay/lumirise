import React from "react";
import { Shield, UserIcon, User, Mail, Phone, Calendar } from "lucide-react";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("userInfo")) || {};
  const {
    username = "N/A",
    email = "N/A",
    role = "N/A",
    phone = "(555) 123-4567",
    created_at = "N/A",
  } = user;

  const roleLabel = role.toLowerCase();

  return (
    <>
      {role === "admin" && (
        <div className="w-full text-left  bg-gray-50 ">
          <h2 className="text-3xl font-bold mb-2">Profile</h2>
          <p className="text-gray-600 mb-4">
            View your account information and permissions
          </p>

          <div className="w-full md:w-2/3">
            <div className="flex flex-col p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex flex-row gap-4">
                <div className="grid  place-content-center bg-blue-100 w-16 h-16 text-blue-600 rounded-full aspect-square">
                  <Shield size={40} />
                </div>
                <div className="mb-6 ">
                  <h3 className="text-xl font-semibold">{username}</h3>
                  <p className="uppercase bg-red-600 rounded-xl text-white text-xs text-center font-semibold">
                    {roleLabel}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[16pt] font-semibold mb-2">
                  Basic Information
                </h4>
                <div className="text-sm text-gray-700 space-y-6">
                  <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                    <User className="mt-2 w-5 h-5" />
                    <div>
                      <p>Username:</p> <p>{username}</p>
                    </div>
                  </div>
                  <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                    <Mail className="mt-2 w-5 h-5" />
                    <div>
                      <p>Email Address:</p> <p>{email}</p>
                    </div>
                  </div>
                  <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                    <Phone className="mt-2 w-5 h-5" />
                    <div>
                      <p>Phone Number:</p> <p>{phone}</p>
                    </div>
                  </div>
                  <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                    <Shield className="mt-2 w-5 h-5" />
                    <div>
                      <p>Role:</p> <p>{role}</p>
                    </div>
                  </div>
                  <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                    <Calendar className="mt-2 w-5 h-5" />
                    <div>
                      <p>Member Since:</p> <p>{created_at}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col  p-4 bg-white rounded-2xl shadow-sm mt-6">
              <h4 className="text-md font-semibold mb-2">
                Permissions & Access
              </h4>
              <ul className="text-sm text-gray-700  space-y-2 list-none">
                <li>
                  <span className="inline-flex">
                    <Shield className="text-red-900 w-5 h-5 mr-2" />
                    Full system administration access
                  </span>
                </li>
                <li>
                  <span className="inline-flex">
                    <Shield className="text-red-900 w-5 h-5 mr-2" />
                    Manage all books, members, and genres
                  </span>
                </li>
                <li>
                  <span className="inline-flex">
                    <Shield className="text-red-900 w-5 h-5 mr-2" />
                    Delete records and manage staff
                  </span>
                </li>
                <li>
                  <span className="inline-flex">
                    <Shield className="text-red-900 w-5 h-5 mr-2" />
                    Access all reports and analytics
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {role === "librarian" && (
        <div className="w-full text-left bg-gray-50">
          <h2 className="text-3xl font-bold mb-2">Profile</h2>
          <p className="text-gray-600 mb-4">
            View your account information and permissions
          </p>

          <div className="w-full md:w-2/3">
            <div className="flex flex-col p-4 bg-white rounded-2xl shadow-sm">
              <div className="mb-6">
                
                <div className="flex flex-col">
                  <div className="flex flex-row gap-4">
                    <div className="grid  place-content-center bg-blue-100 w-16 h-16 text-blue-600 rounded-full aspect-square">
                      <UserIcon size={40} />
                    </div>
                    <div className="mb-6 ">
                      <h3 className="text-xl font-semibold">{username}</h3>
                      <p className="uppercase bg-black rounded-xl text-white text-xs text-center font-semibold">
                        {roleLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-[16pt] font-semibold mb-2">
                      Basic Information
                    </h4>
                    <div className="text-sm text-gray-700 space-y-6">
                      <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                        <User className="mt-2 w-5 h-5" />
                        <div>
                          <p>Username:</p> <p>{username}</p>
                        </div>
                      </div>
                      <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                        <Mail className="mt-2 w-5 h-5" />
                        <div>
                          <p>Email Address:</p> <p>{email}</p>
                        </div>
                      </div>
                      <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                        <Phone className="mt-2 w-5 h-5" />
                        <div>
                          <p>Phone Number:</p> <p>{phone}</p>
                        </div>
                      </div>
                      <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                        <UserIcon className="mt-2 w-5 h-5" />
                        <div>
                          <p>Role:</p> <p>{role}</p>
                        </div>
                      </div>
                      <div className="flex p-4 gap-x-2 bg-gray-100 rounded-md">
                        <Calendar className="mt-2 w-5 h-5" />
                        <div>
                          <p>Member Since:</p> <p>{created_at}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-white rounded-2xl shadow-sm mt-6">
              <h4 className="text-md font-semibold mb-2">
                Permissions & Access
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Your current role permissions
              </p>
              <ul className="text-sm text-gray-700 list-none  space-y-2">
                <li>
                  <span className="inline-flex">
                    <UserIcon className="text-green-900 w-5 h-5 mr-2" />
                    Manage books and members
                  </span>
                </li>
                <li>
                  <span className="inline-flex">
                    <UserIcon className="text-green-900 w-5 h-5 mr-2" />
                    Handle borrow/return operations
                  </span>
                </li>
                <li>
                  <span className="inline-flex">
                    <UserIcon className="text-green-900 w-5 h-5 mr-2" />
                    View basic reports
                  </span>
                </li>
                <li>
                  <span className="inline-flex">
                    <UserIcon className="text-green-900 w-5 h-5 mr-2" />
                    Cannot delete records or manage genres
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
