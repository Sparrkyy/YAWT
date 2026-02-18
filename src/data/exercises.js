export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'rearDelts', 'lowBack'
];

export const EXERCISES = [
  { name: 'Back Extension', muscles: { hamstrings: 0.5, glutes: 0.5, lowBack: 0.5 } },
  { name: 'Leg Extension', muscles: { quads: 1 } },
  { name: 'Hip Adductions', muscles: { glutes: 1 } },
  { name: 'Dumbell Shoulder Press', muscles: { shoulders: 1, triceps: 0.25 } },
  { name: 'Dumbell Row (Single Arm)', muscles: { back: 1, biceps: 0.5, rearDelts: 0.5 } },
  { name: 'Incline Bench Dumbell Bicep Curl', muscles: { biceps: 1 } },
  { name: 'Lying Hamstring Curl', muscles: { hamstrings: 1 } },
  { name: 'Sitting Hamstring Curl', muscles: { hamstrings: 1 } },
  { name: 'Hammer Str Back-Supported Row', muscles: { back: 1, biceps: 0.5 } },
  { name: 'Face Pull', muscles: { back: 0.5, rearDelts: 1 } },
  { name: 'Tricep Pushdown', muscles: { triceps: 1 } },
  { name: 'Machine Chest Fly (matrix)', muscles: { chest: 1 } },
  { name: 'Machine Rear Delt Fly (matrix)', muscles: { back: 0.5, rearDelts: 1 } },
  { name: 'Calf Raise', muscles: { calves: 1 } },
  { name: 'Hammer Strength Preacher Curl', muscles: { biceps: 1 } },
  { name: 'Matrix Tricep Push Down', muscles: { triceps: 1 } },
  { name: 'Hammer Strength Stack Row', muscles: {} },
  { name: 'Matrix Cable Row', muscles: { back: 1, biceps: 0.5 } },
  { name: 'Bulgarian Split Squat', muscles: {} },
];
