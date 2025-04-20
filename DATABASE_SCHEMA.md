# Supabase Database Schema "public"

## Tables

### program
- **id** `int8` (primary key, unique)
- **name** `text`
- **description** `text`
- **user_id** `uuid` (foreign key -> auth.user.id)

### block
- **id** `int8` (primary key, unique)
- **program_id** `int8` (foreign key -> program.id)
- **block_number** `int2`
- **description** `text` (nullable)
- **user_id** `uuid` (foreign key -> auth.user.id)

### day
- **id** `int8` (primary key, unique)
- **block_id** `int8` (foreign key -> block.id)
- **name** `text`
- **description** `text` (nullable)
- **user_id** `uuid` (foreign key -> auth.user.id)

### exercise
- **id** `int8` (primary key, unique)
- **day_id** `int8` (foreign key -> day.id)
- **name** `text`
- **is_main** `bool` (nullable)
- **sets** `int2`
- **reps** `int2` (nullable)
- **notes** `text` (nullable)
- **user_id** `uuid` (foreign key -> auth.user.id)

### workout
- **id** `int8` (primary key, unique)
- **program_id** `int8` (foreign key -> program.id)
- **block_id** `int8` (foreign key -> block.id)
- **day_id** `int8` (foreign key -> day.id)
- **workout_date** `timestamp`
- **notes** `text` (nullable)
- **user_id** `uuid` (foreign key -> auth.user.id)

### log
- **id** `int8` (primary key, unique)
- **workout_id** `int8` (foreign key -> workout.id)
- **exercise_id** `int8` (foreign key -> exercise.id)
- **set_number** `int2`
- **reps** `int2`
- **weight** `float4`
- **user_id** `uuid` (foreign key -> auth.user.id)
- unique(workout_id, exercise_id, set_number)

## Notes

- All tables include a `user_id` for data ownership. Thie field comes from `auth.user.id`
- Hierarchical structure: Program -> Block -> Day -> Exercise
- A Day can be initialize a new Workout with each set of an Exercise being stored in the Log table
