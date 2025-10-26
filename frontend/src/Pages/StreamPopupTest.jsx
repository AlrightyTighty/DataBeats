import React, { useEffect, useRef } from "react";

const StreamPopupTest = () => {
  const hasRunOnce = useRef(false);
  useEffect(() => {
    if (hasRunOnce.current) return;

    hasRunOnce.current = true;
    window.open("/Stream/2", "_blank", "popup,width=1000,height=360");
  });
  return <div>StreamPopupTest</div>;
};

export default StreamPopupTest;
