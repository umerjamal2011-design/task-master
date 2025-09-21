import React, { useState } from 'react';
import { Category, Task, PrayerSettings } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TaskItem } from './TaskItem';
import { QuickDatePicker } from './QuickDatePicker';
import { RepeatSettings } from './RepeatSettings';
import { PrayerLocationManager } from './PrayerLocationManager';
import { Plus, Folder, Trash, Check, X, Pencil, Palette, MapPin, Warning } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategorySectionProps {
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
  canDeleteCategory: boolean;
  // Prayer-specific props
  prayerSettings?: PrayerSettings;
  onUpdatePrayerSettings?: (settings: PrayerSettings) => Promise<void>;
  isUpdatingPrayers?: boolean;
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
  canDeleteCategory,
  prayerSettings,
  onUpdatePrayerSettings,
  isUpdatingPrayers = false
}: CategorySectionProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskScheduledDate, setNewTaskScheduledDate] = useState('no-date');
  const [newTaskScheduledTime, setNewTaskScheduledTime] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskRepeatType, setNewTaskRepeatType] = useState<Task['repeatType']>(null);

  // Prayer category identifier
  const PRAYER_CATEGORY_ID = 'prayers';
  const isPrayerCategory = category.id === PRAYER_CATEGORY_ID;
  const [newTaskRepeatInterval, setNewTaskRepeatInterval] = useState(1);
  const [newTaskRepeatEndDate, setNewTaskRepeatEndDate] = useState('');
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
      const taskOptions: Partial<Task> = {
        scheduledDate: newTaskScheduledDate === 'no-date' ? undefined : newTaskScheduledDate,
        scheduledTime: newTaskScheduledTime || undefined,
        priority: newTaskPriority,
        repeatType: newTaskRepeatType,
        repeatInterval: newTaskRepeatType ? newTaskRepeatInterval : undefined,
        repeatEndDate: newTaskRepeatType ? newTaskRepeatEndDate || undefined : undefined
      };

      onAddTask(
        category.id, 
        newTaskTitle.trim().substring(0, 150), 
        newTaskDescription.trim().substring(0, 300) || undefined,
        taskOptions
      );
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskScheduledDate('no-date');
      setNewTaskScheduledTime('');
      setNewTaskPriority('medium');
      setNewTaskRepeatType(null);
      setNewTaskRepeatInterval(1);
      setNewTaskRepeatEndDate('');
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
        setNewTaskScheduledDate('no-date');
        setNewTaskScheduledTime('');
        setNewTaskPriority('medium');
        setNewTaskRepeatType(null);
        setNewTaskRepeatInterval(1);
        setNewTaskRepeatEndDate('');
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
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-5 h-5 rounded-full border-2 border-background shadow-sm flex-shrink-0" 
                style={{ backgroundColor: category.color || '#3B82F6' }}
              />
              {isEditingCategory ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Input
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-lg font-semibold flex-1 min-w-0"
                    autoFocus
                  />
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" onClick={handleSaveCategory}>
                      <Check size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEditCategory}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <h2 
                    className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setIsEditingCategory(true)}
                  >
                    {category.name}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
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
                </div>
              )}
            </div>
            
            {!isEditingCategory && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Desktop buttons */}
                <div className="hidden sm:flex items-center gap-2">
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
                  {!isPrayerCategory && (
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
                  )}
                </div>

                {/* Mobile compact button */}
                {!isPrayerCategory && (
                  <div className="sm:hidden">
                    <Button
                      size="sm"
                      onClick={() => setShowAddTask(true)}
                      className="h-8 w-8 p-0 rounded-full"
                      style={{
                        backgroundColor: category.color || '#3B82F6',
                        borderColor: category.color || '#3B82F6',
                        color: 'white'
                      }}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pb-4">
          {/* Prayer Category Warning and Location Manager */}
          {isPrayerCategory && (
            <div className="space-y-3 mb-4">
              {/* Warning about automatic updates */}
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <Warning size={16} className="text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                  Prayer times update automatically daily based on your location and change throughout the year.
                </AlertDescription>
              </Alert>

              {/* Prayer Location Manager - only show if we have the necessary props */}
              {prayerSettings && onUpdatePrayerSettings && (
                <div className="bg-muted/30 rounded-lg p-3 border border-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Prayer Location Settings</span>
                  </div>
                  
                  {prayerSettings.location && (
                    <div className="text-sm text-muted-foreground mb-3">
                      Current: {prayerSettings.location.city}, {prayerSettings.location.country}
                    </div>
                  )}
                  
                  <PrayerLocationManager
                    prayerSettings={prayerSettings}
                    onUpdatePrayerSettings={onUpdatePrayerSettings}
                    isUpdating={isUpdatingPrayers}
                  />
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {showAddTask && !isPrayerCategory && (
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
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        placeholder="Task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value.substring(0, 150))}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="pr-14"
                      />
                      <div className="absolute right-2 top-3 text-xs text-muted-foreground">
                        {newTaskTitle.length}/150
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Textarea
                        placeholder="Description (optional)"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value.substring(0, 300))}
                        onKeyDown={handleKeyDown}
                        className="resize-none min-h-[60px] max-h-[120px] pr-14"
                        rows={2}
                      />
                      <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                        {newTaskDescription.length}/300
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Priority</Label>
                      <Select value={newTaskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Schedule Date</Label>
                      <QuickDatePicker
                        selectedDate={newTaskScheduledDate}
                        onDateChange={setNewTaskScheduledDate}
                      />
                    </div>

                    {newTaskScheduledDate && newTaskScheduledDate !== 'no-date' && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Time (optional)</Label>
                        <Input
                          type="time"
                          value={newTaskScheduledTime}
                          onChange={(e) => setNewTaskScheduledTime(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    )}

                    {newTaskScheduledDate && newTaskScheduledDate !== 'no-date' && (
                      <RepeatSettings
                        task={{
                          repeatType: newTaskRepeatType,
                          repeatInterval: newTaskRepeatInterval,
                          repeatEndDate: newTaskRepeatEndDate
                        }}
                        onRepeatChange={(repeatSettings) => {
                          setNewTaskRepeatType(repeatSettings.repeatType || null);
                          setNewTaskRepeatInterval(repeatSettings.repeatInterval);
                          setNewTaskRepeatEndDate(repeatSettings.repeatEndDate || '');
                        }}
                      />
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button 
                        onClick={handleAddTask} 
                        disabled={!newTaskTitle.trim()}
                        className="w-full sm:w-auto"
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
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setShowAddTask(false);
                          setNewTaskTitle('');
                          setNewTaskDescription('');
                          setNewTaskScheduledDate('no-date');
                          setNewTaskScheduledTime('');
                          setNewTaskPriority('medium');
                          setNewTaskRepeatType(null);
                          setNewTaskRepeatInterval(1);
                          setNewTaskRepeatEndDate('');
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
              <div className="space-y-0.5">
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