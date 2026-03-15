import { useState } from 'react';
import ExerciseAccordionSheet from './ExerciseAccordionSheet';

export default function ExercisePickerButton({ exercises, value, onChange, ...rest }) {
  const [open, setOpen] = useState(false);

  function handleSelect(name) {
    // Match the same event shape as a <select> onChange
    onChange({ target: { value: name } });
  }

  return (
    <>
      <button
        type="button"
        className={`picker-button${value ? '' : ' placeholder'}`}
        onClick={() => setOpen(true)}
        {...rest}
      >
        {value || '— select —'}
      </button>
      {open && (
        <ExerciseAccordionSheet
          exercises={exercises}
          value={value}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
