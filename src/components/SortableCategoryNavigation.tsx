import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DotsSixVertical, DotsThreeVertical, Trash, Pencil, Palette } from '@phosphor-icons/react';

interface SortableCategoryNavItemProps {
  category: Category;
  tasks: Task[];
  onScrollToCategory: (categoryId: string) => void;
  onQuickAddTask: (categoryId: string) => void;
  quickAddTaskCategory: string | null;
  quickTaskTitle: string;
  onQuickTaskTitleChange: (title: string) => void;
  onQuickTaskSubmit: (categoryId: string) => void;
  onQuickTaskCancel: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
  onUpdateCategory?: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (categoryId: string) => void;
  canDeleteCategory?: boolean;
}

function SortableCategoryNavItem({
  category,
  tasks,
  onScrollToCategory,
  onQuickAddTask,
  quickAddTaskCategory,
  quickTaskTitle,
  onQuickTaskTitleChange,
  onQuickTaskSubmit,
  onQuickTaskCancel,
  isMobile = false,
  onMobileClose,
  onUpdateCategory,
  onDeleteCategory,
  canDeleteCategory = true
}: SortableCategoryNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const [isEditingCategory, setIsEditingCategory] = React.useState(false);
  const [editCategoryName, setEditCategoryName] = React.useState(category.name);
  const [editCategoryColor, setEditCategoryColor] = React.useState(category.color || '#3B82F6');
  const [showCustomizeDialog, setShowCustomizeDialog] = React.useState(false);

  const DEFAULT_CATEGORY_ID = 'general';
  const PRAYER_CATEGORY_ID = 'prayers';
  const canDelete = canDeleteCategory && category.id !== DEFAULT_CATEGORY_ID;

  const categoryColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
    '#EC4899', // pink
    '#6B7280', // gray
  ];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const categoryProgress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Count subtasks in this category
  const getSubtaskCount = (categoryTasks: Task[]): number => {
    // Find all parent tasks in this category
    const parentTasks = categoryTasks.filter(task => !task.parentId);
    let totalSubtasks = 0;

    const countSubtasksRecursively = (parentId: string): number => {
      const subtasks = categoryTasks.filter(task => task.parentId === parentId);
      let count = subtasks.length;
      
      for (const subtask of subtasks) {
        count += countSubtasksRecursively(subtask.id);
      }
      
      return count;
    };

    for (const parentTask of parentTasks) {
      totalSubtasks += countSubtasksRecursively(parentTask.id);
    }

    return totalSubtasks;
  };

  const subtaskCount = getSubtaskCount(tasks);

  const handleQuickTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onQuickTaskSubmit(category.id);
    } else if (e.key === 'Escape') {
      onQuickTaskCancel();
    }
  };

  const handleSaveCategory = () => {
    if (editCategoryName.trim() && onUpdateCategory) {
      onUpdateCategory(category.id, {
        name: editCategoryName.trim(),
        color: editCategoryColor
      });
      setIsEditingCategory(false);
    }
  };

  const handleSaveCustomization = () => {
    if (onUpdateCategory) {
      onUpdateCategory(category.id, { 
        name: editCategoryName.trim(), 
        color: editCategoryColor 
      });
      setShowCustomizeDialog(false);
    }
  };

  const handleCancelEdit = () => {
    setEditCategoryName(category.name);
    setEditCategoryColor(category.color || '#3B82F6');
    setIsEditingCategory(false);
  };

  const handleCancelCustomize = () => {
    setEditCategoryName(category.name);
    setEditCategoryColor(category.color || '#3B82F6');
    setShowCustomizeDialog(false);
  };

  const handleDeleteCategory = () => {
    if (onDeleteCategory && canDelete) {
      if (confirm(`Are you sure you want to delete "${category.name}" and all its tasks?`)) {
        onDeleteCategory(category.id);
        if (isMobile && onMobileClose) {
          onMobileClose();
        }
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-1 relative group">
      <div className="flex items-center gap-1">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-secondary/50 rounded flex-shrink-0"
          title="Drag to reorder"
        >
          <DotsSixVertical size={12} className="text-muted-foreground" />
        </div>

        {/* Quick Add Task Button */}
        <button
          onClick={() => onQuickAddTask(category.id)}
          className="p-1.5 rounded-md hover:bg-secondary/50 transition-colors flex-shrink-0"
          title="Add task to this category"
          style={{ 
            color: category.color || '#3B82F6',
            backgroundColor: quickAddTaskCategory === category.id ? `${category.color || '#3B82F6'}20` : 'transparent'
          }}
        >
          <Plus size={14} />
        </button>
        
        {/* Category Button */}
        <button
          onClick={() => {
            onScrollToCategory(category.id);
            if (isMobile && onMobileClose) {
              onMobileClose();
            }
          }}
          className="flex-1 text-left p-3 rounded-lg bg-card hover:bg-secondary/50 transition-colors border border-border hover:border-border group min-w-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: category.color || '#3B82F6' }}
              />
              <span className="font-medium text-sm truncate">{category.name}</span>
              {subtaskCount > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-xs flex-shrink-0 ml-1"
                  style={{
                    backgroundColor: `${category.color || '#3B82F6'}15`,
                    borderColor: `${category.color || '#3B82F6'}40`,
                    color: category.color || '#3B82F6',
                    fontSize: '9px',
                    height: '16px',
                    padding: '0 4px'
                  }}
                  title={`${subtaskCount} subtask${subtaskCount !== 1 ? 's' : ''}`}
                >
                  +{subtaskCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {completedCount}/{tasks.length}
              </Badge>
            </div>
          </div>
          {tasks.length > 0 && (
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: category.color || '#3B82F6' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${categoryProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{categoryProgress}%</span>
                <span>{tasks.length - completedCount} left</span>
              </div>
            </div>
          )}
        </button>

        {/* Category Options Menu - Always show for better visibility */}
        {(onUpdateCategory || onDeleteCategory) && (
          <>
            {isMobile ? (
              /* Mobile: Show buttons inline for better accessibility */
              <div className="flex items-center gap-1">
                {onUpdateCategory && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingCategory(true)}
                      className="h-8 w-8 p-0 hover:bg-secondary text-muted-foreground hover:text-foreground"
                      title="Edit name"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomizeDialog(true)}
                      className="h-8 w-8 p-0 hover:bg-secondary text-muted-foreground hover:text-foreground"
                      title="Customize category"
                    >
                      <Palette size={14} />
                    </Button>
                  </>
                )}
                {onDeleteCategory && canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteCategory}
                    className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground text-destructive"
                    title="Delete category"
                  >
                    <Trash size={14} />
                  </Button>
                )}
                {!canDelete && category.id === DEFAULT_CATEGORY_ID && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-8 w-8 p-0 text-muted-foreground"
                    title="Cannot delete default category"
                  >
                    <Trash size={14} />
                  </Button>
                )}
              </div>
            ) : (
              /* Desktop: Use dropdown menu - make more visible */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 flex-shrink-0 transition-all ${
                      canDelete || onUpdateCategory 
                        ? 'opacity-70 hover:opacity-100 hover:bg-secondary group-hover:opacity-100' 
                        : 'opacity-30'
                    }`}
                    title="Category options"
                  >
                    <DotsThreeVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48"
                  side="bottom"
                  sideOffset={4}
                >
                  {onUpdateCategory && (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditingCategory(true)}>
                        <Pencil size={14} className="mr-2" />
                        Edit Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowCustomizeDialog(true)}>
                        <Palette size={14} className="mr-2" />
                        Customize
                      </DropdownMenuItem>
                    </>
                  )}
                  {onDeleteCategory && canDelete && (
                    <DropdownMenuItem 
                      onClick={handleDeleteCategory} 
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash size={14} className="mr-2" />
                      Delete Category
                    </DropdownMenuItem>
                  )}
                  {!canDelete && category.id === DEFAULT_CATEGORY_ID && (
                    <DropdownMenuItem disabled className="text-muted-foreground">
                      <Trash size={14} className="mr-2" />
                      Cannot delete default category
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </div>
      
      {/* Quick Add Task Input */}
      <AnimatePresence>
        {quickAddTaskCategory === category.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pl-6 pr-2"
          >
            <div className="flex gap-2 p-2 bg-secondary/20 rounded-md border border-dashed"
                 style={{ borderColor: `${category.color || '#3B82F6'}40` }}>
              <div className="relative flex-1 min-w-0">
                <Input
                  placeholder="Quick task... (↵ continue, Esc close)"
                  value={quickTaskTitle}
                  onChange={(e) => onQuickTaskTitleChange(e.target.value.substring(0, 150))}
                  onKeyDown={handleQuickTaskKeyDown}
                  autoFocus
                  className="flex-1 h-8 text-sm pr-12"
                />
                <div className="absolute right-2 top-2 text-xs text-muted-foreground pointer-events-none">
                  {quickTaskTitle.length}/150
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => onQuickTaskSubmit(category.id)}
                disabled={!quickTaskTitle.trim()}
                className="h-8 px-3 flex-shrink-0"
              >
                <Plus size={12} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Edit Dialog */}
      <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category Name</Label>
              <Input
                placeholder="Enter category name..."
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                maxLength={50}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveCategory} disabled={!editCategoryName.trim()}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Customize Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Category name"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Palette size={14} />
                Choose Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditCategoryColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      editCategoryColor === color 
                        ? 'border-foreground scale-110' 
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancelCustomize}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCustomization} disabled={!editCategoryName.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SortableCategoryNavigationProps {
  categories: Category[];
  tasks: Task[];
  onReorderCategories: (categories: Category[]) => void;
  onScrollToCategory: (categoryId: string) => void;
  quickAddTaskCategory: string | null;
  onQuickAddTaskCategory: (categoryId: string | null) => void;
  quickTaskTitle: string;
  onQuickTaskTitleChange: (title: string) => void;
  onQuickTaskSubmit: (categoryId: string) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
  onUpdateCategory?: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export function SortableCategoryNavigation({
  categories,
  tasks,
  onReorderCategories,
  onScrollToCategory,
  quickAddTaskCategory,
  onQuickAddTaskCategory,
  quickTaskTitle,
  onQuickTaskTitleChange,
  onQuickTaskSubmit,
  isMobile = false,
  onMobileClose,
  onUpdateCategory,
  onDeleteCategory
}: SortableCategoryNavigationProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

  // Filter out repeated instances for counting
  const nonRepeatedTasks = tasks.filter(task => !task.isRepeatedInstance);

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

  const handleQuickAddTask = (categoryId: string) => {
    onQuickAddTaskCategory(quickAddTaskCategory === categoryId ? null : categoryId);
  };

  const handleQuickTaskCancel = () => {
    onQuickAddTaskCategory(null);
    onQuickTaskTitleChange('');
  };

  const DEFAULT_CATEGORY_ID = 'general';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortedCategories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sortedCategories.map((category) => {
            const categoryTasks = nonRepeatedTasks.filter(task => task.categoryId === category.id);
            const canDeleteCategory = category.id !== DEFAULT_CATEGORY_ID;
            
            return (
              <SortableCategoryNavItem
                key={category.id}
                category={category}
                tasks={categoryTasks}
                onScrollToCategory={onScrollToCategory}
                onQuickAddTask={handleQuickAddTask}
                quickAddTaskCategory={quickAddTaskCategory}
                quickTaskTitle={quickTaskTitle}
                onQuickTaskTitleChange={onQuickTaskTitleChange}
                onQuickTaskSubmit={onQuickTaskSubmit}
                onQuickTaskCancel={handleQuickTaskCancel}
                isMobile={isMobile}
                onMobileClose={onMobileClose}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
                canDeleteCategory={canDeleteCategory}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}