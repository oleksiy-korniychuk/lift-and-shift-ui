import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import ProgramCreate from './ProgramCreate';
import SelectLine from './SelectLine';

import { supabase } from '../supabase';
import './SelectList.css';

const ProgramSelect = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProgram, setEditingProgram] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchPrograms = useCallback(async () => {
        try {
            setLoading(true);
            const { data: programs, error } = await supabase
                .from('program')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            setPrograms(programs);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    const selectProgram = (program_id) => {
        navigate(`/blocks/${program_id}`);
    }

    const openCreateModal = () => {
        setEditingProgram(null);
        setIsModalOpen(true);
    }

    const editProgram = (id, name, description) => {
        setEditingProgram({ id, name, description });
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProgram(null);
    }

    const handleProgramSaved = () => {
        fetchPrograms();
        closeModal();
    }

    const deleteProgram = async (id) => {
        try {
            const { error } = await supabase
                .from('program')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            fetchPrograms();
            closeModal();
        } catch (error) {
            setError(error.message);
        }
    }

    const goToWorkoutHistory = () => {
        navigate('/workouts');
    }

    return (
        <div className='list'> 
            <h2>Programs</h2>
            <p>select a program</p>
            {loading ? 'loading' : (error ? 'error' : 
            programs.map((program) => (
                <SelectLine
                    key={program.id}
                    id={program.id}
                    name={program.name}
                    description={program.description}
                    clickHandler={selectProgram}
                    onEdit={editProgram}
                />
            )))}

            <button className="add-button" onClick={openCreateModal}>
                <span className="add-button-icon">+</span>
                Add Program
            </button>

            <Modal 
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingProgram ? "Edit Program" : "Create Program"}
            >
                <ProgramCreate 
                    onProgramCreated={handleProgramSaved}
                    editMode={!!editingProgram}
                    programId={editingProgram?.id}
                    initialName={editingProgram?.name || ''}
                    initialDescription={editingProgram?.description || ''}
                    onCancelEdit={closeModal}
                    onDelete={deleteProgram}
                />
            </Modal>

            <button 
                className="workout-history-btn" 
                onClick={goToWorkoutHistory}
            >
                View Workout History
            </button>
        </div>
    )
}

export default ProgramSelect