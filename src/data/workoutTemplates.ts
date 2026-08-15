import {
  WorkoutGoal,
  EquipmentAvailability,
  TrainingSplit,
  ExerciseItem,
  WorkoutDay,
  PersonalizedWorkoutPlan,
  UserProfile,
  ProgressLogEntry,
  ExperienceLevel,
} from '../types';

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles?: string[];
  equipment: EquipmentAvailability | 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
  compatibleEquipment: EquipmentAvailability[];
  benchmarkLiftKey?: 'benchPressKg' | 'squatKg' | 'deadliftKg' | 'overheadPressKg';
  baseIntensityFactor: number; // 0.60 to 0.85
  tempo: string;
  formCue: string;
  alternatives: string[];
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // CHEST
  {
    id: 'bb_bench_press',
    name: 'Barbell Flat Bench Press',
    targetMuscle: 'Chest (Mid/Lower)',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym'],
    benchmarkLiftKey: 'benchPressKg',
    baseIntensityFactor: 0.75,
    tempo: '3-1-1-0',
    formCue: 'Retract scapulae, slight arch, touch mid-sternum, drive through heels without flaring elbows.',
    alternatives: ['db_flat_press', 'machine_chest_press', 'weighted_pushups'],
  },
  {
    id: 'db_incline_press',
    name: 'Incline Dumbbell Press (30°)',
    targetMuscle: 'Chest (Clavicular/Upper)',
    secondaryMuscles: ['Front Delts', 'Triceps'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    benchmarkLiftKey: 'benchPressKg',
    baseIntensityFactor: 0.70,
    tempo: '3-0-1-0',
    formCue: 'Set bench to 30°, deep stretch at bottom, press in a slight inward arc without clanking dumbbells.',
    alternatives: ['bb_incline_press', 'incline_smith_press', 'incline_cable_press'],
  },
  {
    id: 'db_flat_press',
    name: 'Flat Dumbbell Bench Press',
    targetMuscle: 'Chest (Mid/Sternal)',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    benchmarkLiftKey: 'benchPressKg',
    baseIntensityFactor: 0.72,
    tempo: '3-1-1-0',
    formCue: 'Full range of motion, wrists stacked over elbows, control eccentric down below chest level.',
    alternatives: ['bb_bench_press', 'machine_chest_press', 'weighted_pushups'],
  },
  {
    id: 'cable_chest_fly',
    name: 'Standing Cable Fly (High to Low)',
    targetMuscle: 'Chest (Lower/Sternal)',
    secondaryMuscles: ['Front Delts'],
    equipment: 'cable',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-1',
    formCue: 'Maintain slight elbow bend, hug an imaginary tree barrel, 1-sec peak contraction squeeze.',
    alternatives: ['pec_deck_fly', 'db_flat_fly', 'band_chest_fly'],
  },
  {
    id: 'pec_deck_fly',
    name: 'Machine Pec Deck Fly',
    targetMuscle: 'Chest (Isolation)',
    secondaryMuscles: ['Anterior Delts'],
    equipment: 'machine',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-1',
    formCue: 'Seat height so handles align with mid-chest, squeeze elbows together, control negative.',
    alternatives: ['cable_chest_fly', 'db_flat_fly', 'band_crossover'],
  },
  {
    id: 'weighted_dips',
    name: 'Chest Dips (Forward Lean)',
    targetMuscle: 'Chest (Lower) & Triceps',
    secondaryMuscles: ['Front Delts'],
    equipment: 'bodyweight',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'bodyweight_calisthenics'],
    baseIntensityFactor: 0.75,
    tempo: '3-1-1-0',
    formCue: 'Lean torso 30° forward, flare elbows slightly, descend until shoulders are below elbows.',
    alternatives: ['decline_bench_press', 'cable_pressdowns', 'pushups'],
  },
  {
    id: 'weighted_pushups',
    name: 'Deficit Push-Ups / Ring Push-Ups',
    targetMuscle: 'Chest & Core',
    secondaryMuscles: ['Triceps', 'Serratus Anterior'],
    equipment: 'bodyweight',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only', 'bodyweight_calisthenics'],
    baseIntensityFactor: 0.70,
    tempo: '3-1-1-0',
    formCue: 'Elevate hands on blocks or rings for full stretch, maintain rigid plank core tension.',
    alternatives: ['db_flat_press', 'bb_bench_press'],
  },

  // BACK
  {
    id: 'bb_deadlift',
    name: 'Conventional Barbell Deadlift',
    targetMuscle: 'Posterior Chain & Erector Spinae',
    secondaryMuscles: ['Lats', 'Glutes', 'Hamstrings', 'Traps'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym'],
    benchmarkLiftKey: 'deadliftKg',
    baseIntensityFactor: 0.80,
    tempo: '2-1-1-0',
    formCue: 'Brace core with Valsalva, pull slack out of bar, drive floor away through midfoot.',
    alternatives: ['trap_bar_deadlift', 'romanian_deadlift', 'db_romanian_deadlift'],
  },
  {
    id: 'bb_bent_row',
    name: 'Barbell Bent-Over Row (Pendlay Style)',
    targetMuscle: 'Back (Rhomboids & Mid-Traps)',
    secondaryMuscles: ['Lats', 'Biceps', 'Rear Delts'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym'],
    benchmarkLiftKey: 'deadliftKg',
    baseIntensityFactor: 0.65,
    tempo: '2-0-1-1',
    formCue: 'Torso parallel to floor, row towards lower sternum, pull elbows back without jerking hips.',
    alternatives: ['chest_supported_db_row', 'seated_cable_row', 't_bar_row'],
  },
  {
    id: 'lat_pulldown',
    name: 'Neutral/Wide Grip Lat Pulldown',
    targetMuscle: 'Back (Latissimus Dorsi)',
    secondaryMuscles: ['Biceps', 'Brachialis', 'Teres Major'],
    equipment: 'cable',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.70,
    tempo: '3-0-1-1',
    formCue: 'Drive elbows down and into side pockets, slight thoracic extension, avoid excessive backward lean.',
    alternatives: ['weighted_pullups', 'single_arm_lat_pulldown', 'band_lat_pulldown'],
  },
  {
    id: 'weighted_pullups',
    name: 'Weighted Overhand Pull-Ups',
    targetMuscle: 'Back (Lats & Upper Back)',
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    equipment: 'bodyweight',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'bodyweight_calisthenics'],
    baseIntensityFactor: 0.75,
    tempo: '2-1-1-0',
    formCue: 'Full dead-hang at bottom, depress shoulder blades before pulling chest to bar.',
    alternatives: ['lat_pulldown', 'inverted_rows', 'assisted_pullup_machine'],
  },
  {
    id: 'chest_supported_db_row',
    name: 'Chest-Supported Incline Dumbbell Row',
    targetMuscle: 'Back (Upper Back / Mid-Traps)',
    secondaryMuscles: ['Rear Delts', 'Biceps'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    baseIntensityFactor: 0.68,
    tempo: '2-1-1-1',
    formCue: 'Lie prone on 45° bench, let shoulders protract at bottom, row and squeeze scapulae together.',
    alternatives: ['seated_cable_row', 't_bar_row', 'bb_bent_row'],
  },
  {
    id: 'seated_cable_row',
    name: 'Seated Cable Row (Close-Grip V-Bar)',
    targetMuscle: 'Back (Mid Back & Lower Lats)',
    secondaryMuscles: ['Biceps', 'Posterior Delts'],
    equipment: 'cable',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.70,
    tempo: '2-1-1-1',
    formCue: 'Keep spine neutral, pull to belly button, stretch lats fully forward on the return.',
    alternatives: ['chest_supported_db_row', 'bb_bent_row', 'single_arm_db_row'],
  },
  {
    id: 'single_arm_db_row',
    name: 'Single-Arm Dumbbell Row (Lawnmower)',
    targetMuscle: 'Back (Unilateral Lats)',
    secondaryMuscles: ['Biceps', 'Core'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    baseIntensityFactor: 0.70,
    tempo: '2-0-1-0',
    formCue: 'Drive elbow towards hip crease in an arc, do not rotate torso excessively.',
    alternatives: ['seated_cable_row', 'chest_supported_db_row'],
  },

  // LEGS - QUADS
  {
    id: 'bb_back_squat',
    name: 'Barbell High-Bar Back Squat',
    targetMuscle: 'Quads & Glutes',
    secondaryMuscles: ['Adductors', 'Erectors', 'Core'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym'],
    benchmarkLiftKey: 'squatKg',
    baseIntensityFactor: 0.75,
    tempo: '3-1-1-0',
    formCue: 'Break at knees and hips together, keep chest tall, descend below parallel, drive knees outward.',
    alternatives: ['hack_squat_machine', 'leg_press', 'db_goblet_squat', 'front_squat'],
  },
  {
    id: 'leg_press',
    name: '45° Incline Leg Press',
    targetMuscle: 'Quads & Glutes',
    secondaryMuscles: ['Adductors'],
    equipment: 'machine',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    benchmarkLiftKey: 'squatKg',
    baseIntensityFactor: 0.85,
    tempo: '3-1-1-0',
    formCue: 'Feet shoulder-width on lower-mid platform, deep knee flexion without lower back lifting off pad.',
    alternatives: ['hack_squat_machine', 'bb_back_squat', 'db_goblet_squat'],
  },
  {
    id: 'hack_squat_machine',
    name: 'Machine Hack Squat',
    targetMuscle: 'Quads (Vastus Lateralis/Medialis)',
    secondaryMuscles: ['Glutes'],
    equipment: 'machine',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    benchmarkLiftKey: 'squatKg',
    baseIntensityFactor: 0.75,
    tempo: '3-1-1-0',
    formCue: 'Plant feet low on platform, push knees over toes in deep knee bend, control 3-second descent.',
    alternatives: ['leg_press', 'bb_back_squat', 'db_bulgarian_split_squat'],
  },
  {
    id: 'leg_extension',
    name: 'Seated Leg Extension Machine',
    targetMuscle: 'Quads (Rectus Femoris Isolation)',
    secondaryMuscles: [],
    equipment: 'machine',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-1',
    formCue: 'Align machine pivot with knee joint, extend fully to lockout, 1-sec squeeze at peak.',
    alternatives: ['sissy_squats', 'db_goblet_squat', 'band_leg_extension'],
  },
  {
    id: 'db_bulgarian_split_squat',
    name: 'Bulgarian Split Squat (Dumbbells)',
    targetMuscle: 'Quads & Glutes (Unilateral)',
    secondaryMuscles: ['Adductors', 'Calves'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only', 'bodyweight_calisthenics'],
    baseIntensityFactor: 0.65,
    tempo: '3-1-1-0',
    formCue: 'Rear foot elevated on bench, lower straight down until back knee almost grazes ground.',
    alternatives: ['db_walking_lunges', 'step_ups', 'hack_squat_machine'],
  },
  {
    id: 'db_goblet_squat',
    name: 'Dumbbell / Kettlebell Goblet Squat',
    targetMuscle: 'Quads & Core',
    secondaryMuscles: ['Glutes'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only', 'bodyweight_calisthenics'],
    baseIntensityFactor: 0.65,
    tempo: '3-1-1-0',
    formCue: 'Hold dumbbell vertically at chest, spread knees, sit deep between hips with upright torso.',
    alternatives: ['bb_back_squat', 'db_bulgarian_split_squat'],
  },

  // LEGS - HAMSTRINGS & GLUTES
  {
    id: 'romanian_deadlift',
    name: 'Barbell Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings & Glutes',
    secondaryMuscles: ['Erectors', 'Lats', 'Grip'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym'],
    benchmarkLiftKey: 'deadliftKg',
    baseIntensityFactor: 0.70,
    tempo: '3-1-1-0',
    formCue: 'Soft knees, push hips backward towards the wall, feel intense hamstring stretch at mid-shin.',
    alternatives: ['db_romanian_deadlift', 'seated_leg_curl', 'lying_leg_curl'],
  },
  {
    id: 'db_romanian_deadlift',
    name: 'Dumbbell Romanian Deadlift',
    targetMuscle: 'Hamstrings & Glute-Ham Tie-in',
    secondaryMuscles: ['Lower Back'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    baseIntensityFactor: 0.68,
    tempo: '3-1-1-0',
    formCue: 'Keep dumbbells gliding tight along shins, neutral spine, hinge hips back.',
    alternatives: ['romanian_deadlift', 'nordic_hamstring_curl'],
  },
  {
    id: 'lying_leg_curl',
    name: 'Lying Hamstring Leg Curl Machine',
    targetMuscle: 'Hamstrings (Knee Flexion)',
    secondaryMuscles: ['Calves (Gastrocnemius)'],
    equipment: 'machine',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-1',
    formCue: 'Keep hips pressed into bench, curl heels to glutes, control the eccentric all the way down.',
    alternatives: ['seated_leg_curl', 'swiss_ball_leg_curl', 'db_lying_hamstring_curl'],
  },
  {
    id: 'seated_leg_curl',
    name: 'Seated Hamstring Leg Curl Machine',
    targetMuscle: 'Hamstrings (Lengthened Position)',
    secondaryMuscles: [],
    equipment: 'machine',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.65,
    tempo: '3-1-1-1',
    formCue: 'Thigh pad clamped tight, hinge forward slightly for deeper hamstring stretch, curl smoothly.',
    alternatives: ['lying_leg_curl', 'romanian_deadlift'],
  },
  {
    id: 'barbell_hip_thrust',
    name: 'Barbell Glute Hip Thrust',
    targetMuscle: 'Glutes (Maximus)',
    secondaryMuscles: ['Hamstrings', 'Adductors'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym'],
    benchmarkLiftKey: 'deadliftKg',
    baseIntensityFactor: 0.75,
    tempo: '2-1-1-1',
    formCue: 'Upper back against bench, chin tucked, drive hips to full extension, 1-sec squeeze at top.',
    alternatives: ['db_glute_bridge', 'cable_pull_through'],
  },

  // SHOULDERS
  {
    id: 'bb_overhead_press',
    name: 'Standing Barbell Overhead Press (OHP)',
    targetMuscle: 'Shoulders (Front & Mid Delts)',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym'],
    benchmarkLiftKey: 'overheadPressKg',
    baseIntensityFactor: 0.75,
    tempo: '2-1-1-0',
    formCue: 'Squeeze glutes and abs, bar rests on anterior delts, press straight overhead clearing head.',
    alternatives: ['seated_db_shoulder_press', 'machine_shoulder_press', 'pike_pushups'],
  },
  {
    id: 'seated_db_shoulder_press',
    name: 'Seated Dumbbell Shoulder Press',
    targetMuscle: 'Shoulders (Anterior & Lateral Delts)',
    secondaryMuscles: ['Triceps'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    benchmarkLiftKey: 'overheadPressKg',
    baseIntensityFactor: 0.70,
    tempo: '3-0-1-0',
    formCue: 'Bench at 75-80°, flare elbows ~45° in scapular plane, press up without clanking weights.',
    alternatives: ['bb_overhead_press', 'machine_shoulder_press'],
  },
  {
    id: 'db_lateral_raise',
    name: 'Standing Dumbbell Lateral Raise',
    targetMuscle: 'Shoulders (Lateral Delt Width)',
    secondaryMuscles: ['Traps'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    baseIntensityFactor: 0.60,
    tempo: '2-1-1-1',
    formCue: 'Lead with elbows slightly in front of torso plane, tilt pinkies slightly up, control the drop.',
    alternatives: ['cable_lateral_raise', 'machine_lateral_raise', 'band_lateral_raise'],
  },
  {
    id: 'cable_lateral_raise',
    name: 'Behind-the-Back Cable Lateral Raise',
    targetMuscle: 'Shoulders (Lateral Delts - Constant Tension)',
    secondaryMuscles: ['Traps'],
    equipment: 'cable',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.60,
    tempo: '2-1-1-1',
    formCue: 'Cable set to hand height, step across body, raise arm until parallel with floor.',
    alternatives: ['db_lateral_raise', 'machine_lateral_raise'],
  },
  {
    id: 'cable_face_pull',
    name: 'Rope Cable Face Pull',
    targetMuscle: 'Rear Delts & Rotator Cuff',
    secondaryMuscles: ['Rhomboids', 'Mid/Lower Traps'],
    equipment: 'cable',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.60,
    tempo: '2-1-1-1',
    formCue: 'Pull rope towards eye level, externally rotate wrists so thumbs point backward, squeeze rear delts.',
    alternatives: ['rear_delt_reverse_fly', 'band_pull_aparts'],
  },
  {
    id: 'rear_delt_reverse_fly',
    name: 'Reverse Pec Deck / Dumbbell Rear Delt Fly',
    targetMuscle: 'Rear Delts',
    secondaryMuscles: ['Rhomboids'],
    equipment: 'machine',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only', 'cables_machines'],
    baseIntensityFactor: 0.60,
    tempo: '2-1-1-1',
    formCue: 'Slight elbow bend, swing arms outward like wings, isolate rear delts without excessive trap shrug.',
    alternatives: ['cable_face_pull', 'band_pull_aparts'],
  },

  // ARMS - BICEPS
  {
    id: 'bb_barbell_curl',
    name: 'Standing Barbell / EZ-Bar Curl',
    targetMuscle: 'Biceps (Short & Long Head)',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-0',
    formCue: 'Pin elbows to sides, curl smoothly without swinging lower back, full contraction at top.',
    alternatives: ['db_incline_bicep_curl', 'cable_bicep_curl'],
  },
  {
    id: 'db_incline_bicep_curl',
    name: 'Incline Dumbbell Bicep Curl (45°)',
    targetMuscle: 'Biceps (Long Head Stretch)',
    secondaryMuscles: ['Brachialis'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    baseIntensityFactor: 0.62,
    tempo: '3-1-1-0',
    formCue: 'Lie back on 45° incline bench, let arms hang straight down for maximum bicep stretch, supinate at top.',
    alternatives: ['bb_barbell_curl', 'preacher_curl', 'cable_bicep_curl'],
  },
  {
    id: 'db_hammer_curl',
    name: 'Standing Dumbbell Hammer Curl',
    targetMuscle: 'Brachialis & Brachioradialis (Arm Thickness)',
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-0',
    formCue: 'Neutral palms facing each other throughout the curl, powerful contraction for forearm width.',
    alternatives: ['rope_cable_hammer_curl', 'reverse_ez_curl'],
  },
  {
    id: 'cable_bicep_curl',
    name: 'Straight Bar Cable Bicep Curl',
    targetMuscle: 'Biceps (Constant Cable Tension)',
    secondaryMuscles: ['Brachialis'],
    equipment: 'cable',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-1',
    formCue: 'Stand upright, elbows stationary, squeeze biceps hard at peak contraction.',
    alternatives: ['bb_barbell_curl', 'db_incline_bicep_curl'],
  },

  // ARMS - TRICEPS
  {
    id: 'cable_rope_pushdown',
    name: 'Rope Cable Tricep Pushdown',
    targetMuscle: 'Triceps (Lateral Head & Horseshoe)',
    secondaryMuscles: [],
    equipment: 'cable',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-1',
    formCue: 'Lock elbows by ribs, push rope down and spread tips outward at bottom lockout.',
    alternatives: ['db_overhead_tricep_extension', 'skullcrushers', 'bench_dips'],
  },
  {
    id: 'skullcrushers',
    name: 'EZ-Bar / Dumbbell Skull Crushers',
    targetMuscle: 'Triceps (Long Head Mass)',
    secondaryMuscles: ['Chest'],
    equipment: 'barbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    baseIntensityFactor: 0.68,
    tempo: '3-1-1-0',
    formCue: 'Lower bar towards forehead or crown of head, keeping elbows pointing straight up, extend cleanly.',
    alternatives: ['cable_overhead_tricep_ext', 'db_overhead_tricep_extension'],
  },
  {
    id: 'db_overhead_tricep_extension',
    name: 'Seated Dumbbell Overhead Tricep Extension',
    targetMuscle: 'Triceps (Long Head in Lengthened Position)',
    secondaryMuscles: [],
    equipment: 'dumbbell',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'dumbbells_only'],
    baseIntensityFactor: 0.65,
    tempo: '3-1-1-0',
    formCue: 'Hold dumbbell vertically overhead with both hands, lower deep behind neck, press to lockout.',
    alternatives: ['cable_rope_pushdown', 'skullcrushers'],
  },

  // CALVES & ABS
  {
    id: 'standing_calf_raise',
    name: 'Standing Calf Raise (Machine / Barbell)',
    targetMuscle: 'Calves (Gastrocnemius)',
    secondaryMuscles: ['Soleus'],
    equipment: 'machine',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'cables_machines', 'dumbbells_only'],
    baseIntensityFactor: 0.70,
    tempo: '3-2-1-1',
    formCue: 'Full deep stretch at bottom (2-sec pause), drive onto big toes, 1-sec peak squeeze.',
    alternatives: ['seated_calf_raise', 'leg_press_calf_press'],
  },
  {
    id: 'hanging_leg_raise',
    name: 'Hanging Leg / Knee Raise',
    targetMuscle: 'Abs & Hip Flexors',
    secondaryMuscles: ['Obliques'],
    equipment: 'bodyweight',
    compatibleEquipment: ['commercial_gym', 'home_gym', 'bodyweight_calisthenics'],
    baseIntensityFactor: 0.60,
    tempo: '2-1-1-0',
    formCue: 'Curl pelvis up towards ribs rather than simply swinging legs, control descent without swinging.',
    alternatives: ['cable_crunch', 'ab_wheel_rollout', 'plank'],
  },
  {
    id: 'cable_crunch',
    name: 'Kneeling Cable Rope Crunch',
    targetMuscle: 'Abs (Rectus Abdominis)',
    secondaryMuscles: [],
    equipment: 'cable',
    compatibleEquipment: ['commercial_gym', 'cables_machines'],
    baseIntensityFactor: 0.65,
    tempo: '2-1-1-1',
    formCue: 'Hold rope beside temples, crunch elbows towards knees by flexing spine, exhale completely.',
    alternatives: ['hanging_leg_raise', 'ab_wheel_rollout'],
  },
];

/**
 * Helper to calculate suggested working set load from benchmark 1RM
 */
export function calculateWorkingWeight(
  exercise: ExerciseDefinition,
  targetReps: number,
  recentLifts: {
    benchPressKg?: number;
    squatKg?: number;
    deadliftKg?: number;
    overheadPressKg?: number;
  }
): number | undefined {
  if (!exercise.benchmarkLiftKey) return undefined;
  const raw1RM = recentLifts[exercise.benchmarkLiftKey];
  if (!raw1RM || raw1RM <= 0) return undefined;

  // Epley formula inverse: Percentage of 1RM ≈ 1 / (1 + targetReps / 30)
  // For 8 reps: ~79% of 1RM; For 5 reps: ~86%; For 12 reps: ~71%
  const repPct = 1 / (1 + targetReps / 30);
  const exerciseFactor = exercise.baseIntensityFactor / 0.75; // normalization
  const calculated = raw1RM * repPct * exerciseFactor;
  // Round to nearest 2.5 kg
  return Math.round(calculated / 2.5) * 2.5;
}

/**
 * Filter exercises compatible with user's available equipment
 */
export function getCompatibleExercise(
  targetMuscleGroup: string,
  equipment: EquipmentAvailability,
  preferredName?: string
): ExerciseDefinition {
  if (preferredName) {
    const found = EXERCISE_DATABASE.find((e) => e.name.toLowerCase().includes(preferredName.toLowerCase()));
    if (found && (equipment === 'commercial_gym' || found.compatibleEquipment.includes(equipment))) {
      return found;
    }
  }

  // Filter pool
  const matches = EXERCISE_DATABASE.filter(
    (e) =>
      e.targetMuscle.toLowerCase().includes(targetMuscleGroup.toLowerCase()) &&
      (equipment === 'commercial_gym' || e.compatibleEquipment.includes(equipment))
  );

  if (matches.length > 0) {
    return matches[0];
  }

  // Fallback to any exercise matching muscle
  const fallback = EXERCISE_DATABASE.find((e) =>
    e.targetMuscle.toLowerCase().includes(targetMuscleGroup.toLowerCase())
  );
  return fallback || EXERCISE_DATABASE[0];
}

/**
 * Generator parameters
 */
export interface GeneratePlanOptions {
  goal: WorkoutGoal;
  split: TrainingSplit;
  equipment: EquipmentAvailability;
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
  recentLifts: {
    benchPressKg?: number;
    squatKg?: number;
    deadliftKg?: number;
    overheadPressKg?: number;
  };
  priorityMuscleGroup?: string; // e.g. 'chest', 'back', 'arms', 'legs', 'balanced'
}

/**
 * Main algorithmic workout plan generator
 */
export function generatePersonalizedWorkoutPlan(options: GeneratePlanOptions): PersonalizedWorkoutPlan {
  const { goal, split, equipment, daysPerWeek, experienceLevel, recentLifts, priorityMuscleGroup } = options;

  // Set count multiplier based on experience
  const baseSetCount = experienceLevel === 'novice' ? 3 : experienceLevel === 'intermediate' ? 3 : 4;
  const isHighIntensity = goal === 'strength' || goal === 'powerbuilding';

  const defaultRepRange =
    goal === 'strength' ? '4-6 reps' :
    goal === 'powerbuilding' ? '6-8 reps' :
    goal === 'cutting_density' ? '12-15 reps' : '8-12 reps';

  const defaultRir = goal === 'strength' ? 2 : goal === 'cutting_density' ? 1 : 1;
  const defaultRest = goal === 'strength' ? 180 : goal === 'cutting_density' ? 75 : 105;

  const buildExerciseItem = (
    exDef: ExerciseDefinition,
    customSets?: number,
    customRepRange?: string,
    customRir?: number,
    customRest?: number
  ): ExerciseItem => {
    const sets = customSets || baseSetCount;
    const repRange = customRepRange || defaultRepRange;
    const targetRir = customRir !== undefined ? customRir : defaultRir;
    const restSeconds = customRest !== undefined ? customRest : defaultRest;
    
    // Parse target reps for 1RM calculation
    const avgReps = parseInt(repRange.split('-')[0]) || 8;
    const calculatedWeightKg = calculateWorkingWeight(exDef, avgReps, recentLifts);

    return {
      id: `${exDef.id}_${Math.random().toString(36).substring(2, 7)}`,
      name: exDef.name,
      targetMuscle: exDef.targetMuscle,
      secondaryMuscles: exDef.secondaryMuscles,
      sets,
      repRange,
      targetRir,
      restSeconds,
      tempo: exDef.tempo,
      formCue: exDef.formCue,
      equipment: exDef.equipment,
      benchmarkLiftKey: exDef.benchmarkLiftKey,
      percentageOf1RM: exDef.benchmarkLiftKey ? Math.round((1 / (1 + avgReps / 30)) * 100) : undefined,
      calculatedWeightKg,
      completedSets: new Array(sets).fill(false),
      loggedReps: new Array(sets).fill(avgReps),
      loggedWeightsKg: new Array(sets).fill(calculatedWeightKg || 0),
    };
  };

  const schedule: WorkoutDay[] = [];

  // 1. PUSH / PULL / LEGS SPLIT
  if (split === 'ppl') {
    const is6Day = daysPerWeek >= 6;
    const is5Day = daysPerWeek === 5;
    const is4Day = daysPerWeek === 4;

    // Push Day A
    schedule.push({
      dayNumber: 1,
      dayName: 'Day 1: Push A (Chest Primary & Anterior Focus)',
      focus: 'Chest, Front Delts & Triceps',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(
          getCompatibleExercise('Chest (Mid/Lower)', equipment, 'Barbell Flat Bench Press'),
          isHighIntensity ? 4 : 3,
          isHighIntensity ? '5-6 reps' : '6-8 reps',
          1,
          150
        ),
        buildExerciseItem(
          getCompatibleExercise('Chest (Clavicular/Upper)', equipment, 'Incline Dumbbell Press'),
          3,
          '8-10 reps',
          1,
          105
        ),
        buildExerciseItem(
          getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Lateral Raise'),
          4,
          '12-15 reps',
          1,
          75
        ),
        buildExerciseItem(
          getCompatibleExercise('Chest (Isolation)', equipment, 'Pec Deck'),
          3,
          '10-12 reps',
          1,
          90
        ),
        buildExerciseItem(
          getCompatibleExercise('Triceps (Lateral Head', equipment, 'Pushdown'),
          3,
          '10-12 reps',
          1,
          75
        ),
        buildExerciseItem(
          getCompatibleExercise('Triceps (Long Head', equipment, 'Overhead Tricep Extension'),
          3,
          '12-15 reps',
          1,
          75
        ),
      ],
    });

    // Pull Day A
    schedule.push({
      dayNumber: 2,
      dayName: 'Day 2: Pull A (Lat Width & Upper Back Density)',
      focus: 'Lats, Rhomboids, Rear Delts & Biceps',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(
          getCompatibleExercise('Back (Latissimus Dorsi)', equipment, 'Lat Pulldown'),
          4,
          '6-8 reps',
          1,
          120
        ),
        buildExerciseItem(
          getCompatibleExercise('Back (Rhomboids & Mid-Traps)', equipment, 'Bent-Over Row'),
          3,
          '8-10 reps',
          1,
          120
        ),
        buildExerciseItem(
          getCompatibleExercise('Back (Upper Back', equipment, 'Chest-Supported Incline'),
          3,
          '10-12 reps',
          1,
          90
        ),
        buildExerciseItem(
          getCompatibleExercise('Rear Delts & Rotator Cuff', equipment, 'Cable Face Pull'),
          4,
          '12-15 reps',
          1,
          75
        ),
        buildExerciseItem(
          getCompatibleExercise('Biceps (Short & Long Head)', equipment, 'Barbell / EZ-Bar Curl'),
          3,
          '8-10 reps',
          1,
          90
        ),
        buildExerciseItem(
          getCompatibleExercise('Brachialis & Brachioradialis', equipment, 'Hammer Curl'),
          3,
          '10-12 reps',
          1,
          75
        ),
      ],
    });

    // Legs Day A
    schedule.push({
      dayNumber: 3,
      dayName: 'Day 3: Legs A (Quad Dominant & Calves)',
      focus: 'Quads, Glutes, Hamstrings & Calves',
      isRestDay: false,
      targetVolumeSets: 17,
      estimatedDurationMin: 70,
      exercises: [
        buildExerciseItem(
          getCompatibleExercise('Quads & Glutes', equipment, 'Barbell High-Bar Back Squat'),
          isHighIntensity ? 4 : 3,
          isHighIntensity ? '5-6 reps' : '6-8 reps',
          2,
          180
        ),
        buildExerciseItem(
          getCompatibleExercise('Quads (Rectus Femoris', equipment, 'Leg Extension'),
          3,
          '10-12 reps',
          1,
          90
        ),
        buildExerciseItem(
          getCompatibleExercise('Hamstrings (Lengthened', equipment, 'Seated Leg Curl'),
          4,
          '10-12 reps',
          1,
          90
        ),
        buildExerciseItem(
          getCompatibleExercise('Quads & Glutes (Unilateral)', equipment, 'Bulgarian Split Squat'),
          3,
          '10-12 reps',
          1,
          90
        ),
        buildExerciseItem(
          getCompatibleExercise('Calves (Gastrocnemius)', equipment, 'Standing Calf Raise'),
          4,
          '12-15 reps',
          1,
          60
        ),
      ],
    });

    if (is6Day) {
      // Push Day B
      schedule.push({
        dayNumber: 4,
        dayName: 'Day 4: Push B (Shoulder Overhead & Upper Pec Focus)',
        focus: 'Delts, Clavicular Pec & Tricep Long Head',
        isRestDay: false,
        targetVolumeSets: 18,
        estimatedDurationMin: 65,
        exercises: [
          buildExerciseItem(
            getCompatibleExercise('Shoulders (Front & Mid Delts)', equipment, 'Standing Barbell Overhead Press'),
            isHighIntensity ? 4 : 3,
            isHighIntensity ? '5-6 reps' : '6-8 reps',
            2,
            150
          ),
          buildExerciseItem(
            getCompatibleExercise('Chest (Clavicular/Upper)', equipment, 'Incline Dumbbell Press'),
            4,
            '8-10 reps',
            1,
            105
          ),
          buildExerciseItem(
            getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Cable Lateral Raise'),
            4,
            '12-15 reps',
            1,
            75
          ),
          buildExerciseItem(
            getCompatibleExercise('Chest (Lower) & Triceps', equipment, 'Chest Dips'),
            3,
            '8-12 reps',
            1,
            90
          ),
          buildExerciseItem(
            getCompatibleExercise('Triceps (Long Head Mass)', equipment, 'Skull Crushers'),
            3,
            '10-12 reps',
            1,
            90
          ),
        ],
      });

      // Pull Day B
      schedule.push({
        dayNumber: 5,
        dayName: 'Day 5: Pull B (Posterior Chain & Unilateral Rows)',
        focus: 'Mid Back, Hamstrings & Bicep Peak',
        isRestDay: false,
        targetVolumeSets: 18,
        estimatedDurationMin: 65,
        exercises: [
          buildExerciseItem(
            getCompatibleExercise('Posterior Chain & Erector', equipment, 'Conventional Barbell Deadlift'),
            isHighIntensity ? 4 : 3,
            isHighIntensity ? '4-5 reps' : '6-8 reps',
            2,
            180
          ),
          buildExerciseItem(
            getCompatibleExercise('Back (Lats & Upper Back)', equipment, 'Weighted Overhand Pull-Ups'),
            3,
            '6-8 reps',
            1,
            120
          ),
          buildExerciseItem(
            getCompatibleExercise('Back (Unilateral Lats)', equipment, 'Single-Arm Dumbbell Row'),
            3,
            '10-12 reps',
            1,
            90
          ),
          buildExerciseItem(
            getCompatibleExercise('Rear Delts', equipment, 'Reverse Pec Deck'),
            4,
            '12-15 reps',
            1,
            75
          ),
          buildExerciseItem(
            getCompatibleExercise('Biceps (Long Head Stretch)', equipment, 'Incline Dumbbell Bicep Curl'),
            3,
            '10-12 reps',
            1,
            90
          ),
          buildExerciseItem(
            getCompatibleExercise('Abs & Hip Flexors', equipment, 'Hanging Leg Raise'),
            3,
            '12-15 reps',
            1,
            60
          ),
        ],
      });

      // Legs Day B
      schedule.push({
        dayNumber: 6,
        dayName: 'Day 6: Legs B (Posterior Chain & Hamstring Stretch)',
        focus: 'Hamstrings, Glutes, Adductors & Calves',
        isRestDay: false,
        targetVolumeSets: 17,
        estimatedDurationMin: 65,
        exercises: [
          buildExerciseItem(
            getCompatibleExercise('Hamstrings & Glutes', equipment, 'Barbell Romanian Deadlift'),
            4,
            '6-8 reps',
            2,
            150
          ),
          buildExerciseItem(
            getCompatibleExercise('Quads & Glutes', equipment, 'Machine Hack Squat'),
            3,
            '8-10 reps',
            1,
            120
          ),
          buildExerciseItem(
            getCompatibleExercise('Hamstrings (Knee Flexion)', equipment, 'Lying Hamstring Leg Curl'),
            4,
            '10-12 reps',
            1,
            90
          ),
          buildExerciseItem(
            getCompatibleExercise('Glutes (Maximus)', equipment, 'Barbell Glute Hip Thrust'),
            3,
            '8-10 reps',
            1,
            120
          ),
          buildExerciseItem(
            getCompatibleExercise('Calves (Gastrocnemius)', equipment, 'Standing Calf Raise'),
            4,
            '12-15 reps',
            1,
            60
          ),
        ],
      });

      // Day 7 Rest
      schedule.push({
        dayNumber: 7,
        dayName: 'Day 7: Active Recovery & Muscle Hyperemia',
        focus: 'Rest, Protein Synthesis, Myofibrillar Repair & Mobility',
        isRestDay: true,
        targetVolumeSets: 0,
        estimatedDurationMin: 0,
        exercises: [],
      });
    } else {
      // 3 or 4-day PPL configuration with rest days inserted
      schedule.push({
        dayNumber: 4,
        dayName: 'Day 4: Systemic Recovery & CNS Deload',
        focus: 'Active Rest, Walking & Glycogen Replenishment',
        isRestDay: true,
        targetVolumeSets: 0,
        estimatedDurationMin: 0,
        exercises: [],
      });

      if (is5Day || is4Day) {
        schedule.push({
          dayNumber: 5,
          dayName: 'Day 5: Upper Hypertrophy / Weak-Point Focus',
          focus: 'Chest, Back, Delts & Arms',
          isRestDay: false,
          targetVolumeSets: 16,
          estimatedDurationMin: 60,
          exercises: [
            buildExerciseItem(getCompatibleExercise('Chest (Clavicular/Upper)', equipment, 'Incline Dumbbell Press'), 3, '8-10 reps'),
            buildExerciseItem(getCompatibleExercise('Back (Latissimus Dorsi)', equipment, 'Lat Pulldown'), 3, '8-10 reps'),
            buildExerciseItem(getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Lateral Raise'), 4, '12-15 reps'),
            buildExerciseItem(getCompatibleExercise('Triceps (Lateral Head', equipment, 'Pushdown'), 3, '10-12 reps'),
            buildExerciseItem(getCompatibleExercise('Biceps (Short & Long Head)', equipment, 'Barbell / EZ-Bar Curl'), 3, '10-12 reps'),
          ],
        });
      }

      schedule.push({
        dayNumber: 6,
        dayName: 'Day 6: Lower Hypertrophy & Core',
        focus: 'Quads, Hamstrings, Calves & Abs',
        isRestDay: is4Day ? true : false,
        targetVolumeSets: is4Day ? 0 : 15,
        estimatedDurationMin: is4Day ? 0 : 55,
        exercises: is4Day ? [] : [
          buildExerciseItem(getCompatibleExercise('Hamstrings & Glutes', equipment, 'Barbell Romanian Deadlift'), 3, '8-10 reps'),
          buildExerciseItem(getCompatibleExercise('Quads & Glutes', equipment, '45° Incline Leg Press'), 3, '10-12 reps'),
          buildExerciseItem(getCompatibleExercise('Hamstrings (Lengthened', equipment, 'Seated Leg Curl'), 3, '10-12 reps'),
          buildExerciseItem(getCompatibleExercise('Calves (Gastrocnemius)', equipment, 'Standing Calf Raise'), 3, '12-15 reps'),
          buildExerciseItem(getCompatibleExercise('Abs & Hip Flexors', equipment, 'Hanging Leg Raise'), 3, '12-15 reps'),
        ],
      });

      schedule.push({
        dayNumber: 7,
        dayName: 'Day 7: Full Rest & Nutrition Prep',
        focus: 'Sleep, Meal Prep & Hydration',
        isRestDay: true,
        targetVolumeSets: 0,
        estimatedDurationMin: 0,
        exercises: [],
      });
    }
  }

  // 2. UPPER / LOWER SPLIT (4 Days)
  else if (split === 'upper_lower') {
    schedule.push({
      dayNumber: 1,
      dayName: 'Day 1: Upper A (Heavy Compound & Strength Focus)',
      focus: 'Chest, Back, Shoulders & Arms',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Chest (Mid/Lower)', equipment, 'Barbell Flat Bench Press'), 4, '5-6 reps', 2, 150),
        buildExerciseItem(getCompatibleExercise('Back (Rhomboids & Mid-Traps)', equipment, 'Bent-Over Row'), 4, '6-8 reps', 2, 120),
        buildExerciseItem(getCompatibleExercise('Shoulders (Front & Mid Delts)', equipment, 'Standing Barbell Overhead Press'), 3, '6-8 reps', 2, 120),
        buildExerciseItem(getCompatibleExercise('Back (Lats & Upper Back)', equipment, 'Weighted Overhand Pull-Ups'), 3, '6-8 reps', 1, 105),
        buildExerciseItem(getCompatibleExercise('Triceps (Lateral Head', equipment, 'Pushdown'), 3, '10-12 reps', 1, 75),
        buildExerciseItem(getCompatibleExercise('Biceps (Short & Long Head)', equipment, 'Barbell / EZ-Bar Curl'), 3, '8-10 reps', 1, 75),
      ],
    });

    schedule.push({
      dayNumber: 2,
      dayName: 'Day 2: Lower A (Quad Dominant Squat & Calves)',
      focus: 'Quads, Adductors, Hamstrings & Calves',
      isRestDay: false,
      targetVolumeSets: 17,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Quads & Glutes', equipment, 'Barbell High-Bar Back Squat'), 4, '5-6 reps', 2, 180),
        buildExerciseItem(getCompatibleExercise('Hamstrings (Lengthened', equipment, 'Seated Leg Curl'), 4, '8-10 reps', 1, 90),
        buildExerciseItem(getCompatibleExercise('Quads & Glutes (Unilateral)', equipment, 'Bulgarian Split Squat'), 3, '10-12 reps', 1, 90),
        buildExerciseItem(getCompatibleExercise('Quads (Rectus Femoris', equipment, 'Leg Extension'), 3, '12-15 reps', 1, 75),
        buildExerciseItem(getCompatibleExercise('Calves (Gastrocnemius)', equipment, 'Standing Calf Raise'), 4, '12-15 reps', 1, 60),
      ],
    });

    schedule.push({
      dayNumber: 3,
      dayName: 'Day 3: Mid-Week Active Recovery',
      focus: 'Mobility, LISS Cardio & Protein Saturation',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });

    schedule.push({
      dayNumber: 4,
      dayName: 'Day 4: Upper B (Hypertrophy & Incline/Lateral Delts)',
      focus: 'Upper Pec, Lats, Lateral Delts & Arms',
      isRestDay: false,
      targetVolumeSets: 19,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Chest (Clavicular/Upper)', equipment, 'Incline Dumbbell Press'), 4, '8-10 reps', 1, 105),
        buildExerciseItem(getCompatibleExercise('Back (Latissimus Dorsi)', equipment, 'Lat Pulldown'), 4, '8-10 reps', 1, 105),
        buildExerciseItem(getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Lateral Raise'), 4, '12-15 reps', 1, 75),
        buildExerciseItem(getCompatibleExercise('Rear Delts & Rotator Cuff', equipment, 'Cable Face Pull'), 3, '12-15 reps', 1, 75),
        buildExerciseItem(getCompatibleExercise('Triceps (Long Head Mass)', equipment, 'Skull Crushers'), 3, '10-12 reps', 1, 90),
        buildExerciseItem(getCompatibleExercise('Brachialis & Brachioradialis', equipment, 'Hammer Curl'), 3, '10-12 reps', 1, 75),
      ],
    });

    schedule.push({
      dayNumber: 5,
      dayName: 'Day 5: Lower B (Hinge & Hamstring Dominant)',
      focus: 'Hamstrings, Glutes, Quads & Core',
      isRestDay: false,
      targetVolumeSets: 17,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Hamstrings & Glutes', equipment, 'Barbell Romanian Deadlift'), 4, '6-8 reps', 2, 150),
        buildExerciseItem(getCompatibleExercise('Quads & Glutes', equipment, '45° Incline Leg Press'), 4, '10-12 reps', 1, 120),
        buildExerciseItem(getCompatibleExercise('Hamstrings (Knee Flexion)', equipment, 'Lying Hamstring Leg Curl'), 3, '10-12 reps', 1, 90),
        buildExerciseItem(getCompatibleExercise('Glutes (Maximus)', equipment, 'Barbell Glute Hip Thrust'), 3, '8-10 reps', 1, 105),
        buildExerciseItem(getCompatibleExercise('Abs & Hip Flexors', equipment, 'Hanging Leg Raise'), 3, '12-15 reps', 1, 60),
      ],
    });

    schedule.push({
      dayNumber: 6,
      dayName: 'Day 6: Weekend Rest & Glycogen Loading',
      focus: 'Muscle Tissue Remodeling',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });

    schedule.push({
      dayNumber: 7,
      dayName: 'Day 7: Full CNS Restoration',
      focus: 'Sleep Optimization & Preparation',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });
  }

  // 3. FULL BODY SPLIT (3 Days)
  else if (split === 'full_body') {
    schedule.push({
      dayNumber: 1,
      dayName: 'Day 1: Full Body A (Squat & Horizontal Push/Pull)',
      focus: 'Quads, Chest, Upper Back & Calves',
      isRestDay: false,
      targetVolumeSets: 16,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Quads & Glutes', equipment, 'Barbell High-Bar Back Squat'), 4, '6-8 reps', 2, 180),
        buildExerciseItem(getCompatibleExercise('Chest (Mid/Lower)', equipment, 'Barbell Flat Bench Press'), 3, '6-8 reps', 1, 120),
        buildExerciseItem(getCompatibleExercise('Back (Rhomboids & Mid-Traps)', equipment, 'Bent-Over Row'), 3, '8-10 reps', 1, 105),
        buildExerciseItem(getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Lateral Raise'), 3, '12-15 reps', 1, 75),
        buildExerciseItem(getCompatibleExercise('Biceps (Short & Long Head)', equipment, 'Barbell / EZ-Bar Curl'), 3, '10-12 reps', 1, 75),
      ],
    });

    schedule.push({
      dayNumber: 2,
      dayName: 'Day 2: Full Body Recovery Day',
      focus: 'Rest & Repair',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });

    schedule.push({
      dayNumber: 3,
      dayName: 'Day 3: Full Body B (Deadlift Hinge & Overhead Press)',
      focus: 'Hamstrings, Shoulders, Lats & Triceps',
      isRestDay: false,
      targetVolumeSets: 16,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Posterior Chain & Erector', equipment, 'Conventional Barbell Deadlift'), 4, '5-6 reps', 2, 180),
        buildExerciseItem(getCompatibleExercise('Shoulders (Front & Mid Delts)', equipment, 'Standing Barbell Overhead Press'), 3, '6-8 reps', 2, 120),
        buildExerciseItem(getCompatibleExercise('Back (Latissimus Dorsi)', equipment, 'Lat Pulldown'), 3, '8-10 reps', 1, 105),
        buildExerciseItem(getCompatibleExercise('Chest (Clavicular/Upper)', equipment, 'Incline Dumbbell Press'), 3, '8-10 reps', 1, 90),
        buildExerciseItem(getCompatibleExercise('Triceps (Lateral Head', equipment, 'Pushdown'), 3, '10-12 reps', 1, 75),
      ],
    });

    schedule.push({
      dayNumber: 4,
      dayName: 'Day 4: Mid-Week Active Rest',
      focus: 'Protein Uptake & Cellular Hydration',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });

    schedule.push({
      dayNumber: 5,
      dayName: 'Day 5: Full Body C (Leg Press & Vertical Pull/Dips)',
      focus: 'Quads, Hamstrings, Lats, Chest & Arms',
      isRestDay: false,
      targetVolumeSets: 16,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Quads & Glutes', equipment, '45° Incline Leg Press'), 4, '8-10 reps', 1, 120),
        buildExerciseItem(getCompatibleExercise('Hamstrings (Lengthened', equipment, 'Seated Leg Curl'), 3, '10-12 reps', 1, 90),
        buildExerciseItem(getCompatibleExercise('Back (Lats & Upper Back)', equipment, 'Weighted Overhand Pull-Ups'), 3, '6-8 reps', 1, 105),
        buildExerciseItem(getCompatibleExercise('Chest (Lower) & Triceps', equipment, 'Chest Dips'), 3, '8-12 reps', 1, 90),
        buildExerciseItem(getCompatibleExercise('Brachialis & Brachioradialis', equipment, 'Hammer Curl'), 3, '10-12 reps', 1, 75),
      ],
    });

    schedule.push({
      dayNumber: 6,
      dayName: 'Day 6: Weekend Rest',
      focus: 'Passive Rest',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });

    schedule.push({
      dayNumber: 7,
      dayName: 'Day 7: Weekly Review & Recovery',
      focus: 'Rest',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });
  }

  // 4. ARNOLD SPLIT (Chest/Back, Shoulders/Arms, Legs)
  else if (split === 'arnold') {
    schedule.push({
      dayNumber: 1,
      dayName: 'Day 1: Chest & Back (Antagonistic Upper Torso)',
      focus: 'Pecs, Lats, Rhomboids & Mid-Traps',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Chest (Mid/Lower)', equipment, 'Barbell Flat Bench Press'), 4, '6-8 reps'),
        buildExerciseItem(getCompatibleExercise('Back (Lats & Upper Back)', equipment, 'Weighted Overhand Pull-Ups'), 4, '6-8 reps'),
        buildExerciseItem(getCompatibleExercise('Chest (Clavicular/Upper)', equipment, 'Incline Dumbbell Press'), 3, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Back (Rhomboids & Mid-Traps)', equipment, 'Bent-Over Row'), 3, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Chest (Isolation)', equipment, 'Pec Deck'), 3, '12-15 reps'),
      ],
    });

    schedule.push({
      dayNumber: 2,
      dayName: 'Day 2: Shoulders & Arms (The Gun Show & Cannonball Delts)',
      focus: 'Delts, Biceps, Triceps & Forearms',
      isRestDay: false,
      targetVolumeSets: 19,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Shoulders (Front & Mid Delts)', equipment, 'Seated Dumbbell Shoulder Press'), 4, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Lateral Raise'), 4, '12-15 reps'),
        buildExerciseItem(getCompatibleExercise('Rear Delts & Rotator Cuff', equipment, 'Cable Face Pull'), 3, '12-15 reps'),
        buildExerciseItem(getCompatibleExercise('Biceps (Short & Long Head)', equipment, 'Barbell / EZ-Bar Curl'), 3, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Triceps (Long Head Mass)', equipment, 'Skull Crushers'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Brachialis & Brachioradialis', equipment, 'Hammer Curl'), 3, '10-12 reps'),
      ],
    });

    schedule.push({
      dayNumber: 3,
      dayName: 'Day 3: Legs & Lower Abs (Quad & Hamstring Destroy)',
      focus: 'Quads, Hamstrings, Glutes, Calves & Abs',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 70,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Quads & Glutes', equipment, 'Barbell High-Bar Back Squat'), 4, '6-8 reps'),
        buildExerciseItem(getCompatibleExercise('Hamstrings & Glutes', equipment, 'Barbell Romanian Deadlift'), 4, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Quads (Rectus Femoris', equipment, 'Leg Extension'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Hamstrings (Lengthened', equipment, 'Seated Leg Curl'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Calves (Gastrocnemius)', equipment, 'Standing Calf Raise'), 4, '12-15 reps'),
      ],
    });

    schedule.push({
      dayNumber: 4,
      dayName: 'Day 4: Systemic CNS Recovery',
      focus: 'Active Rest',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });

    schedule.push({
      dayNumber: 5,
      dayName: 'Day 5: Chest & Back (Volume & Pump Focus)',
      focus: 'Upper Torso Antagonistic Supersets',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Chest (Clavicular/Upper)', equipment, 'Incline Dumbbell Press'), 4, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Back (Latissimus Dorsi)', equipment, 'Lat Pulldown'), 4, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Chest (Mid/Lower)', equipment, 'Flat Dumbbell Bench Press'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Back (Upper Back', equipment, 'Chest-Supported Incline'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Chest (Lower/Sternal)', equipment, 'Standing Cable Fly'), 3, '12-15 reps'),
      ],
    });

    schedule.push({
      dayNumber: 6,
      dayName: 'Day 6: Shoulders & Arms (High Frequency Overload)',
      focus: 'Lateral Delts, Biceps & Triceps',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 60,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Lateral Raise'), 4, '12-15 reps'),
        buildExerciseItem(getCompatibleExercise('Rear Delts', equipment, 'Reverse Pec Deck'), 3, '12-15 reps'),
        buildExerciseItem(getCompatibleExercise('Triceps (Lateral Head', equipment, 'Pushdown'), 4, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Biceps (Long Head Stretch)', equipment, 'Incline Dumbbell Bicep Curl'), 4, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Abs & Hip Flexors', equipment, 'Hanging Leg Raise'), 3, '12-15 reps'),
      ],
    });

    schedule.push({
      dayNumber: 7,
      dayName: 'Day 7: Weekly Re-Feed & Complete Rest',
      focus: 'Rest',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });
  }

  // 5. BRO SPLIT (5 Days: Chest, Back, Shoulders, Legs, Arms)
  else {
    schedule.push({
      dayNumber: 1,
      dayName: 'Day 1: Chest Annihilation',
      focus: 'Pecs (Upper, Mid & Lower Fibers)',
      isRestDay: false,
      targetVolumeSets: 17,
      estimatedDurationMin: 60,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Chest (Mid/Lower)', equipment, 'Barbell Flat Bench Press'), 4, '6-8 reps'),
        buildExerciseItem(getCompatibleExercise('Chest (Clavicular/Upper)', equipment, 'Incline Dumbbell Press'), 4, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Chest (Lower) & Triceps', equipment, 'Chest Dips'), 3, '8-12 reps'),
        buildExerciseItem(getCompatibleExercise('Chest (Isolation)', equipment, 'Pec Deck'), 3, '12-15 reps'),
        buildExerciseItem(getCompatibleExercise('Chest (Lower/Sternal)', equipment, 'Standing Cable Fly'), 3, '12-15 reps'),
      ],
    });

    schedule.push({
      dayNumber: 2,
      dayName: 'Day 2: Back & Lat Width',
      focus: 'Lats, Rhomboids, Traps & Lower Back',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 65,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Posterior Chain & Erector', equipment, 'Conventional Barbell Deadlift'), 4, '5-6 reps'),
        buildExerciseItem(getCompatibleExercise('Back (Lats & Upper Back)', equipment, 'Weighted Overhand Pull-Ups'), 4, '6-8 reps'),
        buildExerciseItem(getCompatibleExercise('Back (Rhomboids & Mid-Traps)', equipment, 'Bent-Over Row'), 3, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Back (Latissimus Dorsi)', equipment, 'Lat Pulldown'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Back (Upper Back', equipment, 'Chest-Supported Incline'), 4, '10-12 reps'),
      ],
    });

    schedule.push({
      dayNumber: 3,
      dayName: 'Day 3: Shoulder Cap & Traps',
      focus: 'Anterior, Lateral & Posterior Delts',
      isRestDay: false,
      targetVolumeSets: 17,
      estimatedDurationMin: 60,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Shoulders (Front & Mid Delts)', equipment, 'Standing Barbell Overhead Press'), 4, '6-8 reps'),
        buildExerciseItem(getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Lateral Raise'), 4, '12-15 reps'),
        buildExerciseItem(getCompatibleExercise('Rear Delts & Rotator Cuff', equipment, 'Cable Face Pull'), 4, '12-15 reps'),
        buildExerciseItem(getCompatibleExercise('Shoulders (Lateral Delt Width)', equipment, 'Cable Lateral Raise'), 3, '12-15 reps'),
        buildExerciseItem(getCompatibleExercise('Rear Delts', equipment, 'Reverse Pec Deck'), 3, '12-15 reps'),
      ],
    });

    schedule.push({
      dayNumber: 4,
      dayName: 'Day 4: Quad & Hamstring Wheelhouse',
      focus: 'Quads, Hamstrings, Glutes & Calves',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 70,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Quads & Glutes', equipment, 'Barbell High-Bar Back Squat'), 4, '6-8 reps'),
        buildExerciseItem(getCompatibleExercise('Hamstrings & Glutes', equipment, 'Barbell Romanian Deadlift'), 4, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Quads & Glutes', equipment, '45° Incline Leg Press'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Hamstrings (Lengthened', equipment, 'Seated Leg Curl'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Calves (Gastrocnemius)', equipment, 'Standing Calf Raise'), 4, '12-15 reps'),
      ],
    });

    schedule.push({
      dayNumber: 5,
      dayName: 'Day 5: Direct Arm Specialization',
      focus: 'Biceps, Triceps & Forearms',
      isRestDay: false,
      targetVolumeSets: 18,
      estimatedDurationMin: 60,
      exercises: [
        buildExerciseItem(getCompatibleExercise('Triceps (Long Head Mass)', equipment, 'Skull Crushers'), 4, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Biceps (Short & Long Head)', equipment, 'Barbell / EZ-Bar Curl'), 4, '8-10 reps'),
        buildExerciseItem(getCompatibleExercise('Triceps (Lateral Head', equipment, 'Pushdown'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Biceps (Long Head Stretch)', equipment, 'Incline Dumbbell Bicep Curl'), 3, '10-12 reps'),
        buildExerciseItem(getCompatibleExercise('Brachialis & Brachioradialis', equipment, 'Hammer Curl'), 3, '10-12 reps'),
      ],
    });

    schedule.push({
      dayNumber: 6,
      dayName: 'Day 6: Systemic Recovery',
      focus: 'Active Rest & Recovery',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });

    schedule.push({
      dayNumber: 7,
      dayName: 'Day 7: Full Rest',
      focus: 'Rest',
      isRestDay: true,
      targetVolumeSets: 0,
      estimatedDurationMin: 0,
      exercises: [],
    });
  }

  const totalWeeklySets = schedule.reduce((acc, day) => {
    return acc + (day.exercises ? day.exercises.reduce((dAcc, ex) => dAcc + ex.sets, 0) : 0);
  }, 0);

  const goalDescriptions: Record<WorkoutGoal, string> = {
    hypertrophy: 'Maximal myofibrillar and sarcoplasmic hypertrophy with moderate-to-high working volume (8-12 reps, 1-2 RIR) targeting the MAV window.',
    strength: 'Neurological force production, rate of force development (RFD), and heavy compound adaptations (4-6 reps, 2-3 RIR) with full intra-set ATP recovery.',
    powerbuilding: 'Hybrid periodization fusing heavy barbell primary lifts with high-density bodybuilding accessory work for optimal aesthetics and strength.',
    recomp: 'Simultaneous body recomposition optimizing muscle protein synthesis while keeping mechanical tension elevated during iso-caloric phases.',
    cutting_density: 'High-density hypertrophy stimulus designed to preserve lean muscle tissue in a hypocaloric state with controlled systemic fatigue.',
  };

  return {
    id: `plan_${Date.now()}`,
    title: `${goal.charAt(0).toUpperCase() + goal.slice(1).replace('_', ' ')} ${split.toUpperCase()} Routine (${daysPerWeek} Days/Week)`,
    goal,
    split,
    equipment,
    daysPerWeek,
    experienceLevel,
    schedule,
    totalWeeklySets,
    description: goalDescriptions[goal],
    progressionStrategy:
      goal === 'strength'
        ? 'Double Progression: When all sets hit the top of the rep range with target RIR, increase load by 2.5–5.0% on the next session.'
        : 'Dynamic Double Progression (DDP): Add 1 rep per set session-over-session within the rep bracket; once upper ceiling is reached on all sets, increase working weight.',
    recoveryGuideline:
      'Ensure 48–72 hours between training the same muscle group. Maintain protein intake at ≥2.2 g/kg and sleep 7.5–9.0 hours per night for optimal satellite cell activation.',
  };
}
