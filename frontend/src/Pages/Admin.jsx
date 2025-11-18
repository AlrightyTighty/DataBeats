import { AdminActivity } from "../Components/AdminActivity";
import { UserReports } from "../Components/UserReports";
import { ContentReportsChart } from "../Components/ContentReportsChart";
import Topnav from "../Components/Topnav";
import styles from "./Admin.module.css";
import { Link, useNavigate } from "react-router";

export default function Admin() {
  const navigate = useNavigate();

  return (
    <>
      <Topnav />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <div className={styles.headerButtons}>
            <Link className={styles.navButton} to="/dashboard">
              See User View
            </Link>
            <button
              className={styles.navButton}
              onClick={() => navigate("/admin/generate-report")}
            >
              Generate Report
            </button>
          </div>
        </header>

        <main className={styles.main}>
        <div className={styles.topSection}>
          <div className={styles.activitySection}>
            <AdminActivity />
          </div>
          <div className={styles.reportsSection}>
            <UserReports />
          </div>
        </div>

        <div className={styles.chartSection}>
          <ContentReportsChart />
        </div>
      </main>
      </div>
    </>
  );
}
