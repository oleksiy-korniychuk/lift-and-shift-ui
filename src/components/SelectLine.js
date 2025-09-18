
    const SelectLine = ({ id, name, description, clickHandler, onEdit, onDelete, dragHandle }) => {
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
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(id, name, description);
                            }}
                            className="action-button delete-x-button"
                            aria-label={`Delete ${name}`}
                            title="Delete"
                        >
                            X
                        </button>
                    )}
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
