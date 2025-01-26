import React from "react";
import styles from "./Suggestions.module.css";

const Suggestions = ({
  suggestionsVisible,
  suggestions,
  highlightedIndex,
  selectSuggestion,
}) => {
  if (!suggestionsVisible || suggestions.length === 0) {
    console.log("Suggestions dropdown not rendering...");
    return null;
  }

  console.log("Rendering suggestions dropdown...");
  return (
    <div className={styles.suggestions_dropdown}>
      {suggestions.map((suggest, index) => (
        <div
          key={index}
          className={
            index === highlightedIndex
              ? `${styles.suggestion_item} ${styles.highlighted}`
              : styles.suggestion_item
          }
          onMouseDown={() => selectSuggestion(suggest)}
        >
          {suggest}
        </div>
      ))}
    </div>
  );
};
export default Suggestions;
