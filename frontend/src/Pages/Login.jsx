import React, { useRef } from "react";
import Topnav from "../Components/Topnav";
import { Link, useNavigate } from "react-router";
import styles from "./Login.module.css";

const Login = () => {
  const usernameOrEmailRef = useRef();
  const passwordRef = useRef();

  const navigate = useNavigate();

  const defaultBorderColor = "rgb(122, 122, 122)";

  const usernameOrEmailRegex = /^.{1,100}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/;

  const onLogin = async (event) => {
    event.preventDefault();

    passwordRef.current.style.borderColor = !passwordRef.current.value.match(passwordRegex) ? "red" : defaultBorderColor;
    usernameOrEmailRef.current.style.borderColor = !usernameOrEmailRef.current.value.match(usernameOrEmailRegex) ? "red" : defaultBorderColor;

    if (!passwordRef.current.value.match(passwordRegex) || !usernameOrEmailRef.current.value.match(usernameOrEmailRegex)) return;

    const body = {
      UsernameOrEmail: usernameOrEmailRef.current.value,
      Password: passwordRef.current.value,
    };

    try {
      const response = await fetch("http://localhost:5062/api/authentication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        navigate("/authtest");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Topnav />
      <main id={styles["main"]}>
        <form onSubmit={onLogin} className={styles["login-form"]}>
          <label id={styles["form-title"]}>LOGIN</label>
          <label className={styles["form-label"]} htmlFor="usernameOrEmail">
            Username or Email
          </label>
          <input ref={usernameOrEmailRef} className={styles["login-field"]} type="text" name="usernameOrEmail" placeholder="Username"></input>
          <label className={styles["form-label"]} htmlFor="password">
            Password
          </label>
          <input ref={passwordRef} className={styles["login-field"]} type="password" name="password" placeholder="Password"></input>
          <input id={styles["login-button"]} type="submit" value="Login" />
          <label id={styles["register-text"]}>
            Don't have an account? <Link to="/Register">Register</Link> instead!
          </label>
        </form>
      </main>
    </>
  );
};

export default Login;
