import React, { useRef } from "react";
import { Editor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";
import styles from "./Editor.module.css";
import Suggestions from "../components/Suggestions";
import useKeysHandler from "./KeysHandler";
import useSuggestionSelector from "./SuggestionSelector";
import { CompositeDecorator } from "draft-js";

const EditorContainer = () => {
  const [suggestionsVisible, setSuggestionsVisible] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [, setMatchString] = React.useState("");
  const [matchStart, setMatchStart] = React.useState(null);
  const suggestionList = [
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
  ];

  //Decorator
  const AutocompleteSpan = (props) => {
    return (
      <span
        style={{ color: "blue", fontWeight: "bold" }}
        data-offset-key={props.offsetKey}
      >
        {props.children}
      </span>
    );
  };

  // Define a strategy to find autocomplete entities
  const autocompleteStrategy = (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges((character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === "AUTOCOMPLETE"
      );
    }, callback);
  };

  const decorator = new CompositeDecorator([
    {
      strategy: autocompleteStrategy,
      component: AutocompleteSpan,
    },
  ]);
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty(decorator)
  );
  const editor = useRef(null);

  //Handle change
  const onChange = (newEditorState) => {
    const selection = newEditorState.getSelection();
    const anchorKey = selection.getAnchorKey();
    const anchorOffset = selection.getAnchorOffset();

    const contentState = newEditorState.getCurrentContent();
    const block = contentState.getBlockForKey(anchorKey);
    const blockText = block.getText();

    const textBeforeCursor = blockText.slice(0, anchorOffset);

    const lastTriggerIndex = textBeforeCursor.lastIndexOf("<>");

    if (lastTriggerIndex !== -1) {
      // We are in autocomplete mode
      const matchString = textBeforeCursor.slice(lastTriggerIndex + 2);

      if (matchString.includes("\n")) {
        // Terminate autocomplete if newline is detected
        setSuggestionsVisible(false);
        setMatchString("");
      } else {
        setSuggestionsVisible(true);
        setMatchString(matchString);
        setMatchStart(lastTriggerIndex + 2);

        // Update suggestions
        const filteredSuggestions = suggestionList.filter((s) =>
          s.startsWith(matchString)
        );
        setSuggestions(filteredSuggestions);
        setHighlightedIndex(0);
      }
    } else {
      // Not in autocomplete mode
      setSuggestionsVisible(false);
      setMatchString("");
    }

    setEditorState(newEditorState);
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
    matchStart,
  });

  //Binding and handling key commands
  const { keyBindingFn, handleKeyCommand } = useKeysHandler({
    highlightedIndex,
    setHighlightedIndex,
    suggestions,
    suggestionsVisible,
    selectSuggestion,
    editorState,
    setEditorState,
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
        onChange={onChange}
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
