import React from "react";
import reportSymbol from "../assets/graphics/report_button.png";
import { useNavigate } from "react-router";
import styles from "./ReportButton.module.css";

const ReportButton = ({ right, left, top, bottom, reportType, width, height, contentId }) => {
  const navigate = useNavigate();

  return (
    <img
      onClick={(event) => {
        event.stopPropagation();
        navigate(`/report?type=${reportType}&id=${contentId}`);
      }}
      className={styles["report-button"]}
      src={reportSymbol}
      style={{ width: width ?? "30px", height: height ?? "30px", right: right, left: left, top: top, bottom: bottom, position: "absolute" }}
    />
  );
};

export default ReportButton;
