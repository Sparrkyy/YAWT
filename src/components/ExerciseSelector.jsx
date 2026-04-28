import { groupExercises } from '../data/grouping';

const FLAT_LIST_THRESHOLD = 15;

export default function ExerciseSelector({
  exercises,
  value,
  onChange,
  includeArchived = false,
  ...rest
}) {
  const visible = includeArchived ? exercises : exercises.filter((ex) => !ex.archived);
  const flat = visible.length <= FLAT_LIST_THRESHOLD;
  const sorted = flat ? [...visible].sort((a, b) => a.name.localeCompare(b.name)) : null;
  const groups = flat ? null : groupExercises(visible);
  return (
    <select value={value} onChange={onChange} {...rest}>
      <option value="">— select —</option>
      {flat
        ? sorted.map((ex) => (
            <option key={ex.name} value={ex.name}>
              {ex.name}
            </option>
          ))
        : groups.map(({ label, exercises: group }) => (
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
