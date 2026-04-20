import { useState } from 'react';
import ExerciseAccordionSheet from './ExerciseAccordionSheet';

function pickerClass(value) { return `picker-button${value ? '' : ' placeholder'}`; }

export default function ExercisePickerButton({ exercises, value, onChange, ...rest }) {
  const [open, setOpen] = useState(false);

  function handleSelect(name) {
    onChange({ target: { value: name } });
  }

  return (
    <>
      <button
        type="button"
        className={pickerClass(value)}
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
