import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import API from "../lib/api";

export default function useAuthentication() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        const response = await fetch(`${API}/api/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();
        if (isMounted) setUser(data);
      } catch (err) {
        if (isMounted) navigate("/login", { replace: true });
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return user;
}