import React from 'react'
import Loginpage from './components/Loginpage'
import Signup from './components/Signup'
import Home from './components/Home'
import OTPSignupPage from './components/OTPSignupPage'
import { BrowserRouter,Routes,Route } from 'react-router-dom'


const App = () => {
  return (
    <>
      <BrowserRouter>
        {/* <Navbar/> */}
       <Routes>
            <Route  path="/"  element={<Home/>}/>
            <Route path="/login" element={<Loginpage/>}/>
            <Route path='/signup' element={<Signup/>}/>
            <Route path="/signup/otp" element={<OTPSignupPage />} />
       </Routes>
     </BrowserRouter>
    </>
  )
}

export default App