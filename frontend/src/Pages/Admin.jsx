import { AdminActivity } from "../Components/AdminActivity";
import { UserReports } from "../Components/UserReports";
import { ContentReportsChart } from "../Components/ContentReportsChart";
import styles from "./Admin.module.css";

export default function Admin() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Admin User</span>
          <div className={styles.avatar}>AU</div>
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
  );
}
