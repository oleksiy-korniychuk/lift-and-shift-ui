import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../constants';
import SelectLine from './SelectLine';
import './SelectList.css';

const BlockSelect = () => {
    const [blocks, setBlocks] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { program_id } = useParams();

    useEffect(() => {
        const fetchText = async () => {
            try {
                const response = await fetch(API_URL + '/block?program_id=' + program_id, {
                    method: 'GET',
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setBlocks(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchText();
    }, [program_id]);

    const selectBlock = (block_id) => {
        navigate(`/days/${block_id}`);
    }

    return (
        <div className='list'>
            <h2>Blocks</h2>
            <p>select a block</p>
            {loading ? 'loading' : (error ? 'error' : 
            blocks.map((block) => (
                <SelectLine
                    key={block.id}
                    id={block.id}
                    name={block.blockNumber}
                    description={block.description}
                    clickHandler={selectBlock}
                />
            )))}
        </div>
    )
}

export default BlockSelect