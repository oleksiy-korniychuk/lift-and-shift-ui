# Lift and Shift

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## How to Run
1. rename `.env.example` to `.env.local` and update the two SupaBase secret values
2. In the project directory, run:

    - `npm install`
    - `npm start local`
3. If your default browser does not do so automatically, navigate to http://localhost:8080

## Description
This is a workout application designed to plan out a workout program, start workouts, and track exercises.

## Stack
- React frontend
- Supabase backend

## Project Structure

### Database
The database schema details can be found in `./DATABASE_SCHEMA.md`

### Components
The components can be found in `./src/components`

The components are tied together as follows:
- The ProgramSelect component loads a list of all `programs` that the user has
- The BlockSelect component loads a list of all `blocks` in the selected Program
- The DaySelect component loads a list of all `days` in the selected Block
- The Day component loads a list of `exersises` in the selected Day
- The WorkoutSelect component loads a list of all past `workouts` logged by the user
- The Workout component loads a list of Exersises and sets in the selected Workout
- The Exercise component loads the list of sets for the Exercise in the current Workout

Note: Each of the *Select components also loads the corresponding *Create component that allows the user to add a new entity of that type. For example on DaySelect you can use the DayCreate component to create a new Day and add it to the currently selected Block.

The typical User will start on ProgramSelect(/programs) and proceed through the BlockSelect(`/blocks/{program_id}`) and DaySelect(`/days/{block_id}`) screens to land on the Day screen (`/day/{day_id}`). From here they will click "Start Workout" and land on the Workout(`/workout/{workout_id}`) screen where each exercise is loaded using the Excersise component and they can add, remove, and update sets for each exersise.

Users can also access their workout history directly from the ProgramSelect(`/programs`) page by clicking a button that navigates to the WorkoutSelect(`/workouts`) screen. This allows users to view and select from their past workouts to check their previous performance.
