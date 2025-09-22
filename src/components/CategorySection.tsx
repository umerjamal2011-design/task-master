import React, { useState, useMemo } from 'react';
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
import { Plus, Folder, Trash, Check, X, Pencil, Palette, MapPin, Warning, CaretUp, CaretDown, ArrowUp, ArrowDown, CheckCircle, CaretRight, CaretDown as CaretDownIcon } from '@phosphor-icons/react';
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
  onAddTaskAtSameLevel: (referenceTaskId: string, title: string) => void;
  canDeleteCategory: boolean;
  currentTime?: Date; // Add current time prop
  // Prayer-specific props
  prayerSettings?: PrayerSettings;
  onUpdatePrayerSettings?: (settings: PrayerSettings) => Promise<void>;
  isUpdatingPrayers?: boolean;
  getMissedPrayersCount?: (prayerName: string) => number;
  // Category ordering props
  onMoveCategoryUp?: (categoryId: string) => void;
  onMoveCategoryDown?: (categoryId: string) => void;
  onMoveCategoryToTop?: (categoryId: string) => void;
  onMoveCategoryToBottom?: (categoryId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
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
  onAddTaskAtSameLevel,
  canDeleteCategory,
  currentTime = new Date(), // Default to current time
  prayerSettings,
  onUpdatePrayerSettings,
  isUpdatingPrayers = false,
  getMissedPrayersCount,
  onMoveCategoryUp,
  onMoveCategoryDown,
  onMoveCategoryToTop,
  onMoveCategoryToBottom,
  isFirst = false,
  isLast = false
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
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

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
  
  // Group completed tasks by title for repeating tasks
  const groupedCompletedTasks = useMemo(() => {
    const grouped = new Map<string, { task: Task; completions: Task[]; count: number; subtaskCount: number }>();
    
    completedTasks.forEach(task => {
      // Count subtasks for this task
      const subtaskCount = allTasks.filter(t => t.parentId === task.id).length;
      
      // For repeating tasks, group by the base title (without date info)
      const baseTitle = task.title.replace(/ \(.*?\)$/, ''); // Remove date suffixes
      const key = task.repeatType ? baseTitle : task.id;
      
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.completions.push(task);
        existing.count++;
        existing.subtaskCount += subtaskCount;
      } else {
        grouped.set(key, {
          task: task,
          completions: [task],
          count: 1,
          subtaskCount: subtaskCount
        });
      }
    });
    
    return Array.from(grouped.values());
  }, [completedTasks, allTasks]);
  
  // Only show pending tasks in main view, not completed
  const sortedTasks = [...pendingTasks];

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
      
      // Reset only the title and description for continuous entry
      setNewTaskTitle('');
      setNewTaskDescription('');
      // Keep the add task form open and maintain other settings
      // Auto-focus the title input for next entry
      setTimeout(() => {
        const input = document.querySelector(`input[placeholder="Task title..."]`) as HTMLInputElement;
        if (input) input.focus();
      }, 50);
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
        className="w-full group border" 
        style={{
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
                      {pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'}
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
                        {groupedCompletedTasks.length} completed
                      </Badge>
                    )}
                    
                    {/* Missed prayers counter for prayer category */}
                    {isPrayerCategory && getMissedPrayersCount && (
                      <>
                        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(prayerName => {
                          const missedCount = getMissedPrayersCount(prayerName);
                          if (missedCount === 0) return null;
                          
                          return (
                            <Badge 
                              key={prayerName}
                              variant="destructive" 
                              className="text-xs bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
                            >
                              {prayerName}: {missedCount} missed
                            </Badge>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {!isEditingCategory && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Category ordering controls */}
                {(onMoveCategoryUp || onMoveCategoryDown || onMoveCategoryToTop || onMoveCategoryToBottom) && (
                  <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Top/Bottom controls */}
                    <div className="flex flex-col gap-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onMoveCategoryToTop?.(category.id)}
                        disabled={isFirst}
                        className="h-5 w-6 p-0 hover:bg-secondary"
                        title="Move to top"
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onMoveCategoryToBottom?.(category.id)}
                        disabled={isLast}
                        className="h-5 w-6 p-0 hover:bg-secondary"
                        title="Move to bottom"
                      >
                        <ArrowDown size={12} />
                      </Button>
                    </div>
                    
                    {/* Up/Down controls */}
                    <div className="flex flex-col gap-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onMoveCategoryUp?.(category.id)}
                        disabled={isFirst}
                        className="h-5 w-6 p-0 hover:bg-secondary"
                        title="Move up"
                      >
                        <CaretUp size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onMoveCategoryDown?.(category.id)}
                        disabled={isLast}
                        className="h-5 w-6 p-0 hover:bg-secondary"
                        title="Move down"
                      >
                        <CaretDown size={12} />
                      </Button>
                    </div>
                  </div>
                )}
                
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
                        placeholder="Task title... (↵ continue, Esc close)"
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
                    onAddTaskAtSameLevel={onAddTaskAtSameLevel}
                    currentTime={currentTime}
                  />
                ))}
              </div>
            ) : (
              pendingTasks.length === 0 && completedTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Folder size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No tasks yet</p>
                  <p className="text-sm">Click "Add Task" to get started</p>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <Button
                variant="ghost"
                onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                className="w-full justify-between text-muted-foreground hover:text-foreground mb-3 h-auto p-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">
                    Completed ({groupedCompletedTasks.length})
                  </span>
                </div>
                {showCompletedTasks ? (
                  <CaretDownIcon size={16} />
                ) : (
                  <CaretRight size={16} />
                )}
              </Button>

              <AnimatePresence>
                {showCompletedTasks && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {groupedCompletedTasks.map((group, index) => (
                      <Card
                        key={`completed-${group.task.id}-${index}`}
                        className="p-3 bg-muted/20 border-muted group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <CheckCircle 
                              size={16} 
                              className="text-green-600 dark:text-green-400 flex-shrink-0" 
                              weight="fill"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground line-through decoration-2 decoration-muted-foreground/50">
                                {group.task.title}
                              </div>
                              {group.task.description && (
                                <div className="text-xs text-muted-foreground mt-1 line-through">
                                  {group.task.description}
                                </div>
                              )}
                              {group.task.completedAt && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Completed: {new Date(group.task.completedAt).toLocaleDateString()}
                                  {group.task.scheduledTime && ` at ${group.task.scheduledTime}`}
                                </div>
                              )}
                              {group.subtaskCount > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {group.subtaskCount} subtask{group.subtaskCount !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {group.count > 1 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: `${category.color || '#3B82F6'}20`,
                                  color: category.color || '#3B82F6'
                                }}
                              >
                                {group.count}x completed
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onToggleTaskComplete(group.task.id)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Mark as incomplete"
                            >
                              <X size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteTask(group.task.id)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              title="Delete task"
                            >
                              <Trash size={12} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}