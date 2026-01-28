import { useState } from 'react';
import Modal from '../components/Modal.jsx';

const useDeleteConfirmation = (onDelete, itemId, itemName) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (onDelete) {
            onDelete(itemId);
        }
        setShowDeleteModal(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const DeleteConfirmationModal = () => (
        <Modal 
            isOpen={showDeleteModal} 
            onClose={handleCancelDelete}
            title="Confirm Delete"
        >
            <div className="delete-confirmation">
                <p>Are you sure you want to delete &quot;{itemName}&quot;?</p>
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
    );

    return {
        handleDeleteClick,
        DeleteConfirmationModal
    };
};

export default useDeleteConfirmation;