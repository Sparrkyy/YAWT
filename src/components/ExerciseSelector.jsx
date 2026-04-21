import { groupExercises } from '../data/grouping';

export default function ExerciseSelector({
  exercises,
  value,
  onChange,
  includeArchived = false,
  ...rest
}) {
  const visible = includeArchived ? exercises : exercises.filter((ex) => !ex.archived);
  const groups = groupExercises(visible);
  return (
    <select value={value} onChange={onChange} {...rest}>
      <option value="">— select —</option>
      {groups.map(({ label, exercises: group }) => (
        <optgroup key={label} label={label}>
          {group.map((ex) => (
            <option key={ex.name} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
