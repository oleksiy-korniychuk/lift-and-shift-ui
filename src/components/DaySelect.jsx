import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import DayCreate from './DayCreate.jsx';
import Modal from './Modal.jsx';
import SelectLine from './SelectLine.jsx';
import './SelectList.css';

const DaySelect = () => {
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDay, setEditingDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { block_id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchDays = useCallback(async () => {
        try {
            setLoading(true);
            const { data: days, error } = await supabase
                .from('day')
                .select('*')
                .eq('block_id', block_id)
                .eq('user_id', user.id);
            if (error) throw error;

            setDays(days);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [block_id, user]);

    useEffect(() => {
        fetchDays();
    }, [fetchDays]);

    const selectDay = (day_id) => {
        navigate(`/day/${day_id}`);
    }

    const openCreateModal = () => {
        setEditingDay(null);
        setIsModalOpen(true);
    }

    const editDay = (id, name, description) => {
        setEditingDay({ id, name, description });
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDay(null);
    }

    const handleDaySaved = () => {
        fetchDays();
        closeModal();
    }

    const deleteDay = async (id) => {
        try {
            const { error } = await supabase
                .from('day')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            fetchDays();
            closeModal();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="Session">
            <div className="create-form-container">
                <h2>Days</h2>
                {loading ? (
                    <p>Loading days...</p>
                ) : error ? (
                    <p className="create-form-error">{error}</p>
                ) : (
                    <>
                        <p>Select a day</p>
                        {days.map((day) => (
                            <SelectLine
                                key={day.id}
                                id={day.id}
                                name={day.name}
                                description={day.description}
                                clickHandler={selectDay}
                                onEdit={editDay}
                            />
                        ))}
                    </>
                )}

                <button className="add-button" onClick={openCreateModal}>
                    <span className="add-button-icon">+</span>
                    Add Day
                </button>
            </div>

            <Modal 
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingDay ? "Edit Day" : "Create Day"}
            >
                <DayCreate 
                    onDayCreated={handleDaySaved}
                    editMode={!!editingDay}
                    dayId={editingDay?.id}
                    initialName={editingDay?.name || ''}
                    initialDescription={editingDay?.description || ''}
                    onCancelEdit={closeModal}
                    onDelete={deleteDay}
                />
            </Modal>
        </div>
    )
}

export default DaySelect