import { useCallback } from "react";
import { EditorState, Modifier } from "draft-js";

const useKeysHandler = ({
  highlightedIndex,
  setHighlightedIndex,
  suggestions,
  suggestionsVisible,
  selectSuggestion,
  editorState,
  setEditorState,
}) => {
  // Utility function to find entity range
  const getEntityRange = (block, entityKey) => {
    let start = -1;
    let end = -1;
    if (!block || !entityKey) {
      return { start, end };
    }
    block.findEntityRanges(
      (character) => character.getEntity() === entityKey,
      (startOffset, endOffset) => {
        start = startOffset;
        end = endOffset;
      }
    );
    return { start, end };
  };
  // Key binding function
  const keyBindingFn = useCallback(
    (e) => {
      if (suggestionsVisible) {
        if (e.keyCode === 8) {
          return "backspace";
        }
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
          (prevIndex) =>
            (prevIndex - 1 + suggestions.length) % suggestions.length
        );
        return "handled";
      }
      if (command === "arrow-down") {
        setHighlightedIndex(
          (prevIndex) => (prevIndex + 1) % suggestions.length
        );
        return "handled";
      }
      if (command === "insert-suggestion" && suggestions[highlightedIndex]) {
        selectSuggestion(suggestions[highlightedIndex]);
        return "handled";
      }
      if (command === "backspace") {
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();

        if (!selection.isCollapsed()) {
          return "not-handled";
        }

        const block = contentState.getBlockForKey(selection.getAnchorKey());
        const offset = selection.getAnchorOffset();

        if (offset > 0) {
          const entityKey = block.getEntityAt(offset - 1);

          if (entityKey) {
            const entity = contentState.getEntity(entityKey);

            if (entity.getType() === "AUTOCOMPLETE") {
              // Remove the entire entity
              const entityRange = getEntityRange(block, entityKey);

              const newSelection = selection.merge({
                anchorOffset: entityRange.start,
                focusOffset: entityRange.end,
              });

              const newContentState = Modifier.removeRange(
                contentState,
                newSelection,
                "backward"
              );

              const newEditorState = EditorState.push(
                editorState,
                newContentState,
                "remove-range"
              );

              setEditorState(newEditorState);
              return "handled";
            }
          }
        }
      }
      return "not-handled";
    },
    [
      highlightedIndex,
      suggestions,
      setHighlightedIndex,
      selectSuggestion,
      editorState,
      setEditorState,
    ]
  );

  return { keyBindingFn, handleKeyCommand };
};

export default useKeysHandler;
