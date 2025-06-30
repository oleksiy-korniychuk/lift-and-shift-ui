import React from 'react';

const SelectLine = ({ id, name, description, clickHandler, onEdit, dragHandle }) => {
    return (
        <div className="select-line-container">
            <button 
                onClick={() => clickHandler(id)}
                className="select-line"
            >
                <div className="select-content">
                    <span className="select-name">{name}</span>
                    {description && <span className="select-description">{description}</span>}
                </div>
                <div className="select-line-actions">
                    {onEdit && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(id, name, description);
                            }}
                            className="action-button edit-button"
                        >
                            Edit
                        </button>
                    )}
                    {dragHandle}
                </div>
            </button>
        </div>
    );
}

export default SelectLine;