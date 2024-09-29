import React from 'react';

const SelectLine = ({id, name, description, clickHandler}) => {
    return (
        <button
            className='line'
            onClick={() => clickHandler(id)}
        >
            <h3>{name}</h3>
            <p>{description}</p>
        </button>
    );
}

export default SelectLine;