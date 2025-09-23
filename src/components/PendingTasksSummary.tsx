import React, { useState } from 'react';
import { Task, Category } from '@/types/index';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, ArrowRight, Check, X, CaretDown, CaretRight, CalendarBlank, Repeat } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PendingTasksSummaryProps {
  tasks: Task[];
  categories: Category[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

export const PendingTasksSummary: React.FC<PendingTasksSummaryProps> = ({
  tasks,
  categories,
  onSelectDate,
  selectedDate,
  onUpdateTask
}) => {
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandAllMode, setExpandAllMode] = useState(false);
  const [rescheduleTask, setRescheduleTask] = useState<Task | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [bulkRescheduleDate, setBulkRescheduleDate] = useState<string | null>(null);
  const [bulkRescheduleTargetDate, setBulkRescheduleTargetDate] = useState('');
  const [bulkRescheduleTime, setBulkRescheduleTime] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Get all overdue tasks (scheduled for dates before today and not completed)
  const overdueTasks = tasks.filter(task => 
    task.scheduledDate && 
    task.scheduledDate < today && 
    !task.completed
  );

  // Group overdue tasks by date
  const overdueByDate = overdueTasks.reduce((acc, task) => {
    if (task.scheduledDate) {
      if (!acc[task.scheduledDate]) {
        acc[task.scheduledDate] = [];
      }
      acc[task.scheduledDate].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedOverdueDates = Object.keys(overdueByDate).sort((a, b) => b.localeCompare(a));

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getDateLabel = (date: string) => {
    const taskDate = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const daysBefore = Math.floor((yesterday.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (date === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else if (daysBefore > 0) {
      return `${daysBefore} days ago`;
    }

    return taskDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAllMode) {
      setExpandedDates(new Set());
      setExpandAllMode(false);
    } else {
      setExpandedDates(new Set(sortedOverdueDates));
      setExpandAllMode(true);
    }
  };

  const handleRescheduleTask = (task: Task) => {
    setRescheduleTask(task);
    setRescheduleDate(task.scheduledDate || today);
    setRescheduleTime(task.scheduledTime || '');
  };

  const handleRescheduleSubmit = () => {
    if (rescheduleTask && onUpdateTask && rescheduleDate) {
      onUpdateTask(rescheduleTask.id, {
        scheduledDate: rescheduleDate,
        scheduledTime: rescheduleTime || undefined
      });
      
      toast.success(`Task rescheduled to ${new Date(rescheduleDate).toLocaleDateString()}`);
      setRescheduleTask(null);
      setRescheduleDate('');
      setRescheduleTime('');
    }
  };

  const handleBulkReschedule = (date: string) => {
    setBulkRescheduleDate(date);
    setBulkRescheduleTargetDate(today);
    setBulkRescheduleTime('');
  };

  const handleBulkRescheduleSubmit = () => {
    if (bulkRescheduleDate && onUpdateTask && bulkRescheduleTargetDate) {
      const tasksToReschedule = overdueByDate[bulkRescheduleDate];
      
      tasksToReschedule.forEach(task => {
        onUpdateTask(task.id, {
          scheduledDate: bulkRescheduleTargetDate,
          scheduledTime: bulkRescheduleTime || task.scheduledTime
        });
      });
      
      toast.success(`${tasksToReschedule.length} tasks rescheduled to ${new Date(bulkRescheduleTargetDate).toLocaleDateString()}`);
      setBulkRescheduleDate(null);
      setBulkRescheduleTargetDate('');
      setBulkRescheduleTime('');
    }
  };

  const getQuickRescheduleOptions = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return [
      { label: 'Today', value: today },
      { label: 'Tomorrow', value: tomorrow.toISOString().split('T')[0] },
      { label: 'Next Week', value: nextWeek.toISOString().split('T')[0] },
      { label: 'Next Month', value: nextMonth.toISOString().split('T')[0] }
    ];
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
                  Manage Overdue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Overdue Tasks Management</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {overdueTasks.length} tasks
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleExpandAll}
                        className="text-xs"
                      >
                        {expandAllMode ? 'Collapse All' : 'Expand All'}
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[65vh]">
                  <div className="space-y-3">
                    {sortedOverdueDates.map((date) => {
                      const tasksForDate = overdueByDate[date];
                      const isExpanded = expandedDates.has(date) || expandAllMode;
                      
                      return (
                        <Card key={date} className="border-l-4" style={{ borderLeftColor: '#F97316' }}>
                          <CardHeader 
                            className="pb-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                            onClick={() => toggleDateExpansion(date)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <CaretDown size={16} className="text-muted-foreground" />
                                ) : (
                                  <CaretRight size={16} className="text-muted-foreground" />
                                )}
                                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-800">
                                  <Calendar size={14} className="text-orange-700 dark:text-orange-300" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">
                                    {getDateLabel(date)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {tasksForDate.length} {tasksForDate.length === 1 ? 'task' : 'tasks'}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBulkReschedule(date);
                                    }}
                                    className="text-xs gap-1"
                                  >
                                    <Repeat size={12} />
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
                                    className="text-xs gap-1"
                                  >
                                    <CalendarBlank size={12} />
                                    View Day
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          {/* Expanded Tasks List */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CardContent className="pt-0 space-y-2">
                                  <Separator />
                                  {tasksForDate.map((task, index) => {
                                    const category = getCategoryById(task.categoryId);

                                    return (
                                      <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                      >
                                        <div
                                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                                          style={{ backgroundColor: category?.color || '#6B7280' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm mb-1">
                                            {task.title}
                                          </div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs">
                                              {category?.name || 'Unknown'}
                                            </Badge>
                                            {task.scheduledTime && (
                                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock size={12} />
                                                {task.scheduledTime}
                                              </div>
                                            )}
                                            {task.priority && (
                                              <Badge variant="outline" className="text-xs">
                                                {task.priority}
                                              </Badge>
                                            )}
                                          </div>
                                          {task.description && (
                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                              {task.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRescheduleTask(task)}
                                            className="text-xs gap-1 h-7"
                                          >
                                            <ArrowRight size={10} />
                                            Reschedule
                                          </Button>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </CardContent>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Individual Task Reschedule Dialog */}
      <Dialog open={!!rescheduleTask} onOpenChange={() => setRescheduleTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Task</DialogTitle>
          </DialogHeader>
          {rescheduleTask && (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <h4 className="font-medium text-sm mb-1">{rescheduleTask.title}</h4>
                <p className="text-xs text-muted-foreground">
                  Currently scheduled for {rescheduleTask.scheduledDate}
                  {rescheduleTask.scheduledTime && ` at ${rescheduleTask.scheduledTime}`}
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
                      min={today}
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-1 block">Time (Optional)</Label>
                    <Input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleRescheduleSubmit}
                  disabled={!rescheduleDate}
                  className="flex-1"
                >
                  <Check size={14} className="mr-1" />
                  Reschedule
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setRescheduleTask(null)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
};