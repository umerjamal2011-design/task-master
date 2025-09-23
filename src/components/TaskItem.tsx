import React, { useState } from 'react';
import { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { QuickDatePicker } from '@/components/QuickDatePicker';
import { RepeatSettings } from '@/components/RepeatSettings';
import { RepeatIndicator } from '@/components/RepeatIndicator';
import { Pencil, Trash, Check, X, Plus, Clock, Calendar, CaretRight, CaretDown, Dot, Repeat, ArrowRight } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { isRepeatingTask } from '@/lib/repeat-utils';
import { getDateLabel, getTimeLabel, isTaskOverdue, getTaskStatus } from '@/lib/date-utils';
import { toast } from 'sonner';

interface TaskItemProps {
  task: Task;
  allTasks: Task[];
  categoryName: string;
  categoryColor: string;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onAddTaskAtSameLevel: (referenceTaskId: string, title: string) => void;
  showTimeScheduling?: boolean;
  depth?: number;
  isDailyView?: boolean;
  currentTime?: Date; // Add current time prop
}

export function TaskItem({ 
  task, 
  allTasks, 
  categoryName,
  categoryColor, 
  onToggleComplete, 
  onUpdate, 
  onDelete, 
  onAddSubtask,
  onAddTaskAtSameLevel,
  showTimeScheduling = true,
  depth = 0,
  isDailyView = false,
  currentTime = new Date() // Default to current time
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showAddSameLevel, setShowAddSameLevel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(task.scheduledDate || new Date().toISOString().split('T')[0]);
  const [rescheduleTime, setRescheduleTime] = useState(task.scheduledTime || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSameLevelTitle, setNewSameLevelTitle] = useState('');
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editScheduledDate, setEditScheduledDate] = useState(task.scheduledDate || 'no-date');
  const [editScheduledTime, setEditScheduledTime] = useState(task.scheduledTime || '');
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editRepeatType, setEditRepeatType] = useState(task.repeatType || null);
  const [editRepeatInterval, setEditRepeatInterval] = useState(task.repeatInterval || 1);
  const [editRepeatEndDate, setEditRepeatEndDate] = useState(task.repeatEndDate || '');

  // Get subtasks
  const subtasks = allTasks.filter(t => t.parentId === task.id);
  const hasSubtasks = subtasks.length > 0;

  // Get total subtask count (including nested subtasks)
  const getTotalSubtaskCount = (taskId: string): number => {
    const directSubtasks = allTasks.filter(t => t.parentId === taskId);
    let total = directSubtasks.length;
    
    // Recursively count subtasks of subtasks
    for (const subtask of directSubtasks) {
      total += getTotalSubtaskCount(subtask.id);
    }
    
    return total;
  };

  const totalSubtasks = getTotalSubtaskCount(task.id);

  const MAX_TITLE_LENGTH = 150;
  const MAX_DESCRIPTION_LENGTH = 200;
  const MAX_SUBTASK_LENGTH = 150;

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim().substring(0, MAX_TITLE_LENGTH),
        description: editDescription.trim().substring(0, MAX_DESCRIPTION_LENGTH) || undefined,
        scheduledDate: editScheduledDate === 'no-date' ? undefined : editScheduledDate,
        scheduledTime: editScheduledTime || undefined,
        priority: editPriority as Task['priority'],
        repeatType: editRepeatType,
        repeatInterval: editRepeatType ? editRepeatInterval : undefined,
        repeatEndDate: editRepeatType ? editRepeatEndDate || undefined : undefined
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditScheduledDate(task.scheduledDate || 'no-date');
    setEditScheduledTime(task.scheduledTime || '');
    setEditPriority(task.priority || 'medium');
    setEditRepeatType(task.repeatType || null);
    setEditRepeatInterval(task.repeatInterval || 1);
    setEditRepeatEndDate(task.repeatEndDate || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim().substring(0, MAX_SUBTASK_LENGTH));
      setNewSubtaskTitle('');
      // Keep the input field open for continuous entry
      setIsExpanded(true);
      // Auto-focus the input field again for next entry
      setTimeout(() => {
        const input = document.querySelector(`input[placeholder="Add subtask..."]`) as HTMLInputElement;
        if (input) input.focus();
      }, 50);
    }
  };

  const handleAddSameLevel = () => {
    if (newSameLevelTitle.trim()) {
      onAddTaskAtSameLevel(task.id, newSameLevelTitle.trim().substring(0, MAX_SUBTASK_LENGTH));
      setNewSameLevelTitle('');
      // Keep the input field open for continuous entry
      // Auto-focus the input field again for next entry
      setTimeout(() => {
        const input = document.querySelector(`input[placeholder="Add task at same level..."]`) as HTMLInputElement;
        if (input) input.focus();
      }, 50);
    }
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
      // Don't close the input - keeps it open for continuous entry
    } else if (e.key === 'Escape') {
      setShowAddSubtask(false);
      setNewSubtaskTitle('');
    }
  };

  const handleSameLevelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSameLevel();
      // Don't close the input - keeps it open for continuous entry
    } else if (e.key === 'Escape') {
      setShowAddSameLevel(false);
      setNewSameLevelTitle('');
    }
  };

  const handleReschedule = () => {
    if (rescheduleDate) {
      onUpdate(task.id, {
        scheduledDate: rescheduleDate,
        scheduledTime: rescheduleTime || undefined
      });
      
      toast.success(`Task rescheduled to ${new Date(rescheduleDate).toLocaleDateString()}`);
      setShowReschedule(false);
    }
  };

  const getQuickRescheduleOptions = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      { label: 'Today', value: today },
      { label: 'Tomorrow', value: tomorrow.toISOString().split('T')[0] },
      { label: 'Next Week', value: nextWeek.toISOString().split('T')[0] }
    ];
  };

  // Get task status for visual feedback
  const taskStatus = getTaskStatus(task, currentTime);
  const isOverdue = task.scheduledDate ? isTaskOverdue(task.scheduledDate, currentTime) : false;

  const formatTime = (time: string) => {
    if (!task.scheduledDate) return time;
    return getTimeLabel(task.scheduledDate, time, currentTime);
  };

  const formatDate = (dateStr: string) => {
    return getDateLabel(dateStr, currentTime);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return { bg: '#EF444420', color: '#EF4444', border: '#EF444450' };
      case 'medium': return { bg: `${categoryColor}20`, color: categoryColor, border: `${categoryColor}50` };
      case 'low': return { bg: '#10B98120', color: '#10B981', border: '#10B98150' };
      default: return { bg: '#6B728020', color: '#6B7280', border: '#6B728050' };
    }
  };

  return (
    <div className="flex items-start">
      {/* Subtask indicator dots with proper alignment */}
      {depth > 0 && (
        <div className="flex items-center gap-1 pt-1.5 flex-shrink-0 mr-1.5">
          {Array.from({ length: depth }, (_, index) => (
            <div
              key={index}
              className="w-2.5 h-2.5 rounded-full border border-current"
              style={{ 
                backgroundColor: `${categoryColor}50`,
                borderColor: `${categoryColor}90`
              }}
            />
          ))}
        </div>
      )}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
      <Card 
        className={`transition-all duration-200 group ${
          task.completed 
            ? 'bg-muted/50 border-muted shadow-none opacity-75' 
            : isOverdue
              ? 'bg-destructive/5 border-destructive/30 hover:shadow-sm'
              : taskStatus === 'current'
                ? 'bg-accent/5 border-accent/30 hover:shadow-sm'
                : 'bg-card hover:shadow-sm border-border'
        } ${depth > 0 ? 'border-l-2' : 'border-l-3'}`}
        style={{
          borderLeft: `${depth > 0 ? '2px' : '3px'} solid ${
            task.completed 
              ? '#94A3B8' 
              : isOverdue 
                ? '#EF4444' 
                : taskStatus === 'current' 
                  ? '#F59E0B' 
                  : categoryColor
          }`
        }}
      >
        <div className="px-3 py-2">
          <div className="flex items-center gap-1">
            {/* Expand/Collapse Button with Subtask Counter */}
            {hasSubtasks && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <CaretDown size={12} /> : <CaretRight size={12} />}
                </Button>
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 text-sm min-w-0"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    color: categoryColor,
                    borderColor: `${categoryColor}40`,
                    fontSize: '11px',
                    height: '16px',
                    lineHeight: '14px'
                  }}
                  title={`${totalSubtasks} total subtask${totalSubtasks !== 1 ? 's' : ''} (${subtasks.length} direct)`}
                >
                  {totalSubtasks}
                </Badge>
              </div>
            )}

            <div 
              className={`flex items-center justify-center w-4 h-4 rounded border flex-shrink-0 transition-all cursor-pointer hover:scale-105 ${
                task.completed ? 'ring-2 ring-opacity-30' : ''
              }`}
              style={{ 
                borderColor: task.completed ? categoryColor : '#94A3B8',
                backgroundColor: task.completed ? categoryColor : 'transparent',
                '--tw-ring-color': task.completed ? `${categoryColor}50` : 'transparent'
              } as React.CSSProperties}
              onClick={() => onToggleComplete(task.id)}
            >
              {task.completed && (
                <motion.svg 
                  className="w-2.5 h-2.5 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </motion.svg>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-1.5">
                  {/* Title and Description in one row on larger screens */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                    <div className="relative">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value.substring(0, MAX_TITLE_LENGTH))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSave();
                          } else if (e.key === 'Escape') {
                            handleCancel();
                          }
                        }}
                        className="font-medium text-xs h-6 pr-10"
                        placeholder="Task title"
                        autoFocus
                      />
                      <div className="absolute right-1 top-1 text-xs text-muted-foreground pointer-events-none" style={{ fontSize: '8px' }}>
                        {editTitle.length}/{MAX_TITLE_LENGTH}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value.substring(0, MAX_DESCRIPTION_LENGTH))}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleCancel();
                          }
                        }}
                        className="text-xs h-6 pr-10"
                        placeholder="Description (optional)"
                      />
                      <div className="absolute right-1 top-1 text-xs text-muted-foreground pointer-events-none" style={{ fontSize: '8px' }}>
                        {editDescription.length}/{MAX_DESCRIPTION_LENGTH}
                      </div>
                    </div>
                  </div>
                  
                  {/* Scheduling and Priority in compact layout */}
                  {showTimeScheduling && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                      <div>
                        <QuickDatePicker
                          selectedDate={editScheduledDate}
                          onDateChange={setEditScheduledDate}
                        />
                      </div>
                      
                      {editScheduledDate && editScheduledDate !== 'no-date' && (
                        <div className="flex gap-1">
                          <Input
                            type="time"
                            value={editScheduledTime}
                            onChange={(e) => setEditScheduledTime(e.target.value)}
                            className="text-xs h-6 flex-1"
                            placeholder="Time"
                          />
                          {editScheduledTime && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditScheduledTime('')}
                              className="h-6 w-6 p-0"
                              title="Clear time"
                            >
                              <X size={10} />
                            </Button>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <Select value={editPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setEditPriority(value)}>
                          <SelectTrigger className="text-xs h-6">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          onClick={handleSave}
                          className="h-6 text-xs px-2"
                          style={{
                            backgroundColor: categoryColor,
                            borderColor: categoryColor,
                            color: 'white'
                          }}
                        >
                          <Check size={10} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 text-xs px-2">
                          <X size={10} />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Repeat settings - only show if date is selected and on separate line */}
                  {showTimeScheduling && editScheduledDate && editScheduledDate !== 'no-date' && (
                    <div className="pt-1">
                      <RepeatSettings
                        task={{
                          repeatType: editRepeatType,
                          repeatInterval: editRepeatInterval,
                          repeatEndDate: editRepeatEndDate
                        }}
                        onRepeatChange={(repeatSettings) => {
                          setEditRepeatType(repeatSettings.repeatType || null);
                          setEditRepeatInterval(repeatSettings.repeatInterval);
                          setEditRepeatEndDate(repeatSettings.repeatEndDate || '');
                        }}
                      />
                    </div>
                  )}

                  {/* Fallback save/cancel buttons for when time scheduling is disabled */}
                  {!showTimeScheduling && (
                    <div className="flex gap-1 justify-end">
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        className="h-6 text-xs px-3"
                        style={{
                          backgroundColor: categoryColor,
                          borderColor: categoryColor,
                          color: 'white'
                        }}
                      >
                        <Check size={10} />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 text-xs px-3">
                        <X size={10} />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-0">
                  <div onClick={() => setIsEditing(true)} className="cursor-pointer">
                    <h3 className={`font-medium leading-tight break-all transition-all duration-200 ${
                      task.completed 
                        ? 'line-through text-muted-foreground opacity-60' 
                        : 'text-foreground'
                    }`} style={{
                      fontSize: '14px',
                      lineHeight: '18px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
                    }}>
                      {task.completed && <span className="mr-1">✓</span>}
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`leading-tight break-all mt-0.5 transition-all duration-200 ${
                        task.completed 
                          ? 'line-through text-muted-foreground opacity-50' 
                          : 'text-muted-foreground'
                      }`} style={{
                        fontSize: '12px',
                        lineHeight: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Task metadata */}
                  <div className="flex flex-wrap items-center gap-0.5 mt-0.5">
                    {task.priority && task.priority !== 'medium' && (
                      <Badge 
                        variant="outline" 
                        className={`px-1 py-0 transition-all duration-200 ${task.completed ? 'opacity-50' : ''}`}
                        style={{
                          backgroundColor: task.completed ? '#94A3B850' : getPriorityColor(task.priority).bg,
                          color: task.completed ? '#64748B' : getPriorityColor(task.priority).color,
                          borderColor: task.completed ? '#94A3B870' : getPriorityColor(task.priority).border,
                          fontSize: '11px',
                          height: '18px',
                          lineHeight: '16px',
                          padding: '1px 6px'
                        }}
                      >
                        {task.priority}
                      </Badge>
                    )}
                    
                    {task.scheduledDate && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 px-2 py-0.5 transition-all duration-200 ${task.completed ? 'opacity-50' : ''} ${isOverdue && !task.completed ? 'animate-pulse' : ''}`}
                        style={{
                          backgroundColor: task.completed 
                            ? '#94A3B820' 
                            : isOverdue 
                              ? '#EF444412'
                              : taskStatus === 'current'
                                ? '#F59E0B12'
                                : `${categoryColor}12`,
                          borderColor: task.completed 
                            ? '#94A3B850' 
                            : isOverdue 
                              ? '#EF444440'
                              : taskStatus === 'current'
                                ? '#F59E0B40'
                                : `${categoryColor}40`,
                          color: task.completed 
                            ? '#64748B' 
                            : isOverdue 
                              ? '#EF4444'
                              : taskStatus === 'current'
                                ? '#F59E0B'
                                : categoryColor,
                          fontSize: '11px',
                          height: '20px',
                          lineHeight: '18px',
                          padding: '1px 6px'
                        }}
                        title={isOverdue && !task.completed ? 'Overdue task' : undefined}
                      >
                        <Calendar size={12} />
                        {formatDate(task.scheduledDate)}
                        {isOverdue && !task.completed && ' ⚠️'}
                      </Badge>
                    )}
                    
                    {task.scheduledTime && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 px-2 py-0.5 transition-all duration-200 ${task.completed ? 'opacity-50' : ''} ${isOverdue && !task.completed ? 'animate-pulse' : ''}`}
                        style={{
                          backgroundColor: task.completed 
                            ? '#94A3B820' 
                            : isOverdue 
                              ? '#EF444412'
                              : taskStatus === 'current'
                                ? '#F59E0B12'
                                : `${categoryColor}12`,
                          borderColor: task.completed 
                            ? '#94A3B850' 
                            : isOverdue 
                              ? '#EF444440'
                              : taskStatus === 'current'
                                ? '#F59E0B40'
                                : `${categoryColor}40`,
                          color: task.completed 
                            ? '#64748B' 
                            : isOverdue 
                              ? '#EF4444'
                              : taskStatus === 'current'
                                ? '#F59E0B'
                                : categoryColor,
                          fontSize: '11px',
                          height: '20px',
                          lineHeight: '18px',
                          padding: '1px 6px'
                        }}
                        title={isOverdue && !task.completed ? 'Time has passed' : undefined}
                      >
                        <Clock size={12} />
                        {formatTime(task.scheduledTime)}
                      </Badge>
                    )}

                    {/* Virtual Instance Indicator for repeated tasks */}
                    {task.isRepeatedInstance && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 px-2 py-0.5 transition-all duration-200 ${task.completed ? 'opacity-50' : ''}`}
                        style={{
                          backgroundColor: task.completed ? '#94A3B820' : '#E0F2FE',
                          borderColor: task.completed ? '#94A3B850' : '#0EA5E9',
                          color: task.completed ? '#64748B' : '#0284C7',
                          fontSize: '11px',
                          height: '20px',
                          lineHeight: '18px',
                          padding: '1px 6px'
                        }}
                        title="This is a repeated instance of a recurring task"
                      >
                        <Repeat size={12} />
                        Instance
                      </Badge>
                    )}
                    
                    {/* Repeat Indicator */}
                    <RepeatIndicator task={task} />

                    {depth === 0 && (
                      <Badge 
                        variant="secondary" 
                        className={`px-2 py-0.5 transition-all duration-200 ${task.completed ? 'opacity-50' : ''}`}
                        style={{
                          backgroundColor: task.completed ? '#94A3B830' : `${categoryColor}20`,
                          color: task.completed ? '#64748B' : categoryColor,
                          borderColor: task.completed ? '#94A3B850' : `${categoryColor}40`,
                          fontSize: '11px',
                          height: '20px',
                          lineHeight: '18px',
                          padding: '1px 6px'
                        }}
                      >
                        {categoryName}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity ml-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSubtask(true);
                  }}
                  className="h-6 w-6 p-0"
                  title="Add subtask"
                >
                  <Plus size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSameLevel(true);
                  }}
                  className="h-6 w-6 p-0"
                  title="Add task at same level"
                >
                  <Plus size={12} weight="bold" />
                </Button>
                {/* Reschedule button - only show for overdue tasks */}
                {isOverdue && !task.completed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReschedule(true);
                    }}
                    className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700"
                    title="Reschedule overdue task"
                  >
                    <ArrowRight size={12} />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="h-6 w-6 p-0"
                  title="Edit task"
                >
                  <Pencil size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  title="Delete task"
                >
                  <Trash size={12} />
                </Button>
              </div>
            )}
          </div>
          
          {/* Add Subtask Input */}
          {showAddSubtask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1"
              style={{ marginLeft: `${(depth + 1) * 12 + 4}px` }}
            >
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Input
                    placeholder="Add subtask... (↵ continue, Esc close)"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value.substring(0, MAX_SUBTASK_LENGTH))}
                    onKeyDown={handleSubtaskKeyDown}
                    autoFocus
                    className="flex-1 h-5 pr-8 text-xs break-all"
                    style={{ 
                      fontSize: '10px',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word'
                    }}
                  />
                  <div className="absolute right-1 top-0.5 text-xs text-muted-foreground pointer-events-none">
                    {newSubtaskTitle.length}/{MAX_SUBTASK_LENGTH}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleAddSubtask} 
                  disabled={!newSubtaskTitle.trim()}
                  className="h-5 px-1"
                  style={{
                    backgroundColor: categoryColor,
                    borderColor: categoryColor,
                    color: 'white'
                  }}
                >
                  <Plus size={8} />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddSubtask(false);
                    setNewSubtaskTitle('');
                  }}
                  className="h-5 px-1"
                >
                  <X size={8} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Add Same Level Task Input */}
          {showAddSameLevel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1"
              style={{ marginLeft: `${depth * 12 + 4}px` }}
            >
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Input
                    placeholder="Add at same level... (↵ continue, Esc close)"
                    value={newSameLevelTitle}
                    onChange={(e) => setNewSameLevelTitle(e.target.value.substring(0, MAX_SUBTASK_LENGTH))}
                    onKeyDown={handleSameLevelKeyDown}
                    autoFocus
                    className="flex-1 h-5 pr-8 text-xs break-all"
                    style={{ 
                      fontSize: '10px',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word'
                    }}
                  />
                  <div className="absolute right-1 top-0.5 text-xs text-muted-foreground pointer-events-none">
                    {newSameLevelTitle.length}/{MAX_SUBTASK_LENGTH}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleAddSameLevel} 
                  disabled={!newSameLevelTitle.trim()}
                  className="h-5 px-1"
                  style={{
                    backgroundColor: categoryColor,
                    borderColor: categoryColor,
                    color: 'white'
                  }}
                >
                  <Plus size={8} weight="bold" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddSameLevel(false);
                    setNewSameLevelTitle('');
                  }}
                  className="h-5 px-1"
                >
                  <X size={8} />
                </Button>
              </div>
            </motion.div>
          )}
          
          {task.completed && task.completedAt && (
            <div className="mt-0.5 text-muted-foreground" 
                 style={{ 
                   fontSize: '9px',
                   marginLeft: `${(depth + 1) * 12 + 4}px`
                 }}>
              Completed {new Date(task.completedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </Card>

      {/* Subtasks - only render if NOT in daily view */}
      <AnimatePresence>
        {!isDailyView && isExpanded && hasSubtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 space-y-0.5"
          >
            {subtasks.map(subtask => (
              <TaskItem
                key={subtask.id}
                task={subtask}
                allTasks={allTasks}
                categoryName={categoryName}
                categoryColor={categoryColor}
                onToggleComplete={onToggleComplete}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddSubtask={onAddSubtask}
                onAddTaskAtSameLevel={onAddTaskAtSameLevel}
                showTimeScheduling={showTimeScheduling}
                depth={depth + 1}
                isDailyView={isDailyView}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    
    {/* Reschedule Dialog */}
    <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-secondary/30 rounded-lg">
            <h4 className="font-medium text-sm mb-1">{task.title}</h4>
            <p className="text-xs text-muted-foreground">
              Currently scheduled for {task.scheduledDate}
              {task.scheduledTime && ` at ${task.scheduledTime}`}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm mb-2 block">Quick Options</Label>
              <div className="grid grid-cols-3 gap-2">
                {getQuickRescheduleOptions().map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRescheduleDate(option.value);
                      if (option.label === 'Today') {
                        setRescheduleTime('');
                      }
                    }}
                    className={`text-xs ${rescheduleDate === option.value ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Date</Label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Time (Optional)</Label>
                <div className="flex gap-1">
                  <Input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="flex-1"
                  />
                  {rescheduleTime && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRescheduleTime('')}
                      className="px-2"
                      title="Clear time"
                    >
                      <X size={12} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleReschedule}
              disabled={!rescheduleDate}
              className="flex-1"
            >
              <Check size={14} className="mr-1" />
              Reschedule
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowReschedule(false)}
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}