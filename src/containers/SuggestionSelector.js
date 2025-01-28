import { useCallback } from "react";
import { Modifier, EditorState } from "draft-js";

const useSuggestionSelector = ({
  editorState,
  setEditorState,
  setSuggestionsVisible,
  matchStart,
}) => {
  const selectSuggestion = useCallback(
    (suggestion) => {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();

      const anchorOffset = selectionState.getAnchorOffset();

      // Create a selection from matchStart to anchorOffset
      const matchSelection = selectionState.merge({
        anchorOffset: matchStart,
        focusOffset: anchorOffset,
      });

      // Create the entity for the autocompleted entry
      const contentStateWithEntity = contentState.createEntity(
        "AUTOCOMPLETE",
        "IMMUTABLE",
        { suggestion }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

      // Replace the match string with the suggestion and apply the entity
      const newContentState = Modifier.replaceText(
        contentStateWithEntity,
        matchSelection,
        suggestion,
        null,
        entityKey
      );

      // Push the new content state into the editor state
      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "insert-characters"
      );

      // Update the editor state and close the suggestions list
      setEditorState(newEditorState);
      setSuggestionsVisible(false);
    },
    [editorState, setEditorState, setSuggestionsVisible, matchStart]
  );
  return selectSuggestion;
};
export default useSuggestionSelector;
