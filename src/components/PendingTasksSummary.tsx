import React, { useState } from 'react';
import { Task, Category } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Circle, CheckCircle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PendingTasksSummaryProps {
  tasks: Task[];
  categories: Category[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const PendingTasksSummary: React.FC<PendingTasksSummaryProps> = ({
  tasks,
  categories,
  onSelectDate,
  selectedDate
}) => {
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [selectedPendingDate, setSelectedPendingDate] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  
  // Get all overdue tasks (scheduled for dates before today and not completed)
  const overdueTasks = tasks.filter(task => 
    task.scheduledDate && 
    task.scheduledDate < today && 
    !task.completed
  );

  // Group overdue tasks by date
  const overdueByDate = overdueTasks.reduce((acc, task) => {
    const date = task.scheduledDate!;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort dates (most recent first)
  const sortedOverdueDates = Object.keys(overdueByDate).sort((a, b) => b.localeCompare(a));

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) return `${daysDiff} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  if (sortedOverdueDates.length === 0) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">All caught up!</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            No overdue tasks
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-2">
        {sortedOverdueDates.slice(0, 2).map((date) => {
          const tasksForDate = overdueByDate[date];
          const totalTasks = tasksForDate.length;
          
          return (
            <Card 
              key={date} 
              className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedPendingDate(date);
                setShowPendingDialog(true);
              }}
            >
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-orange-600 dark:text-orange-400" />
                    <div>
                      <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        {formatDateLabel(date)}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        {totalTasks} task{totalTasks !== 1 ? 's' : ''} pending
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300">
                    {totalTasks}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Show All Button if there are more than 2 dates */}
        {sortedOverdueDates.length > 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPendingDialog(true)}
            className="w-full text-xs h-8 border-dashed hover:bg-secondary/30"
          >
            View All Overdue ({sortedOverdueDates.length} dates)
          </Button>
        )}
      </div>

      {/* Detailed Pending Tasks Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Overdue Tasks</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              {sortedOverdueDates.map((date) => {
                const tasksForDate = overdueByDate[date];
                const isSelectedDate = selectedPendingDate === date;
                
                return (
                  <motion.div
                    key={date}
                    initial={false}
                    animate={{
                      backgroundColor: isSelectedDate 
                        ? 'var(--accent)' 
                        : 'transparent'
                    }}
                    className={cn(
                      "rounded-lg border p-3 transition-all duration-200",
                      isSelectedDate 
                        ? "border-accent/50 bg-accent/10" 
                        : "border-border hover:border-accent/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-muted-foreground" />
                        <div>
                          <h3 className="font-medium text-foreground">
                            {formatDateLabel(date)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {tasksForDate.length} task{tasksForDate.length !== 1 ? 's' : ''}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
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
                    <div className="space-y-2">
                      {tasksForDate.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-2 bg-card/50 rounded border"
                        >
                          <Circle size={16} className="text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">
                                {task.title}
                              </span>
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getCategoryColor(task.categoryId) }}
                              />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {getCategoryName(task.categoryId)}
                              </span>
                              {task.scheduledTime && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} className="text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {task.scheduledTime}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {tasksForDate.length > 3 && (
                        <div className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onSelectDate(date);
                              setShowPendingDialog(false);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            +{tasksForDate.length - 3} more tasks
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};