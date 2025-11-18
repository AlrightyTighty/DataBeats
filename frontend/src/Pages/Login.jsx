import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import styles from "./Login.module.css";
import API from "../lib/api";
import DataBeatsLogo from "../assets/graphics/DataBeats_Logo.png";

const Login = () => {
  const usernameOrEmailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();

  const defaultBorderColor = "rgb(122, 122, 122)";
  const usernameOrEmailRegex = /^.{1,100}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/;

  useEffect(() => {}, []);

  const onLogin = async (event) => {
    event.preventDefault();

    const userField = usernameOrEmailRef.current;
    const passField = passwordRef.current;

    userField.style.borderColor = userField.value.match(usernameOrEmailRegex)
      ? defaultBorderColor
      : "red";

    passField.style.borderColor = passField.value.match(passwordRegex)
      ? defaultBorderColor
      : "red";

    if (
      !userField.value.match(usernameOrEmailRegex) ||
      !passField.value.match(passwordRegex)
    )
      return;

    const body = {
      UsernameOrEmail: userField.value,
      Password: passField.value,
    };

    try {
      const response = await fetch(`${API}/api/authentication`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        navigate("/dashboard");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.logoWrapper}>
        <img src={DataBeatsLogo} className={styles.logo} alt="DataBeats Logo" />
        <h1 className={styles.brand}>DataBeats</h1>
      </div>

      <main className={styles.main}>
        <form onSubmit={onLogin} className={styles.loginForm}>
          <label className={styles.formTitle}>LOGIN</label>

          <label className={styles.formLabel}>Username or Email</label>
          <input
            ref={usernameOrEmailRef}
            className={styles.input}
            type="text"
            placeholder="Username"
          />

          <label className={styles.formLabel}>Password</label>
          <input
            ref={passwordRef}
            className={styles.input}
            type="password"
            placeholder="Password"
          />

          <input type="submit" value="Login" className={styles.loginButton} />

          <label className={styles.registerText}>
            Don't have an account? <Link to="/Register">Register</Link>
          </label>
        </form>
      </main>
    </div>
  );
};

export default Login;
