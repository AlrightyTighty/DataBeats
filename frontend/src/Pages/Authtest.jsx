import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Authtest = () => {
  const [info, setInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:5062/api/me", {
        method: "GET",
        credentials: "include",
      });

      const info = await response.json();

      if (info.adminId != null) navigate("/admin");
      else if (info.musicianId != null) navigate("/musician-dashboard");
      else navigate("/dashboard");
    })();
  }, []);

  console.log(info);

  return <div>{info ? info.username : "loading"}</div>;
};

export default Authtest;
