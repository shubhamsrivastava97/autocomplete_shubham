import { useCallback } from "react";
import { Modifier, EditorState } from "draft-js";

const useSuggestionSelector = ({
  editorState,
  setEditorState,
  setSuggestionsVisible,
}) => {
  const selectSuggestion = useCallback(
    (suggestion) => {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();

      const anchorKey = selectionState.getAnchorKey();
      const anchorOffset = selectionState.getAnchorOffset();

      const block = contentState.getBlockForKey(anchorKey);
      const blockText = block.getText();

      // Find the start position of the match string
      const matchStringStart = blockText.lastIndexOf("<>") + 2;

      const startSelection = selectionState.merge({
        anchorOffset: matchStringStart,
        focusOffset: anchorOffset,
      });

      // Remove the match string
      let newContentState = Modifier.replaceText(
        contentState,
        startSelection,
        ""
      );

      // Insert the autocompleted entry as an entity
      const contentStateWithEntity = newContentState.createEntity(
        "AUTOCOMPLETE",
        "IMMUTABLE",
        { suggestion }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

      newContentState = Modifier.insertText(
        newContentState,
        startSelection,
        suggestion,
        null,
        entityKey
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "insert-characters"
      );

      setEditorState(newEditorState);
      setSuggestionsVisible(false);
    },
    [editorState, setEditorState, setSuggestionsVisible]
  );
  return selectSuggestion;
};
export default useSuggestionSelector;
