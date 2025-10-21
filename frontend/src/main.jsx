import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import App from "./App.jsx";

import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Authtest from "./Pages/Authtest.jsx";
import Register from "./Pages/Register.jsx";
import Stream from "./Pages/Stream.jsx";
import Artist from "./Pages/Artist.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/register", element: <Register /> },
  { path: "/authtest", element: <Authtest /> },
  { path: "/stream/:id", element: <Stream /> },
  { path: "/artist/:id", element: <Artist /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
