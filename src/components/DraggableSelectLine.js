import React from 'react';
import './DraggableSelectLine.css';
import SelectLine from './SelectLine';

const DraggableSelectLine = ({ 
  showDragHandle = false, 
  dragHandleProps = {}, 
  ...selectLineProps 
}) => {
  const dragHandle = showDragHandle ? (
    <div 
      className="drag-handle-inline"
      {...dragHandleProps}
      title="Drag to reorder"
    >
      ⋮⋮
    </div>
  ) : null;

  return (
    <SelectLine 
      {...selectLineProps}
      dragHandle={dragHandle}
    />
  );
};

export default DraggableSelectLine; 