import React from "react";
import { useState } from "react";
import "../Login/Login.css";

import user_icon from "../Assests/person.png";
import email_icon from "../Assests/email.png";
import password_icon from "../Assests/password.png";

const Login = () => {
  const [action, setAction] = useState("Sign Up");

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      
      <div className="inputs">
        {action==="Log In"? <div></div>:
        <div className="input">
        <img src={user_icon} alt="" />
        <input type="text" placeholder="Your Name"/>
      </div> }
      <div className="input">
        <img src={email_icon} alt="" />
        <input type="email" placeholder="Your Email"/>
      </div>
      <div className="input">
        <img src={password_icon} alt="" />
        <input type="password" placeholder="Password"/>
      </div>
      </div>
      {action=== "Sign Up"? <div></div> : <div className="forgot-password">Forgot Password?<span>Click Here!</span></div>}
      
      <div className="submit-container">
        <div className={action==="Log In"? "submit gray": "submit"} onClick={()=>{setAction("Sign Up")}}>Sign Up</div>
        <div className={action==="Sign Up"? "submit gray": "submit"} onClick={()=>(setAction("Log In"))}>Log In</div>
      </div>
    </div>
  );
};

export default Login;
