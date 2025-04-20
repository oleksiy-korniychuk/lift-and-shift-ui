import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        const fetchText = async () => {
            try {
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
        };

        fetchText();
    }, [program_id, user]);

    const selectBlock = (block_id) => {
        navigate(`/days/${block_id}`);
    }

    return (
        <div>
            <div className='list'>
                <h2>Blocks</h2>
                <p>select a block</p>
                {loading ? 'loading' : (error ? 'error' : 
                blocks.map((block) => (
                    <SelectLine
                        key={block.id}
                        id={block.id}
                        name={block.block_number}
                        description={block.description}
                        clickHandler={selectBlock}
                    />
                )))}
            </div>
            <BlockCreate/>
        </div>
    )
}

export default BlockSelect