import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaUserMd,
  FaHospitalUser,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaAddressCard,
} from "react-icons/fa";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [showAppointments, setShowAppointments] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };

  const toggleAppointments = async () => {
    const shouldShow = !showAppointments;
    setShowAppointments(shouldShow);
    setProfileMenuOpen(false);

    if (!shouldShow) return;

    const decoded = decodeJWT(token);
    const patientId = decoded?.id || decoded?._id;

    if (!patientId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:9090/appointmentsbook/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setShowAppointments(false);
    setProfileMenuOpen(false);
    navigate("/login");
  };

  const handleProfileClick = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const goToProfile = () => {
    setProfileMenuOpen(false);
    navigate("/profile");
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 px-6 py-10 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Top-right Profile or Login */}
      <div className="absolute top-6 right-6 z-10">
        {!token ? (
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-teal-700 transition"
          >
            Login
          </motion.button>
        ) : (
          <div className="relative">
            <button onClick={handleProfileClick}>
              <FaUserCircle className="text-4xl text-teal-700 hover:text-teal-800 transition" />
            </button>

            {profileMenuOpen && (
              <motion.div
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-teal-100 py-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <button
                  onClick={goToProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 transition"
                >
                  <FaAddressCard className="mr-2" /> Create/View Profile
                </button>
                <button
                  onClick={toggleAppointments}
                  className="flex items-center w-full px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 transition"
                >
                  <FaHistory className="mr-2" /> Previous Appointments
                </button>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Main Heading */}
      <motion.h1
        className="text-5xl font-extrabold text-teal-800 text-center mb-6"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Welcome to AmedicK
      </motion.h1>

      <motion.p
        className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Book appointments with trusted doctors easily and quickly.
      </motion.p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-xl text-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/quick-appointment")}
        >
          <FaCalendarCheck className="text-4xl mx-auto mb-4 text-teal-600" />
          <h2 className="font-semibold text-lg">Quick Appointments</h2>
          <p className="text-gray-600 text-sm mt-2">Book instantly, no queues.</p>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl shadow-xl text-center"
          whileHover={{ scale: 1.05 }}
        >
          <FaUserMd className="text-4xl mx-auto mb-4 text-teal-600" />
          <h2 className="font-semibold text-lg">Expert Doctors</h2>
          <p className="text-gray-600 text-sm mt-2">Certified and experienced.</p>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl shadow-xl text-center"
          whileHover={{ scale: 1.05 }}
        >
          <FaHospitalUser className="text-4xl mx-auto mb-4 text-teal-600" />
          <h2 className="font-semibold text-lg">24/7 Help</h2>
          <p className="text-gray-600 text-sm mt-2">Always available for you.</p>
        </motion.div>
      </div>

      {/* Previous Appointments Button */}
      {token && (
        <div className="text-center mb-12">
          <motion.button
            onClick={toggleAppointments}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-teal-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold hover:bg-teal-800 transition"
          >
            🕒 Previous Appointments
          </motion.button>
        </div>
      )}

      {/* Appointments Section */}
      <AnimatePresence>
        {showAppointments && (
          <motion.div
            className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-blue-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-teal-800 mb-4">
              Your Previous Appointments
            </h2>

            {loading ? (
              <p className="text-gray-500 text-center">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500 italic text-center">No appointments to show.</p>
            ) : (
              <ul className="space-y-4">
                {appointments.map((appt) => (
                  <li
                    key={appt._id}
                    className="border border-gray-200 p-4 rounded-xl shadow-sm bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-teal-700">
                          {appt.doctorId?.name || "Doctor"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appt.doctorId?.specialization || "Specialist"} | {appt.date} @{" "}
                          {appt.time}
                        </p>
                      </div>
                      <span className="text-sm px-2 py-1 rounded-full bg-teal-100 text-teal-700 font-medium">
                        {appt.status}
                      </span>
                    </div>
                    {appt.symptoms && (
                      <p className="text-gray-700 mt-2">
                        <span className="font-medium">Symptoms:</span> {appt.symptoms}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
