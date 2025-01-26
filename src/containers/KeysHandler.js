import { useCallback } from "react";

const useKeysHandler = ({
  highlightedIndex,
  setHighlightedIndex,
  suggestions,
  suggestionsVisible,
  selectSuggestion,
}) => {
  // Key binding function
  const keyBindingFn = useCallback(
    (e) => {
      if (suggestionsVisible) {
        if (e.keyCode === 38) return "arrow-up"; // Up arrow
        if (e.keyCode === 40) return "arrow-down"; // Down arrow
        if (e.keyCode === 13 || e.keyCode === 9) return "insert-suggestion"; // Enter or Tab
      }
      return null; // Default binding
    },
    [suggestionsVisible]
  );

  // Handle key commands
  const handleKeyCommand = useCallback(
    (command) => {
      if (command === "arrow-up") {
        setHighlightedIndex(
          (prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length
        );
        return "handled";
      }
      if (command === "arrow-down") {
        setHighlightedIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
        return "handled";
      }
      if (command === "insert-suggestion" && suggestions[highlightedIndex]) {
        selectSuggestion(suggestions[highlightedIndex]);
        return "handled";
      }
      return "not-handled";
    },
    [highlightedIndex, suggestions, setHighlightedIndex, selectSuggestion]
  );

  return { keyBindingFn, handleKeyCommand };
};

export default useKeysHandler;