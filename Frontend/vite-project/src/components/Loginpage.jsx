import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Loginpage() {
  const navigate = useNavigate();
  const [hide, setHide] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ email: "", password: "" });

  const handleHide = () => setHide(!hide);

  const handleForm = (e) => {
    setError("");
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { email, password } = data;
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:9090/user/login",
        { email, password },
        { withCredentials: true }
      );
      console.log(response.data);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed");
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.7, transition: { duration: 0.3 } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2 },
    }),
  };

  const errorVariants = {
    hidden: { x: 0 },
    visible: {
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-100"
    >
      <div className="w-full sm:w-[400px] bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold text-center text-teal-700 mb-6"
        >
          Welcome Back 👋
        </motion.h1>

        {error && (
          <motion.div
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            className="bg-red-100 border border-red-400 text-red-700 p-2 rounded-md mb-4 text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.label
          htmlFor="email"
          className="block text-gray-700 font-semibold mb-2"
          custom={0}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
        >
          Email Address
        </motion.label>
        <motion.input
          id="email"
          type="email"
          name="email"
          value={data.email}
          onChange={handleForm}
          className="w-full p-3 border border-teal-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-blue-50"
          custom={0.1}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
        />

        <motion.label
          htmlFor="password"
          className="block text-gray-700 font-semibold mb-2"
          custom={1}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
        >
          Password
        </motion.label>
        <motion.div
          className="relative"
          custom={1.2}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
        >
          <input
            id="password"
            name="password"
            type={hide ? "password" : "text"}
            value={data.password}
            onChange={handleForm}
            className="w-full p-3 border border-teal-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-blue-50"
          />
          <motion.button
            type="button"
            onClick={handleHide}
            whileTap={{ scale: 1.2, rotate: 15 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600 hover:text-teal-800"
          >
            {hide ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
          </motion.button>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleSubmit}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className="w-full p-3 bg-teal-600 text-white font-semibold rounded-lg mb-4 hover:bg-teal-700 transition shadow-md"
        >
          Login
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-gray-700">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-teal-600 cursor-pointer hover:underline font-semibold"
            >
              Sign up
            </span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Loginpage;
