import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SelectLine from './SelectLine';

import { supabase } from '../supabase';
import BlockCreate from './BlockCreate';
import Modal from './Modal';
import './SelectList.css';

const BlockSelect = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingBlock, setEditingBlock] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const { program_id } = useParams();
    const { user } = useAuth();

    const fetchBlocks = useCallback(async () => {
        try {
            setLoading(true);
            const { data: blocks, error } = await supabase
                .from('block')
                .select('*')
                .eq('program_id', program_id)
                .eq('user_id', user.id);
            if (error) throw error;

            setBlocks(blocks);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [program_id, user]);

    useEffect(() => {
        fetchBlocks();
    }, [fetchBlocks]);

    const selectBlock = (block_id) => {
        navigate(`/days/${block_id}`);
    }

    const openCreateModal = () => {
        setEditingBlock(null);
        setIsModalOpen(true);
    }

    const editBlock = (id, name, description) => {
        const blockToEdit = blocks.find(block => block.id === id);
        if (blockToEdit) {
            setEditingBlock({
                id,
                blockNumber: blockToEdit.block_number,
                description: blockToEdit.description
            });
            setIsModalOpen(true);
        }
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBlock(null);
    }

    const handleBlockSaved = () => {
        fetchBlocks();
        closeModal();
    }

    const deleteBlock = async (id) => {
        try {
            const { error } = await supabase
                .from('block')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            fetchBlocks();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="Session">
            <div className="create-form-container">
                <h2>Blocks</h2>
                {loading ? (
                    <p>Loading blocks...</p>
                ) : error ? (
                    <p className="create-form-error">{error}</p>
                ) : (
                    <>
                        <p>Select a block</p>
                        {blocks.map((block) => (
                            <SelectLine
                                key={block.id}
                                id={block.id}
                                name={`Block ${block.block_number}`}
                                description={block.description}
                                clickHandler={selectBlock}
                                onEdit={editBlock}
                                onDelete={deleteBlock}
                            />
                        ))}
                    </>
                )}

                <button className="add-button" onClick={openCreateModal}>
                    <span className="add-button-icon">+</span>
                    Add Block
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingBlock ? "Edit Block" : "Create Block"}
            >
                <BlockCreate 
                    onBlockCreated={handleBlockSaved}
                    editMode={!!editingBlock}
                    blockId={editingBlock?.id}
                    initialBlockNumber={editingBlock?.blockNumber || 0}
                    initialDescription={editingBlock?.description || ''}
                    onCancelEdit={closeModal}
                />
            </Modal>
        </div>
    )
}

export default BlockSelect