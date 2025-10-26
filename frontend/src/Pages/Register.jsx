import React, { useRef } from "react";
import Topnav from "../Components/Topnav";
import { Link, useNavigate } from "react-router";
import styles from "./Register.module.css";

const Register = () => {
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const navigate = useNavigate();

  const defaultBorderColor = "rgb(122, 122, 122)";

  const usernameRegex = /^.{1,20}$/;
  const emailRegex = /^(?=.{1,100}$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/;

  const onRegister = async (event) => {
    event.preventDefault();

    const username = usernameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    const validUsername = username.match(usernameRegex);
    const validEmail = email.match(emailRegex);
    const validPassword = password.match(passwordRegex);

    usernameRef.current.style.borderColor = validUsername ? defaultBorderColor : "red";
    emailRef.current.style.borderColor = validEmail ? defaultBorderColor : "red";
    passwordRef.current.style.borderColor = validPassword ? defaultBorderColor : "red";

    if (!validUsername || !validEmail || !validPassword) return;

    const body = {
      Username: username,
      Email: email,
      Password: password,
    };

    const response = await fetch("http://localhost:5062/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return;

    const loginBody = {
      UsernameOrEmail: username,
      Password: password,
    };

    const loginResponse = await fetch("http://localhost:5062/api/authentication", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(loginBody),
    });

    if (loginResponse.ok) {
      navigate("/authtest");
    }
  };

  return (
    <>
      <Topnav />
      <main id={styles["main"]}>
        <form onSubmit={onRegister} className={styles["register-form"]}>
          <label id={styles["form-title"]}>REGISTER</label>
          <label className={styles["form-label"]} htmlFor="username">
            Username
          </label>
          <input ref={usernameRef} className={styles["register-field"]} type="text" name="username" placeholder="Username"></input>
          <label className={styles["form-label"]} htmlFor="email">
            Email
          </label>
          <input ref={emailRef} className={styles["register-field"]} type="text" name="email" placeholder="Email"></input>
          <label className={styles["form-label"]} htmlFor="password">
            Password
          </label>
          <input ref={passwordRef} className={styles["register-field"]} type="password" name="password" placeholder="Password"></input>
          <input id={styles["register-button"]} type="submit" value="Register" />
          <label id={styles["register-text"]}>
            Already have an account? <Link to="/Login">Login</Link> instead!
          </label>
        </form>
      </main>
    </>
  );
};

export default Register;
