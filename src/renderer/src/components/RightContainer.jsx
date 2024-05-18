import React, { useEffect } from 'react';

export default function RightContainer({
  textareaValue,
  setTextareaValue,
  leftContainer,
  selectedNoteIndex,
  setLeftContainer,
  selectedNoteId,
  saveNotes,
  handleSelectNote
}) {
  const handleTextareaValueChange = () => {
    const updatedLeftContainer = [...leftContainer];
    const noteIndex = updatedLeftContainer.findIndex((note) => note.id === selectedNoteId);
  
    if (noteIndex !== -1) {
      const newNoteValue = textareaValue.trim();

      if (newNoteValue === '') {
        updatedLeftContainer.splice(noteIndex, 1);
        setLeftContainer(updatedLeftContainer);
        saveNotes(updatedLeftContainer);

        if (updatedLeftContainer.length > 0) {
          handleSelectNote(0);
        } else {
          handleSelectNote(null);
        }
      } else {
        updatedLeftContainer[noteIndex].value = newNoteValue;
        setLeftContainer(updatedLeftContainer);
        saveNotes(updatedLeftContainer);
      }
    }
  };

  useEffect(() => {
    const handleUnload = () => {
      handleTextareaValueChange();
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [textareaValue, leftContainer, selectedNoteIndex, setLeftContainer]);

  return (
    <div className="h-screen overflow-hidden w-2/3">
      <textarea
        value={textareaValue}
        onChange={(e) => setTextareaValue(e.target.value)}
        onBlur={handleTextareaValueChange}
        className="w-full h-full p-2 bg-amber-100 outline-none"
      />
    </div>
  );
}
