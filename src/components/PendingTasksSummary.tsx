import React, { useState, useEffect, useMemo } from 'react';
import { Task, Category } from '@/types/index';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Check, X, CaretUp, CaretDown, CalendarBlank, ArrowsClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PendingTasksSummaryProps {
  tasks: Task[];
  categories: Category[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function PendingTasksSummary({
  tasks,
  categories,
  selectedDate,
  onSelectDate,
  onUpdateTask
}: PendingTasksSummaryProps) {
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [bulkRescheduleDate, setBulkRescheduleDate] = useState<string | null>(null);
  const [bulkRescheduleTargetDate, setBulkRescheduleTargetDate] = useState('');
  const [bulkRescheduleTime, setBulkRescheduleTime] = useState('');
  const [individualReschedule, setIndividualReschedule] = useState<{taskId: string, currentDate: string} | null>(null);
  const [individualTargetDate, setIndividualTargetDate] = useState('');
  const [individualTargetTime, setIndividualTargetTime] = useState('');
  const [showBulkRescheduleAll, setShowBulkRescheduleAll] = useState(false);
  const [bulkAllTargetDate, setBulkAllTargetDate] = useState('');
  const [bulkAllTargetTime, setBulkAllTargetTime] = useState('');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Get overdue tasks (scheduled for before today and not completed)
  const overdueTasks = useMemo(() => 
    tasks.filter(task => 
      task.scheduledDate && 
      task.scheduledDate < today && 
      !task.completed
    ), [tasks, today]
  );

  // Group overdue tasks by date
  const overdueByDate: Record<string, Task[]> = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    overdueTasks.forEach(task => {
      if (task.scheduledDate) {
        if (!grouped[task.scheduledDate]) {
          grouped[task.scheduledDate] = [];
        }
        grouped[task.scheduledDate].push(task);
      }
    });
    return grouped;
  }, [overdueTasks]);

  const sortedOverdueDates = useMemo(() => 
    Object.keys(overdueByDate).sort((a, b) => b.localeCompare(a)), 
    [overdueByDate]
  );

  // When dialog opens, expand all dates by default
  useEffect(() => {
    if (showPendingDialog) {
      const dates = Object.keys(overdueByDate).sort((a, b) => b.localeCompare(a));
      setExpandedDates(new Set(dates));
    }
  }, [showPendingDialog]); // Remove sortedOverdueDates dependency to prevent infinite loop

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getDateLabel = (date: string) => {
    const taskDate = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }
    
    const daysDiff = Math.floor((new Date(today).getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) {
      return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago`;
    }
    
    return taskDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const getQuickRescheduleOptions = () => [
    { label: 'Today', value: today },
    { label: 'Tomorrow', value: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { label: 'Next Week', value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
  ];

  const handleBulkRescheduleSubmit = () => {
    if (!bulkRescheduleDate || !bulkRescheduleTargetDate) return;

    const tasksToUpdate = overdueByDate[bulkRescheduleDate];
    
    tasksToUpdate.forEach(task => {
      const updates: Partial<Task> = {
        scheduledDate: bulkRescheduleTargetDate
      };
      
      if (bulkRescheduleTime) {
        updates.scheduledTime = bulkRescheduleTime;
      }
      
      onUpdateTask(task.id, updates);
    });

    toast.success(`${tasksToUpdate.length} tasks rescheduled to ${getDateLabel(bulkRescheduleTargetDate)}`);
    
    setBulkRescheduleDate(null);
    setBulkRescheduleTargetDate('');
    setBulkRescheduleTime('');
  };

  const handleBulkRescheduleAllSubmit = () => {
    if (!bulkAllTargetDate) return;

    let totalRescheduled = 0;
    
    Object.values(overdueByDate).forEach(tasksForDate => {
      tasksForDate.forEach(task => {
        const updates: Partial<Task> = {
          scheduledDate: bulkAllTargetDate
        };
        
        if (bulkAllTargetTime) {
          updates.scheduledTime = bulkAllTargetTime;
        }
        
        onUpdateTask(task.id, updates);
        totalRescheduled++;
      });
    });

    toast.success(`All ${totalRescheduled} overdue tasks rescheduled to ${getDateLabel(bulkAllTargetDate)}`);
    
    setShowBulkRescheduleAll(false);
    setBulkAllTargetDate('');
    setBulkAllTargetTime('');
    setShowPendingDialog(false);
  };

  const handleIndividualRescheduleSubmit = () => {
    if (!individualReschedule || !individualTargetDate) return;

    const updates: Partial<Task> = {
      scheduledDate: individualTargetDate
    };
    
    if (individualTargetTime) {
      updates.scheduledTime = individualTargetTime;
    }
    
    onUpdateTask(individualReschedule.taskId, updates);

    const task = tasks.find(t => t.id === individualReschedule.taskId);
    toast.success(`"${task?.title}" rescheduled to ${getDateLabel(individualTargetDate)}`);
    
    setIndividualReschedule(null);
    setIndividualTargetDate('');
    setIndividualTargetTime('');
  };

  if (overdueTasks.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-orange-100 dark:bg-orange-800 flex-shrink-0">
                <Calendar size={14} sm-size={16} className="text-orange-700 dark:text-orange-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm sm:text-base text-orange-700 dark:text-orange-300">
                  {overdueTasks.length} Overdue Tasks
                </div>
                <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                  From {sortedOverdueDates.length} different days
                </div>
              </div>
            </div>
            <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-800 text-xs sm:text-sm w-full sm:w-auto"
                >
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] mx-2 sm:mx-auto">
                <DialogHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <DialogTitle className="text-lg sm:text-xl">All Overdue Tasks</DialogTitle>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedDates(new Set(sortedOverdueDates))}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        Expand All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedDates(new Set())}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        Collapse All
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setShowBulkRescheduleAll(true)}
                        className="text-xs flex-1 sm:flex-none"
                      >
                        <ArrowsClockwise size={14} className="mr-1" />
                        Reschedule All
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                <ScrollArea className="h-[70vh] sm:h-[75vh] pr-2 sm:pr-4">
                  <div className="space-y-4">
                    {sortedOverdueDates.map((date) => {
                      const tasksForDate = overdueByDate[date];
                      const isExpanded = expandedDates.has(date);
                      
                      return (
                        <motion.div
                          key={date}
                          layout
                          className="border border-border rounded-lg overflow-hidden"
                        >
                          {/* Date Header */}
                          <div 
                            className="flex items-center justify-between p-4 bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors"
                            onClick={() => toggleDateExpansion(date)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-800">
                                <Calendar size={14} className="text-orange-700 dark:text-orange-300" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {getDateLabel(date)} ({new Date(date).toLocaleDateString()})
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {tasksForDate.length} {tasksForDate.length === 1 ? 'task' : 'tasks'} pending
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {tasksForDate.length}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBulkRescheduleDate(date);
                                }}
                                className="text-xs"
                              >
                                <ArrowsClockwise size={12} className="mr-1" />
                                Reschedule Day
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectDate(date);
                                  setShowPendingDialog(false);
                                }}
                                className="text-xs"
                              >
                                View Day
                              </Button>
                              {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                            </div>
                          </div>
                          
                          {/* Tasks List */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-border"
                              >
                                <div className="p-4 space-y-3">
                                  {tasksForDate.map((task) => {
                                    const category = getCategoryById(task.categoryId);
                                    
                                    return (
                                      <div
                                        key={task.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors"
                                      >
                                        <div
                                          className="w-3 h-3 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: category?.color || '#6B7280' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm mb-1 line-clamp-2">
                                            {task.title}
                                          </div>
                                          {task.description && (
                                            <div className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                              {task.description}
                                            </div>
                                          )}
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                              {category?.name || 'Unknown'}
                                            </Badge>
                                            {task.scheduledTime && (
                                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock size={12} />
                                                {task.scheduledTime}
                                              </div>
                                            )}
                                            {task.priority && task.priority !== 'medium' && (
                                              <Badge 
                                                variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                                                className="text-xs"
                                              >
                                                {task.priority}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIndividualReschedule({ taskId: task.id, currentDate: date })}
                                            className="text-xs h-7 px-2"
                                          >
                                            <CalendarBlank size={12} className="mr-1" />
                                            Reschedule
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Reschedule All Tasks Dialog */}
      <Dialog open={showBulkRescheduleAll} onOpenChange={setShowBulkRescheduleAll}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule All Overdue Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-sm mb-1 text-orange-700 dark:text-orange-300">
                All Overdue Tasks
              </h4>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {overdueTasks.length} tasks from {sortedOverdueDates.length} days will be rescheduled
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm mb-2 block">Quick Options</Label>
                <div className="grid grid-cols-2 gap-2">
                  {getQuickRescheduleOptions().map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkAllTargetDate(option.value);
                        if (option.label === 'Today') {
                          setBulkAllTargetTime('');
                        }
                      }}
                      className={`text-xs ${bulkAllTargetDate === option.value ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-1 block">New Date</Label>
                  <Input
                    type="date"
                    value={bulkAllTargetDate}
                    onChange={(e) => setBulkAllTargetDate(e.target.value)}
                    min={today}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Time (Optional)</Label>
                  <Input
                    type="time"
                    value={bulkAllTargetTime}
                    onChange={(e) => setBulkAllTargetTime(e.target.value)}
                    placeholder="Keep original"
                  />
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {bulkAllTargetTime 
                  ? 'All tasks will be set to the specified time'
                  : 'Tasks will keep their original times'
                }
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleBulkRescheduleAllSubmit}
                disabled={!bulkAllTargetDate}
                className="flex-1"
              >
                <Check size={14} className="mr-1" />
                Reschedule All {overdueTasks.length} Tasks
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBulkRescheduleAll(false)}
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Task Reschedule Dialog */}
      <Dialog open={!!individualReschedule} onOpenChange={() => setIndividualReschedule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Task</DialogTitle>
          </DialogHeader>
          {individualReschedule && (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <h4 className="font-medium text-sm mb-1">
                  {tasks.find(t => t.id === individualReschedule.taskId)?.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Currently scheduled for {getDateLabel(individualReschedule.currentDate)}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm mb-2 block">Quick Options</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {getQuickRescheduleOptions().map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIndividualTargetDate(option.value);
                          if (option.label === 'Today') {
                            setIndividualTargetTime('');
                          }
                        }}
                        className={`text-xs ${individualTargetDate === option.value ? 'bg-primary text-primary-foreground' : ''}`}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-1 block">New Date</Label>
                    <Input
                      type="date"
                      value={individualTargetDate}
                      onChange={(e) => setIndividualTargetDate(e.target.value)}
                      min={today}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Time (Optional)</Label>
                    <Input
                      type="time"
                      value={individualTargetTime}
                      onChange={(e) => setIndividualTargetTime(e.target.value)}
                      placeholder="Keep original"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleIndividualRescheduleSubmit}
                  disabled={!individualTargetDate}
                  className="flex-1"
                >
                  <Check size={14} className="mr-1" />
                  Reschedule Task
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIndividualReschedule(null)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Reschedule Day Dialog */}
      <Dialog open={!!bulkRescheduleDate} onOpenChange={() => setBulkRescheduleDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Day's Tasks</DialogTitle>
          </DialogHeader>
          {bulkRescheduleDate && (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <h4 className="font-medium text-sm mb-1">
                  {getDateLabel(bulkRescheduleDate)}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {overdueByDate[bulkRescheduleDate].length} tasks will be rescheduled
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm mb-2 block">Quick Options</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {getQuickRescheduleOptions().map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBulkRescheduleTargetDate(option.value);
                          if (option.label === 'Today') {
                            setBulkRescheduleTime('');
                          }
                        }}
                        className={`text-xs ${bulkRescheduleTargetDate === option.value ? 'bg-primary text-primary-foreground' : ''}`}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm mb-1 block">New Date</Label>
                    <Input
                      type="date"
                      value={bulkRescheduleTargetDate}
                      onChange={(e) => setBulkRescheduleTargetDate(e.target.value)}
                      min={today}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Time (Optional)</Label>
                    <Input
                      type="time"
                      value={bulkRescheduleTime}
                      onChange={(e) => setBulkRescheduleTime(e.target.value)}
                      placeholder="Keep original"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {bulkRescheduleTime 
                    ? 'All tasks will be set to the specified time'
                    : 'Tasks will keep their original times'
                  }
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkRescheduleSubmit}
                  disabled={!bulkRescheduleTargetDate}
                  className="flex-1"
                >
                  <Check size={14} className="mr-1" />
                  Reschedule {overdueByDate[bulkRescheduleDate].length} Tasks
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBulkRescheduleDate(null)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}