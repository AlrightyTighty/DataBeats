import SearchResultCard from "./SearchResultCard";
import styles from "./SearchResultsRow.module.css";

export default function SearchResultsRow({ title, items, type }) {
  return (
    <div className={styles.row}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.scrollContainer}>
        {items.map((item) => (
          <SearchResultCard
            key={item.id}
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            type={type}
            id={item.id}
          />
        ))}
      </div>
    </div>
  );
}
