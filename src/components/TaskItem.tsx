import React, { useState } from 'react';
import { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash, Check, X, Plus, Clock, Calendar, CaretRight, CaretDown } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  allTasks: Task[];
  categoryName: string;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  showTimeScheduling?: boolean;
  depth?: number;
}

export function TaskItem({ 
  task, 
  allTasks, 
  categoryName, 
  onToggleComplete, 
  onUpdate, 
  onDelete, 
  onAddSubtask,
  showTimeScheduling = true,
  depth = 0 
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editScheduledDate, setEditScheduledDate] = useState(task.scheduledDate || '');
  const [editScheduledTime, setEditScheduledTime] = useState(task.scheduledTime || '');
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');

  // Get subtasks
  const subtasks = allTasks.filter(t => t.parentId === task.id);
  const hasSubtasks = subtasks.length > 0;

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        scheduledDate: editScheduledDate || undefined,
        scheduledTime: editScheduledTime || undefined,
        priority: editPriority as Task['priority']
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditScheduledDate(task.scheduledDate || '');
    setEditScheduledTime(task.scheduledTime || '');
    setEditPriority(task.priority || 'medium');
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
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
      setIsExpanded(true);
    }
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    } else if (e.key === 'Escape') {
      setShowAddSubtask(false);
      setNewSubtaskTitle('');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (dateStr === today) {
      return 'Today';
    } else if (dateStr === tomorrowStr) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const indentLevel = Math.min(depth, 3);
  const marginLeft = indentLevel * 24;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      style={{ marginLeft: `${marginLeft}px` }}
    >
      <Card className={`transition-all duration-200 group ${
        task.completed ? 'bg-muted/30' : 'bg-card hover:shadow-md'
      }`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Expand/Collapse Button */}
            {hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mt-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
              </Button>
            )}

            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="font-medium"
                    placeholder="Task title"
                    autoFocus
                  />
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-sm"
                    placeholder="Description (optional)"
                  />
                  
                  {showTimeScheduling && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                        <Input
                          type="date"
                          value={editScheduledDate}
                          onChange={(e) => setEditScheduledDate(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                        <Input
                          type="time"
                          value={editScheduledTime}
                          onChange={(e) => setEditScheduledTime(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                    <Select value={editPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setEditPriority(value)}>
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
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      <Check size={16} />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X size={16} />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div onClick={() => setIsEditing(true)} className="cursor-pointer">
                    <h3 className={`font-medium leading-tight ${
                      task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-sm mt-1 ${
                        task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                      }`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Task metadata */}
                  <div className="flex flex-wrap items-center gap-2">
                    {task.priority && task.priority !== 'medium' && (
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                    )}
                    
                    {task.scheduledDate && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(task.scheduledDate)}
                      </Badge>
                    )}
                    
                    {task.scheduledTime && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(task.scheduledTime)}
                      </Badge>
                    )}

                    {depth === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {categoryName}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSubtask(true);
                  }}
                  className="h-8 w-8 p-0"
                  title="Add subtask"
                >
                  <Plus size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash size={14} />
                </Button>
              </div>
            )}
          </div>
          
          {/* Add Subtask Input */}
          {showAddSubtask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 ml-8"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="Add subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={handleSubtaskKeyDown}
                  autoFocus
                  className="flex-1 text-sm"
                />
                <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
                  <Plus size={14} />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddSubtask(false);
                    setNewSubtaskTitle('');
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            </motion.div>
          )}
          
          {task.completed && task.completedAt && (
            <div className="mt-2 text-xs text-muted-foreground ml-8">
              Completed {new Date(task.completedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </Card>

      {/* Subtasks */}
      <AnimatePresence>
        {isExpanded && hasSubtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2"
          >
            {subtasks.map(subtask => (
              <TaskItem
                key={subtask.id}
                task={subtask}
                allTasks={allTasks}
                categoryName={categoryName}
                onToggleComplete={onToggleComplete}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddSubtask={onAddSubtask}
                showTimeScheduling={showTimeScheduling}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}