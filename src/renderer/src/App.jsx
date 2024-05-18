import React, { useState, useEffect } from 'react';
import LeftContainer from './components/LeftContainer';
import RightContainer from './components/RightContainer';
import TopBar from './components/TopBar';

const electron = window.electron;

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function App() {
  const [leftContainer, setLeftContainer] = useState([]);
  const [textareaValue, setTextareaValue] = useState('');
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  function saveNotes(notes) {
    try {
      electron.ipcRenderer.send('notes-data', notes);
    } catch (error) {
      console.error('Error al guardar las notas:', error);
    }
  }

  const handleAddNote = () => {
    if (textareaValue.trim() !== '') {
      if (selectedNoteIndex !== null && leftContainer[selectedNoteIndex]) {
        const updatedLeftContainer = [...leftContainer];
        updatedLeftContainer[selectedNoteIndex].value = textareaValue;
        setLeftContainer(updatedLeftContainer);
      } else {
        setLeftContainer([...leftContainer, { id: generateId(), value: textareaValue }]);
      }
  
      handleTextareaReset();
      setSelectedNoteIndex(null);
      setSelectedNoteId(null);
    }
  };

  const handleDeleteNote = () => {
    const updatedLeftContainer = leftContainer.filter((note, index) => index !== selectedNoteIndex);
    setLeftContainer(updatedLeftContainer);
    handleTextareaReset();
    setSelectedNoteIndex(null);
    setSelectedNoteId(null);
  };

  const handleTextareaReset = () => {
    setTextareaValue('');
  };

  const handleSelectNote = (noteIndex) => {
    try {
      if (noteIndex !== null && leftContainer[noteIndex]) {
        setSelectedNoteIndex(noteIndex);
        setTextareaValue(leftContainer[noteIndex].value);
        setSelectedNoteId(leftContainer[noteIndex].id);
      } else {
        console.warn('No hay nota seleccionada o la nota ya no existe');
      }
    } catch (error) {
      console.error('Error al seleccionar la nota:', error);
    }
  };

  useEffect(() => {
    const handleBeforeQuit = () => {
      saveNotes(leftContainer);
    };
  
    electron.ipcRenderer.on('get-notes', handleBeforeQuit);
  
    return () => {
      electron.ipcRenderer.removeListener('get-notes', handleBeforeQuit);
    };
  }, [leftContainer]);

  useEffect(() => {
    electron.ipcRenderer.on('notes-loaded', (event, notes) => {
      setLeftContainer(notes);
    });

    return () => {
      electron.ipcRenderer.removeAllListeners('notes-loaded');
    };
  }, []);

  return (
    <>
      <TopBar
        onAddNote={handleAddNote}
        textareaValue={textareaValue}
        onDeleteNote={handleDeleteNote}
        selectedNoteIndex={selectedNoteIndex}
      />
      <div className="flex">
        <LeftContainer content={leftContainer} handleSelectNote={handleSelectNote} />
        <RightContainer
          textareaValue={textareaValue}
          setTextareaValue={setTextareaValue}
          onTextareaReset={handleTextareaReset}
          leftContainer={leftContainer}
          selectedNoteIndex={selectedNoteIndex}
          setLeftContainer={setLeftContainer}
          selectedNoteId={selectedNoteId}
          saveNotes={saveNotes}
          handleSelectNote={handleSelectNote}
        />
      </div>
    </>
  );
}

export default App;
