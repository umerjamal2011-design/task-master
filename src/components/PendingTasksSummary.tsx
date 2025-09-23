import React, { useState } from 'react';
import { Task, Category } from '@/types/index';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Check, X } from '@phosphor-icons/react';
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
  const [selectedPendingDate, setSelectedPendingDate] = useState<string | null>(null);
  const [bulkRescheduleDate, setBulkRescheduleDate] = useState<string | null>(null);
  const [bulkRescheduleTargetDate, setBulkRescheduleTargetDate] = useState('');
  const [bulkRescheduleTime, setBulkRescheduleTime] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Get overdue tasks (scheduled for before today and not completed)
  const overdueTasks = tasks.filter(task => 
    task.scheduledDate && 
    task.scheduledDate < today && 
    !task.completed
  );

  // Group overdue tasks by date
  const overdueByDate: Record<string, Task[]> = {};
  overdueTasks.forEach(task => {
    if (task.scheduledDate) {
      if (!overdueByDate[task.scheduledDate]) {
        overdueByDate[task.scheduledDate] = [];
      }
      overdueByDate[task.scheduledDate].push(task);
    }
  });

  const sortedOverdueDates = Object.keys(overdueByDate).sort((a, b) => b.localeCompare(a));

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
    setShowPendingDialog(false);
  };

  if (overdueTasks.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-800">
                <Calendar size={16} className="text-orange-700 dark:text-orange-300" />
              </div>
              <div>
                <div className="font-semibold text-orange-700 dark:text-orange-300">
                  {overdueTasks.length} Overdue Tasks
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  From {sortedOverdueDates.length} different days
                </div>
              </div>
            </div>
            <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-800">
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Overdue Tasks</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                    {sortedOverdueDates.map((date) => {
                      const tasksForDate = overdueByDate[date];
                      const isSelectedDate = selectedPendingDate === date;
                      
                      return (
                        <motion.div
                          key={date}
                          layout
                          className="border border-border rounded-lg p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                          onClick={() => {
                            setSelectedPendingDate(isSelectedDate ? null : date);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-800">
                                <Calendar size={14} className="text-orange-700 dark:text-orange-300" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {getDateLabel(date)}
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
                                Reschedule
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
                            </div>
                          </div>
                          
                          {/* Tasks Preview */}
                          <AnimatePresence>
                            {isSelectedDate && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 border-t border-border pt-3 mt-3"
                              >
                                {tasksForDate.slice(0, 5).map((task) => {
                                  const category = getCategoryById(task.categoryId);
                                  
                                  return (
                                    <div
                                      key={task.id}
                                      className="flex items-start gap-3 p-2 rounded bg-secondary/30"
                                    >
                                      <div
                                        className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                                        style={{ backgroundColor: category?.color || '#6B7280' }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">
                                          {task.title}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {category?.name || 'Unknown'}
                                          </Badge>
                                          {task.scheduledTime && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Clock size={12} />
                                              {task.scheduledTime}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {tasksForDate.length > 5 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectDate(date);
                                      setShowPendingDialog(false);
                                    }}
                                    className="w-full text-xs text-muted-foreground"
                                  >
                                    View all {tasksForDate.length} tasks for this day
                                  </Button>
                                )}
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

      {/* Bulk Reschedule Dialog */}
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