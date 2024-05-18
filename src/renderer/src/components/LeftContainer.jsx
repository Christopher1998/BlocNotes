import React from 'react';

export default function LeftContainer({ content, handleSelectNote }) {
  return (
    <div className="h-dvh w-1/3 bg-amber-100 border-amber-200 border-r overflow-y-auto">
      {content.map((note, noteIndex) => (
        <div
          className="w-11/12 h-12 font-semibold bg-amber-300 bg-opacity-30 backdrop-blur-md shadow-md mt-3 mx-auto my-auto hover:bg-amber-200 text-center pt-3 cursor-default truncate"
          key={note.id}
          onClick={() => handleSelectNote(noteIndex)}
          title={note.value}
        >
          {note.value.length > 15 ? `${note.value.slice(0, 15)}...` : note.value}
        </div>
      ))}
    </div>
  );
}