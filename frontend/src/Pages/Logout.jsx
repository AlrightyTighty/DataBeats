import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import API from "../lib/api";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const logoutResponse = await fetch(`${API}/api/authentication`, {
        method: "DELETE",
        credentials: "include",
      });

      if (logoutResponse.ok) navigate("/");
    })();
  }, []);

  return <div>Logging out...</div>;
};

export default Logout;
