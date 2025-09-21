import React, { useState } from 'react';
import { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash, Check, X, Plus, Clock, Calendar, CaretRight, CaretDown, Dot } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  allTasks: Task[];
  categoryName: string;
  categoryColor: string;
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
  categoryColor, 
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
      case 'high': return { bg: '#EF444420', color: '#EF4444', border: '#EF444450' };
      case 'medium': return { bg: `${categoryColor}20`, color: categoryColor, border: `${categoryColor}50` };
      case 'low': return { bg: '#10B98120', color: '#10B981', border: '#10B98150' };
      default: return { bg: '#6B728020', color: '#6B7280', border: '#6B728050' };
    }
  };

  return (
    <div className="flex items-start gap-3">
      {/* Subtask indicator dots */}
      {depth > 0 && (
        <div className="flex items-center gap-1.5 pt-2 flex-shrink-0 ml-2">
          {Array.from({ length: depth }, (_, index) => (
            <div
              key={index}
              className="w-3.5 h-3.5 rounded-full border-2 border-current"
              style={{ 
                backgroundColor: `${categoryColor}25`,
                borderColor: `${categoryColor}70`
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
        className={`flex-1 ${depth > 0 ? 'ml-2' : ''}`}
        style={{ marginLeft: depth > 0 ? `${depth * 8}px` : '0' }}
      >
      <Card 
        className={`transition-all duration-200 group ${
          task.completed ? 'bg-muted/30' : 'bg-card hover:shadow-md'
        } ${depth > 0 ? 'border-l-2' : 'border-l-4'}`}
        style={{
          background: task.completed 
            ? undefined 
            : `linear-gradient(90deg, ${categoryColor}08 0%, ${categoryColor}02 40%, transparent 100%)`,
          borderLeft: `${depth > 0 ? '3px' : '4px'} solid ${task.completed ? '#94A3B8' : categoryColor}60`
        }}
      >
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

            <div 
              className="flex items-center justify-center w-5 h-5 rounded border-2 transition-all cursor-pointer hover:scale-105"
              style={{ 
                borderColor: task.completed ? categoryColor : '#94A3B8',
                backgroundColor: task.completed ? categoryColor : 'transparent'
              }}
              onClick={() => onToggleComplete(task.id)}
            >
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
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
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      style={{
                        backgroundColor: categoryColor,
                        borderColor: categoryColor,
                        color: 'white'
                      }}
                    >
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
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{
                          backgroundColor: getPriorityColor(task.priority).bg,
                          color: getPriorityColor(task.priority).color,
                          borderColor: getPriorityColor(task.priority).border
                        }}
                      >
                        {task.priority}
                      </Badge>
                    )}
                    
                    {task.scheduledDate && (
                      <Badge 
                        variant="outline" 
                        className="text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: `${categoryColor}12`,
                          borderColor: `${categoryColor}40`,
                          color: categoryColor
                        }}
                      >
                        <Calendar size={12} />
                        {formatDate(task.scheduledDate)}
                      </Badge>
                    )}
                    
                    {task.scheduledTime && (
                      <Badge 
                        variant="outline" 
                        className="text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: `${categoryColor}12`,
                          borderColor: `${categoryColor}40`,
                          color: categoryColor
                        }}
                      >
                        <Clock size={12} />
                        {formatTime(task.scheduledTime)}
                      </Badge>
                    )}

                    {depth === 0 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                          borderColor: `${categoryColor}40`
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
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
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
                  title="Edit task"
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
                  title="Delete task"
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
                <Button 
                  size="sm" 
                  onClick={handleAddSubtask} 
                  disabled={!newSubtaskTitle.trim()}
                  style={{
                    backgroundColor: categoryColor,
                    borderColor: categoryColor,
                    color: 'white'
                  }}
                >
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
                categoryColor={categoryColor}
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
    </div>
  );
}