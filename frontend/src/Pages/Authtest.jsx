import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import API from "../lib/api";

const Authtest = () => {
  const [info, setInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await fetch(`${API}/api/me`, {
        method: "GET",
        credentials: "include",
      });

      const info = await response.json();

      if (info.adminId != null) navigate("/admin");
      else if (info.musicianId != null) navigate("/musician-dashboard/" + info.musicianId);
      else navigate("/dashboard");
    })();
  }, []);

  console.log(info);

  return <div>{info ? info.username : "loading"}</div>;
};

export default Authtest;
