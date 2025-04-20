import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const Exercise = ({ name, sets, reps, workoutId, exerciseId }) => {
    const [setList, setSetList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const timeoutIdRef = useRef(null);

    // Load existing logs when component mounts
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const { data: logData, error } = await supabase
                    .from('log')
                    .select('*')
                    .eq('workout_id', workoutId)
                    .eq('exercise_id', exerciseId)
                    .order('set_number', { ascending: true });
                
                if (error) throw error;
                
                if (logData && logData.length > 0) {
                    // Convert to our internal format
                    const loadedSets = logData.map(log => ({
                        id: log.id,
                        set_number: log.set_number,
                        weight: log.weight.toString(),
                        reps: log.reps.toString()
                    }));
                    setSetList(loadedSets);
                } else {
                    // Initialize with default set if no logs exist
                    setSetList([{ set_number: 1, weight: '', reps: ''}]);
                }
            } catch (error) {
                console.error('Error loading logs:', error);
                // Initialize with default set on error
                setSetList([{ set_number: 1, weight: '', reps: ''}]);
            } finally {
                setIsLoading(false);
            }
        };

        if (workoutId && exerciseId) {
            fetchLogs();
        }
    }, [workoutId, exerciseId]);

    const addSet = async () => {
        try {
            console.log("Adding new set");
            // Delete the log entry from the database
            const setNumber = setList.length > 0 ? setList[setList.length - 1].set_number + 1 : 1;
            const { data, error } = await supabase
                .from('log')
                .insert({
                    workout_id: workoutId,
                    exercise_id: exerciseId,
                    set_number: setNumber,
                    user_id: user.id,
                    weight: 0,
                    reps: 0
                })
                .select()

            if (data) {
                setSetList(prevSetList => [...prevSetList, { id: data[0].id, set_number: setNumber, weight: '', reps: ''}]);
            }
                
            if (error) throw error;
        } catch (error) {
            console.error('Error removing set:', error);
        }
    }
    
    const removeSet = async (id) => {
        console.log("Removing set:", id);
        try {
            // Cancel any pending saves first
            clearTimeout(timeoutIdRef.current);
            
            // Delete the log entry from the database
            const { error } = await supabase
                .from('log')
                .delete()
                .eq('workout_id', workoutId) // For some reason just having .eq('id', id) triggers Brave adblocker
                .eq('id', id);
                
            if (error) throw error;
            
            // Update local state
            setSetList(prevSetList => { return prevSetList.filter((set) => set.id !== id) });
            // Cancel any pending saves first
            clearTimeout(timeoutIdRef.current);
            saveChanges();
        } catch (error) {
            console.error('Error removing set:', error);
        }
    }
    
    const updateSet = (id, property, value) => {
        console.log("Updating set:", id, property, value);
        setSetList(prevSetList => {
            return prevSetList.map((set) => {
                if(set.id === id) {
                    return { ...set, [property]: value};
                }
                return set;
            });
        });
    }

    const saveChanges = React.useCallback(async () => {
        if (isLoading) return;
        console.log("Saving changes:", setList);
        
        try {
            // Prepare logs with unique keys for upsert
            const logs = setList.map((set) => ({
                    id: set.id,
                    workout_id: workoutId,
                    exercise_id: exerciseId,
                    set_number: set.set_number,
                    user_id: user.id,
                    weight: parseFloat(set.weight) || 0,
                    reps: parseInt(set.reps) || 0
                }));

            const { error } = await supabase
                .from('log')
                .upsert(logs, { 
                    onConflict: 'id',
                    ignoreDuplicates: false 
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving sets:', error);
        }
    }, [isLoading, setList, workoutId, exerciseId, user]);

    // Use debounce for saving changes
    useEffect(() => {
        if (workoutId && exerciseId && user && !isLoading) {
            console.log("New Timer");
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = setTimeout(saveChanges, 500);
        }
        
        // Cleanup function to clear timeout if component unmounts
        return () => clearTimeout(timeoutIdRef.current);
    }, [setList, workoutId, exerciseId, user, isLoading, saveChanges]);

    if (isLoading) {
        return <div>Loading exercise data...</div>;
    }

    return (
        <div className="exercise-row">
            <span>{name}: {sets} sets of {reps} reps</span>
            {setList.map((set, index) => (
                <Set
                    key={index}
                    number={set.set_number}
                    weight={set.weight}
                    actualReps={set.reps}
                    onWeightChange={(value) => updateSet(set.id, 'weight', value)}
                    onRepsChanged={(value) => updateSet(set.id, 'reps', value)}
                    onRemove={() => removeSet(set.id)}
                />
            ))}
            <div>
                <button onClick={addSet}>+</button>
            </div>
        </div>
    );
};

const Set = ({number, weight, actualReps, onWeightChange, onRepsChanged, onRemove}) => {
    return (
        <div className="set-row">
            <span>({number}) </span>
            <input
                type="number"
                placeholder="Weight (lb)"
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
            />
            <input
                type="number"
                placeholder="Reps"
                value={actualReps}
                onChange={(e) => onRepsChanged(e.target.value)}
            />
            <button onClick={onRemove}>-</button>
        </div>
    );
}

export default Exercise;