import React from 'react';

const SelectLine = ({ id, name, description, clickHandler }) => {
    return (
        <button 
            onClick={() => clickHandler(id)}
            className="select-line"
        >
            <div className="select-content">
                <span className="select-name">{name}</span>
                {description && <span className="select-description">{description}</span>}
            </div>
        </button>
    );
}

export default SelectLine;