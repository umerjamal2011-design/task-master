import React, { useState } from 'react';
import { Category, Task } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TaskItem } from './TaskItem';
import { Plus, Folder, Trash, Check, X, Pencil, Palette } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategorySectionProps {
  category: Category;
  tasks: Task[];
  allTasks: Task[];
  onAddTask: (categoryId: string, title: string, description?: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  canDeleteCategory: boolean;
}

export function CategorySection({
  category,
  tasks,
  allTasks,
  onAddTask,
  onToggleTaskComplete,
  onUpdateTask,
  onDeleteTask,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubtask,
  canDeleteCategory
}: CategorySectionProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState(category.name);
  const [editCategoryColor, setEditCategoryColor] = useState(category.color || '#3B82F6');
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);

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

  // Filter to only show top-level tasks (not subtasks)
  const mainTasks = tasks.filter(task => !task.parentId);
  const completedTasks = mainTasks.filter(task => task.completed);
  const pendingTasks = mainTasks.filter(task => !task.completed);
  const sortedTasks = [...pendingTasks, ...completedTasks];

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(category.id, newTaskTitle.trim(), newTaskDescription.trim() || undefined);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowAddTask(false);
    }
  };

  const handleSaveCategory = () => {
    if (editCategoryName.trim() && editCategoryName.trim() !== category.name) {
      onUpdateCategory(category.id, { name: editCategoryName.trim() });
    }
    setIsEditingCategory(false);
  };

  const handleSaveCustomization = () => {
    onUpdateCategory(category.id, { 
      name: editCategoryName.trim(), 
      color: editCategoryColor 
    });
    setShowCustomizeDialog(false);
  };

  const handleCancelEditCategory = () => {
    setEditCategoryName(category.name);
    setEditCategoryColor(category.color || '#3B82F6');
    setIsEditingCategory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showAddTask) {
        handleAddTask();
      } else if (isEditingCategory) {
        handleSaveCategory();
      }
    } else if (e.key === 'Escape') {
      if (showAddTask) {
        setShowAddTask(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
      } else if (isEditingCategory) {
        handleCancelEditCategory();
      }
    }
  };

  return (
    <motion.div
      id={`category-${category.id}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="w-full group" 
        style={{
          background: `linear-gradient(135deg, ${category.color || '#3B82F6'}12 0%, ${category.color || '#3B82F6'}05 100%)`,
          borderColor: `${category.color || '#3B82F6'}40`
        }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-5 h-5 rounded-full border-2 border-background shadow-sm" 
                style={{ backgroundColor: category.color || '#3B82F6' }}
              />
              {isEditingCategory ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-lg font-semibold"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveCategory}>
                    <Check size={16} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEditCategory}>
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1">
                  <h2 
                    className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setIsEditingCategory(true)}
                  >
                    {category.name}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </Badge>
                  {completedTasks.length > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${category.color || '#3B82F6'}15`,
                        borderColor: `${category.color || '#3B82F6'}50`,
                        color: category.color || '#3B82F6'
                      }}
                    >
                      {completedTasks.length} completed
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {!isEditingCategory && (
              <div className="flex items-center gap-2">
                <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Palette size={16} />
                    </Button>
                  </DialogTrigger>
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Choose Color</Label>
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
                        onClick={() => {
                          setEditCategoryName(category.name);
                          setEditCategoryColor(category.color || '#3B82F6');
                          setShowCustomizeDialog(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveCustomization}>
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingCategory(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil size={16} />
                </Button>
                {canDeleteCategory && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteCategory(category.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  >
                    <Trash size={16} />
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                  className="gap-2"
                  style={{
                    backgroundColor: category.color || '#3B82F6',
                    borderColor: category.color || '#3B82F6',
                    color: 'white'
                  }}
                >
                  <Plus size={16} />
                  Add Task
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <AnimatePresence>
            {showAddTask && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="p-4 border-dashed"
                  style={{
                    backgroundColor: `${category.color || '#3B82F6'}12`,
                    borderColor: `${category.color || '#3B82F6'}40`
                  }}
                >
                  <div className="space-y-3">
                    <Input
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddTask} 
                        disabled={!newTaskTitle.trim()}
                        style={{
                          backgroundColor: category.color || '#3B82F6',
                          borderColor: category.color || '#3B82F6',
                          color: 'white'
                        }}
                      >
                        <Plus size={16} />
                        Add Task
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddTask(false);
                          setNewTaskTitle('');
                          setNewTaskDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sortedTasks.length > 0 ? (
              <div className="space-y-3">
                {sortedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    allTasks={allTasks}
                    categoryName={category.name}
                    categoryColor={category.color || '#3B82F6'}
                    onToggleComplete={onToggleTaskComplete}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onAddSubtask={onAddSubtask}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Folder size={48} className="mx-auto mb-3 opacity-50" />
                <p>No tasks yet</p>
                <p className="text-sm">Click "Add Task" to get started</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}