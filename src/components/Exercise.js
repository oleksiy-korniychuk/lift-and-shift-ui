import React, { useState } from 'react';

const Exercise = ({ name, sets, reps }) => {
    const [setList, setSetList] = useState([{ id: 0, weight: '', reps: ''}]);

    const addSet = () => {
        setSetList([...setList, { id: setList.length, weight: '', reps: ''}])
    }
    const removeSet = (index) => {
        setSetList(setList.filter((_, i) =>  i !== index))
    }
    const updateSet = (index, property, value) => {
        const updatedSetList = setList.map((set, i) => {
            if(i === index) {
                return { ...set, [property]: value};
            }
            return set;
        });
        setSetList(updatedSetList);
    }

    return (
        <div className="exercise-row">
            <span>{name}: {sets} sets of {reps} reps</span>
            {setList.map((set, index) => (
                <Set
                    key={index}
                    number={index + 1}
                    weight={set.weight}
                    actualReps={set.reps}
                    onWeightChange={(value) => updateSet(index, 'weight', value)}
                    onRepsChanged={(value) => updateSet(index, 'reps', value)}
                    onDelete={removeSet}
                />
            ))}
            <div>
                <button onClick={addSet}>+</button>
            </div>
        </div>
    );
};

const Set = ({number, weight, actualReps, onWeightChange, onRepsChanged, onDelete}) => {
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
            <button onClick={() => onDelete(number - 1)}>-</button>
        </div>
    );
}

export default Exercise;