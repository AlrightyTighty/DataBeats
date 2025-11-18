import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import styles from "./Register.module.css";
import API from "../lib/api";
import DataBeatsLogo from "../assets/graphics/DataBeats_Logo.png";

const Register = () => {
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const [passwordValue, setPasswordValue] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const navigate = useNavigate();

  const defaultBorderColor = "rgb(122, 122, 122)";
  const usernameRegex = /^.{1,20}$/;
  const emailRegex =
    /^(?=.{1,100}$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/;

  const requirementChecks = [
    { test: (p) => p.length >= 8, label: "At least 8 characters" },
    { test: (p) => /[a-z]/.test(p), label: "1 lowercase letter" },
    { test: (p) => /[A-Z]/.test(p), label: "1 uppercase letter" },
    { test: (p) => /\d/.test(p), label: "1 number" },
    { test: (p) => /[^A-Za-z0-9]/.test(p), label: "1 symbol" },
  ];

  const validatePassword = (password) => {
    return requirementChecks
      .filter((req) => !req.test(password))
      .map((r) => r.label);
  };

  const onPasswordChange = (e) => {
    const value = e.target.value;
    setPasswordValue(value);
    setPasswordErrors(validatePassword(value));
  };

  const onRegister = async (event) => {
    event.preventDefault();
    setAttemptedSubmit(true);

    const username = usernameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordValue;

    const validUsername = username.match(usernameRegex);
    const validEmail = email.match(emailRegex);
    const passwordValidationErrors = validatePassword(password);
    const validPassword = passwordValidationErrors.length === 0;

    setPasswordErrors(passwordValidationErrors);

    usernameRef.current.style.borderColor = validUsername
      ? defaultBorderColor
      : "red";
    emailRef.current.style.borderColor = validEmail
      ? defaultBorderColor
      : "red";
    if (passwordRef.current)
      passwordRef.current.style.borderColor = validPassword
        ? defaultBorderColor
        : "red";

    if (!validUsername || !validEmail || !validPassword) return;

    const body = {
      Username: username,
      Email: email,
      Password: password,
    };

    const response = await fetch(`${API}/api/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      alert("Failed to register account.");
      return;
    }

    const loginBody = {
      UsernameOrEmail: username,
      Password: password,
    };

    const loginResponse = await fetch(`${API}/api/authentication`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(loginBody),
    });

    if (!loginResponse.ok) {
      navigate("/login");
      return;
    }

    if (loginResponse.ok) {
      navigate("/dashboard");
    }
  };

  const unmetRequirements = passwordValue
    ? requirementChecks.filter((r) => !r.test(passwordValue))
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.logoWrapper}>
        <img src={DataBeatsLogo} className={styles.logo} alt="DataBeats Logo" />
        <h1 className={styles.brand}>DataBeats</h1>
      </div>

      <main className={styles.main}>
        <form onSubmit={onRegister} className={styles.registerForm} noValidate>
          <label className={styles.formTitle}>REGISTER</label>

          <label className={styles.formLabel} htmlFor="username">
            Username
          </label>
          <input
            ref={usernameRef}
            className={styles.input}
            type="text"
            name="username"
            placeholder="Username"
          />

          <label className={styles.formLabel} htmlFor="email">
            Email
          </label>
          <input
            ref={emailRef}
            className={styles.input}
            type="text"
            name="email"
            placeholder="Email"
          />

          <label className={styles.formLabel} htmlFor="password">
            Password
          </label>
          <input
            ref={passwordRef}
            value={passwordValue}
            onChange={onPasswordChange}
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            aria-describedby="password-requirements"
          />

          {passwordValue.length > 0 && unmetRequirements.length > 0 && (
            <ul
              id="password-requirements"
              className={styles.passwordRules}
              aria-live="polite"
            >
              {unmetRequirements.map((req) => (
                <li key={req.label} className={styles.invalid}>
                  {req.label}
                </li>
              ))}
            </ul>
          )}

          {attemptedSubmit && passwordErrors.length > 0 && (
            <div
              className={styles.passwordErrorBox}
              role="alert"
              aria-live="assertive"
            >
              <strong>Password invalid:</strong>
              <ul>
                {passwordErrors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <input
            className={styles.registerButton}
            type="submit"
            value="Register"
          />

          <label className={styles.registerText}>
            Already have an account? <Link to="/Login">Login</Link> instead!
          </label>
        </form>
      </main>
    </div>
  );
};

export default Register;
