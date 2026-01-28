Workout table stays the same - Absolutely correct. A workout is just a container.
Phased approach - Smart for a solo dev. Ship incrementally.
Pre-defined types via DB inserts - Much better than user-defined types. Keeps things sane.
# Design Discussion
## The Exercise Type System
Your core insight is correct: you need an exercise_type table and a way to make exercises flexible. Here's where I'd refine:

# Current schema:

exercise: id, day_id, name, is_main, sets, reps, notes, user_id, order
log: id, workout_id, exercise_id, set_number, reps, weight, user_id

# Proposed changes:

## Option A (What I'd recommend): Simple nullable columns

exercise_type: id, name, display_name, description
  - Initial rows: "lift", "time_based", "bodyweight", etc.

exercise: 
  + exercise_type_id (FK, defaults to "lift" for existing rows)
  sets (nullable - not all exercises have sets)
  reps (nullable - not all exercises have reps)  
  + duration (nullable - for time-based)
  + distance (nullable - for runs/rows/bikes)
  + distance_unit (nullable - "miles", "km", "meters")

log:
  set_number (nullable when not set-based)
  reps (nullable)
  weight (nullable)
  + duration (nullable)
  + distance (nullable)
  + distance_unit (nullable)
  + notes (text, nullable - for "felt great" or "tough day")

Why this works:

Minimal schema changes
Each type uses only the fields it needs (others are null)
No complex joins for common queries
Easy to add new types later (just add columns as needed)
TypeScript/UI can enforce which fields are required per type

## Migration Strategy
You said "backwards compatible OR migrate existing data" - I'd argue you can have both:

-- Migration script
ALTER TABLE exercise ADD COLUMN exercise_type_id INT8;
ALTER TABLE exercise ADD COLUMN duration INT4;  -- seconds
ALTER TABLE exercise ADD COLUMN distance FLOAT4;
ALTER TABLE exercise ADD COLUMN distance_unit TEXT;

-- Create exercise types
INSERT INTO exercise_type (id, name, display_name) VALUES 
  (1, 'lift', 'Strength Training'),
  (2, 'time_based', 'Time-Based Cardio'),
  (3, 'bodyweight', 'Bodyweight Exercise');

-- Set all existing exercises to "lift" type
UPDATE exercise SET exercise_type_id = 1;

-- Add constraint AFTER data migration
ALTER TABLE exercise ALTER COLUMN exercise_type_id SET NOT NULL;
ALTER TABLE exercise ADD FOREIGN KEY (exercise_type_id) REFERENCES exercise_type(id);

-- Same for log table
ALTER TABLE log ADD COLUMN duration INT4;
ALTER TABLE log ADD COLUMN distance FLOAT4;
ALTER TABLE log ADD COLUMN distance_unit TEXT;

This is backwards compatible because:

Existing lift exercises just have type_id = 1
Their sets/reps/weight still work exactly as before
New nullable columns don't break anything
No data transformation needed
App continues to work immediately (just needs to handle the new type field)

# Simplified Incremental Plan
## PR 1: Type System Foundation (app stays fully functional)

Add exercise_type table with seed data
Add exercise_type_id to exercise table (default "lift")
Add nullable duration, distance, distance_unit to both exercise and log
Migration script that sets all existing exercises to type "lift"
No UI changes yet - everything looks the same
Result: App works exactly as before, schema is ready for new types

## PR 2: Time-Based Exercise UI

Update ExerciseCreate to show type selector
Show/hide fields based on type (sets/reps for lift, duration/distance for time)
Update Exercise.js (workout execution) to handle time-based logging
Add duration/distance inputs to log form
Result: Can now create and log time-based exercises

## PR 3: Enhanced Display/Reporting

Update workout history to show different metrics per type
Add filters/grouping by exercise type
Result: Better UX for viewing mixed workout types

## PR 4+: More types (bodyweight, etc.)

# Overall
Simple enough for solo dev
Flexible enough for multiple types
No complex migration
Easy to query and reason about
Testable at each step
The schema won't be "perfectly normalized" but it'll be pragmatic and maintainable. Perfect is the enemy of shipped.
