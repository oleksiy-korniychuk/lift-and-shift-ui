import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SelectLine from './SelectLine';

import { supabase } from '../supabase';
import BlockCreate from './BlockCreate';
import './SelectList.css';

const BlockSelect = () => {
    const [blocks, setBlocks] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                                name={block.block_number}
                                description={block.description}
                                clickHandler={selectBlock}
                            />
                        ))}
                    </>
                )}
            </div>
            <BlockCreate onBlockCreated={fetchBlocks}/>
        </div>
    )
}

export default BlockSelect