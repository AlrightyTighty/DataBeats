import React, { useEffect, useState } from "react";

const Authtest = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:5062/api/authtest", {
        method: "GET",
        credentials: "include",
      });

      setInfo(await response.json());
    })();
  }, []);

  console.log(info);

  return <div>{info ? info.username : "loading"}</div>;
};

export default Authtest;
