import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    restrictToParentElement,
    restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React from 'react';
import DraggableItem from './DraggableItem';

const DraggableList = ({ 
  items, 
  onReorder, 
  renderItem, 
  keyExtractor = (item) => item.id,
  isReorderMode = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => keyExtractor(item) === active.id);
      const newIndex = items.findIndex(item => keyExtractor(item) === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  // Only enable drag context when in reorder mode
  if (!isReorderMode) {
    return (
      <>
        {items.map((item, index) => (
          <DraggableItem 
            key={keyExtractor(item)} 
            id={keyExtractor(item)}
            index={index}
            isReorderMode={false}
          >
            {renderItem(item, index)}
          </DraggableItem>
        ))}
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext 
        items={items.map(keyExtractor)} 
        strategy={verticalListSortingStrategy}
      >
        {items.map((item, index) => (
          <DraggableItem 
            key={keyExtractor(item)} 
            id={keyExtractor(item)}
            index={index}
            isReorderMode={isReorderMode}
          >
            {renderItem(item, index)}
          </DraggableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default DraggableList; 