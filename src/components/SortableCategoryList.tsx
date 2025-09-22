import React from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category, Task } from '@/types';
import { CategorySection } from './CategorySection';
import { DotsSixVertical } from '@phosphor-icons/react';

const DEFAULT_CATEGORY_ID = 'general';
const PRAYER_CATEGORY_ID = 'prayers';

interface SortableCategoryItemProps {
  category: Category;
  tasks: Task[];
  allTasks: Task[];
  onAddTask: (categoryId: string, title: string, description?: string, taskOptions?: Partial<Task>) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onAddTaskAtSameLevel: (referenceTaskId: string, title: string) => void;
  canDeleteCategory: boolean;
  currentTime?: Date; // Add current time prop
  prayerSettings?: any;
  onUpdatePrayerSettings?: any;
  isUpdatingPrayers?: boolean;
  getMissedPrayersCount?: (prayerName: string) => number;
  onAddTodaysPrayers?: () => Promise<void>;
  // Category ordering props
  onMoveCategoryUp?: (categoryId: string) => void;
  onMoveCategoryDown?: (categoryId: string) => void;
  onMoveCategoryToTop?: (categoryId: string) => void;
  onMoveCategoryToBottom?: (categoryId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function SortableCategoryItem(props: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-2 top-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-background/80 backdrop-blur-sm p-1 rounded border border-border/50 hover:bg-muted"
        title="Drag to reorder category"
      >
        <DotsSixVertical size={16} className="text-muted-foreground" />
      </div>
      
      {/* Add padding to make room for drag handle */}
      <div className="pl-2">
        <CategorySection 
          category={props.category}
          tasks={props.tasks}
          allTasks={props.allTasks}
          onAddTask={props.onAddTask}
          onToggleTaskComplete={props.onToggleTaskComplete}
          onUpdateTask={props.onUpdateTask}
          onDeleteTask={props.onDeleteTask}
          onUpdateCategory={props.onUpdateCategory}
          onDeleteCategory={props.onDeleteCategory}
          onAddSubtask={props.onAddSubtask}
          onAddTaskAtSameLevel={props.onAddTaskAtSameLevel}
          canDeleteCategory={props.canDeleteCategory}
          currentTime={props.currentTime}
          prayerSettings={props.prayerSettings}
          onUpdatePrayerSettings={props.onUpdatePrayerSettings}
          isUpdatingPrayers={props.isUpdatingPrayers}
          getMissedPrayersCount={props.getMissedPrayersCount}
          onAddTodaysPrayers={props.onAddTodaysPrayers}
          onMoveCategoryUp={props.onMoveCategoryUp}
          onMoveCategoryDown={props.onMoveCategoryDown}
          onMoveCategoryToTop={props.onMoveCategoryToTop}
          onMoveCategoryToBottom={props.onMoveCategoryToBottom}
          isFirst={props.isFirst}
          isLast={props.isLast}
        />
      </div>
    </div>
  );
}

interface SortableCategoryListProps {
  categories: Category[];
  tasks: Task[];
  onAddTask: (categoryId: string, title: string, description?: string, taskOptions?: Partial<Task>) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onAddTaskAtSameLevel: (referenceTaskId: string, title: string) => void;
  onReorderCategories: (categories: Category[]) => void;
  currentTime?: Date; // Add current time prop
  prayerSettings?: any;
  onUpdatePrayerSettings?: any;
  isUpdatingPrayers?: boolean;
  getMissedPrayersCount?: (prayerName: string) => number;
  onAddTodaysPrayers?: () => Promise<void>;
}

export function SortableCategoryList({
  categories,
  tasks,
  onAddTask,
  onToggleTaskComplete,
  onUpdateTask,
  onDeleteTask,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubtask,
  onAddTaskAtSameLevel,
  onReorderCategories,
  currentTime = new Date(), // Default to current time
  prayerSettings,
  onUpdatePrayerSettings,
  isUpdatingPrayers,
  getMissedPrayersCount,
  onAddTodaysPrayers
}: SortableCategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort categories by order, with fallback to creation date
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = a.order ?? new Date(a.createdAt).getTime();
    const orderB = b.order ?? new Date(b.createdAt).getTime();
    return orderA - orderB;
  });

  // Category ordering functions
  const moveCategoryUp = (categoryId: string) => {
    const currentIndex = sortedCategories.findIndex(cat => cat.id === categoryId);
    if (currentIndex > 0) {
      const reorderedCategories = arrayMove(sortedCategories, currentIndex, currentIndex - 1);
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        order: index
      }));
      onReorderCategories(updatedCategories);
    }
  };

  const moveCategoryDown = (categoryId: string) => {
    const currentIndex = sortedCategories.findIndex(cat => cat.id === categoryId);
    if (currentIndex < sortedCategories.length - 1) {
      const reorderedCategories = arrayMove(sortedCategories, currentIndex, currentIndex + 1);
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        order: index
      }));
      onReorderCategories(updatedCategories);
    }
  };

  const moveCategoryToTop = (categoryId: string) => {
    const currentIndex = sortedCategories.findIndex(cat => cat.id === categoryId);
    if (currentIndex > 0) {
      const reorderedCategories = arrayMove(sortedCategories, currentIndex, 0);
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        order: index
      }));
      onReorderCategories(updatedCategories);
    }
  };

  const moveCategoryToBottom = (categoryId: string) => {
    const currentIndex = sortedCategories.findIndex(cat => cat.id === categoryId);
    if (currentIndex < sortedCategories.length - 1) {
      const reorderedCategories = arrayMove(sortedCategories, currentIndex, sortedCategories.length - 1);
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        order: index
      }));
      onReorderCategories(updatedCategories);
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedCategories.findIndex(cat => cat.id === active.id);
      const newIndex = sortedCategories.findIndex(cat => cat.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedCategories = arrayMove(sortedCategories, oldIndex, newIndex);
        
        // Update order values
        const updatedCategories = reorderedCategories.map((category, index) => ({
          ...category,
          order: index
        }));
        
        onReorderCategories(updatedCategories);
      }
    }
  }

  const DEFAULT_CATEGORY_ID = 'general';
  const PRAYER_CATEGORY_ID = 'prayers';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortedCategories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sortedCategories.map((category, index) => {
            const categoryTasks = tasks.filter(task => task.categoryId === category.id);
            return (
              <SortableCategoryItem
                key={category.id}
                category={category}
                tasks={categoryTasks}
                allTasks={tasks}
                onAddTask={onAddTask}
                onToggleTaskComplete={onToggleTaskComplete}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                onAddSubtask={onAddSubtask}
                onAddTaskAtSameLevel={onAddTaskAtSameLevel}
                canDeleteCategory={category.id !== DEFAULT_CATEGORY_ID}
                currentTime={currentTime}
                prayerSettings={prayerSettings}
                onUpdatePrayerSettings={onUpdatePrayerSettings}
                isUpdatingPrayers={isUpdatingPrayers}
                getMissedPrayersCount={getMissedPrayersCount}
                onAddTodaysPrayers={onAddTodaysPrayers}
                onMoveCategoryUp={moveCategoryUp}
                onMoveCategoryDown={moveCategoryDown}
                onMoveCategoryToTop={moveCategoryToTop}
                onMoveCategoryToBottom={moveCategoryToBottom}
                isFirst={index === 0}
                isLast={index === sortedCategories.length - 1}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}