import React, { useState } from 'react';
import Modal from './Modal';

const SelectLine = ({ id, name, description, clickHandler, onEdit, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        onDelete(id);
        setShowDeleteModal(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    return (
        <>
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
                        {onDelete && (
                            <button 
                                onClick={handleDeleteClick}
                                className="action-button delete-button"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </button>
            </div>

            <Modal 
                isOpen={showDeleteModal} 
                onClose={handleCancelDelete}
                title="Confirm Delete"
            >
                <div className="delete-confirmation">
                    <p>Are you sure you want to delete "{name}"?</p>
                    <p className="delete-warning">This action cannot be undone.</p>
                    <div className="modal-actions">
                        <button 
                            onClick={handleCancelDelete}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmDelete}
                            className="delete-confirm-button"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default SelectLine;