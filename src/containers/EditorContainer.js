import React, { useRef } from "react";
import { Editor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";
import styles from "./Editor.module.css";
import Suggestions from "../components/Suggestions";
import useKeysHandler from "./KeysHandler";
import useSuggestionSelector from "./SuggestionSelector";

const EditorContainer = () => {
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty()
  );
  const editor = useRef(null);

  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [suggestionsVisible, setSuggestionsVisible] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState([]);
  const suggestionsList = [
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
  ];
  //Handle before input event
  const handleBeforeInput = (chars, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = contentState.getBlockForKey(selection.getStartKey());
    const blockText = block.getText();

    const anchorOffset = selection.getAnchorOffset();
    const textBeforeCursor = blockText.slice(0, anchorOffset) + chars;
    console.log(textBeforeCursor); //Debugging

    //Check for trigger condition <>
    if (textBeforeCursor.endsWith("<>")) {
      setSuggestionsVisible(true);
      setSuggestions(suggestionsList);
      return "handled";
    }
    //Make suggestions visible
    if (suggestionsVisible) {
      const matchStringStart = textBeforeCursor.lastIndexOf("<>") + 2;
      const matchString = textBeforeCursor.slice(matchStringStart);

      if (matchString.includes("\n")) {
        setSuggestionsVisible(false);
        return "not-handled";
      }
      //Filter suggestions based on matchString
      const filteredSuggestions = suggestionsList.filter((suggestion) =>
        suggestion.startsWith(matchString)
      );
      setSuggestions(filteredSuggestions);
      // If no suggestions match, close the dropdown
      if (filteredSuggestions.length === 0) {
        setSuggestionsVisible(false);
      }
      return "handled";
    }
    return "not-handled";
  };
  //Debugging
  React.useEffect(() => {
    console.log("Suggestions Visible:", suggestionsVisible);
    console.log("Suggestions List:", suggestions);
  }, [suggestionsVisible, suggestions]);

  //Select suggestion
  const selectSuggestion = useSuggestionSelector({
    editorState,
    setEditorState,
    setSuggestionsVisible,
  });

  //Binding and handling key commands
  const { keyBindingFn, handleKeyCommand } = useKeysHandler({
    highlightedIndex,
    setHighlightedIndex,
    suggestions,
    suggestionsVisible,
    selectSuggestion,
  });

  return (
    <div
      className={styles.editor_container}
      onClick={() => editor.current.focus()}
    >
      <Editor
        editorState={editorState}
        keyBindingFn={keyBindingFn}
        handleKeyCommand={handleKeyCommand}
        onChange={setEditorState}
        handleBeforeInput={handleBeforeInput}
        ref={editor}
        placeholder="Type something..."
      />
      <Suggestions
        suggestionsVisible={suggestionsVisible}
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        selectSuggestion={selectSuggestion}
      />
    </div>
  );
};

export default EditorContainer;
