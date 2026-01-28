import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import './DraggableList.css';
import DraggableSelectLine from './DraggableSelectLine.jsx';
import './DraggableSelectLine.css';

const DraggableItem = ({ id, children, index, isReorderMode = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: !isReorderMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
  };

  // Clone children and pass drag handle props to DraggableSelectLine
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === DraggableSelectLine) {
      return React.cloneElement(child, {
        showDragHandle: isReorderMode,
        dragHandleProps: isReorderMode ? { ...attributes, ...listeners } : {}
      });
    }
    return child;
  });

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`draggable-item ${isDragging ? 'dragging' : ''}`}
    >
      {childrenWithProps}
    </div>
  );
};

export default DraggableItem;
