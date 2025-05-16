import React from "react";
import Loginpage from "./components/Loginpage";
import Signup from "./components/Signup";
import Home from "./components/Home";
  import Profile from "./components/Profile";
import GoogleSuccess from "./components/GoogleSuccess";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import OtpVerifyPage from "./components/otp";

const App = () => {
  return (
    <>
      <BrowserRouter>
        {/* <Navbar/> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Loginpage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otpVerify" element={<OtpVerifyPage />} />
          <Route path="/google-success" element={<GoogleSuccess />}></Route>
            <Route path="/profile" element={<Profile />} />

        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
