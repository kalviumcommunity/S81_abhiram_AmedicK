  import { useState, useEffect } from "react";
  import axios from "axios";
  import { useNavigate, useLocation } from "react-router-dom";
  import { motion } from "framer-motion";

  const OtpVerifyPage = () => {
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
      if (!email) {
        setMessage("No email found. Please go back to the signup page.");
      }
    }, [email]);

    const handleChange = (e, index) => {
      const newOtp = [...otp];
      newOtp[index] = e.target.value.slice(-1);
      setOtp(newOtp);

      if (e.target.value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }

      if (newOtp.every((digit) => digit !== "")) {
        handleVerify(newOtp.join(""));
      }
    };

    const handleVerify = async (otpValue) => {
      if (!email) {
        setMessage("Email is missing");
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const res = await axios.post(
          "http://localhost:9090/user/verify-otp",
          { email, otp: otpValue },
          { withCredentials: true }
        );
        setMessage(res.data.message);
        navigate("/login");
      } catch (err) {
        setMessage(
          err.response?.data?.message || "Invalid OTP, please try again"
        );
        setOtp(Array(6).fill(""));
        document.getElementById("otp-input-0").focus();
      } finally {
        setLoading(false);
      }
    };

    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-100 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-teal-800 text-center mb-6 font-sans">
            OTP Verification
          </h2>

          <form
            className="flex flex-col items-center gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  maxLength="1"
                  autoFocus={index === 0}
                  aria-label={`OTP digit ${index + 1}`}
                  whileFocus={{ scale: 1.1, borderColor: "#14b8a6" }}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 transition-all"
                />
              ))}
            </div>

            {loading && <p className="text-blue-600 font-medium">Verifying...</p>}

            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center font-semibold ${
                  message.toLowerCase().includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </motion.p>
            )}
          </form>
        </motion.div>
      </motion.div>
    );
  };

  export default OtpVerifyPage;
