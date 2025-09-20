import React from 'react';
import { Task, Category } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskItem } from '@/components/TaskItem';
import { CheckCircle, Clock, Calendar, Sun } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface DailyViewProps {
  tasks: Task[];
  categories: Category[];
  selectedDate: string;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
}

export function DailyView({
  tasks,
  categories,
  selectedDate,
  onToggleTaskComplete,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask
}: DailyViewProps) {
  // Get tasks for the selected date
  const dailyTasks = tasks.filter(task => 
    task.scheduledDate === selectedDate && !task.parentId
  );

  // Separate timed and untimed tasks
  const timedTasks = dailyTasks
    .filter(task => task.scheduledTime)
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

  const untimedTasks = dailyTasks.filter(task => !task.scheduledTime);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'General';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const completedCount = dailyTasks.filter(task => task.completed).length;
  const totalCount = dailyTasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sun size={24} className="text-accent" />
            {formatDate(selectedDate)}
          </h2>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount} of {totalCount} tasks completed
            </p>
          )}
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-medium">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </span>
          </div>
        )}
      </div>

      {/* Timed Tasks */}
      {timedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              <h3 className="font-medium">Scheduled Tasks</h3>
              <Badge variant="secondary" className="text-xs">
                {timedTasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {timedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border"
              >
                <div className="flex flex-col items-center min-w-[100px] pt-1">
                  <div className="text-lg font-bold text-primary px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                    {formatTime(task.scheduledTime!)}
                  </div>
                  <div className="w-1 h-6 bg-primary/40 mt-3 rounded-full" />
                </div>
                <div className="flex-1">
                  <TaskItem
                    task={task}
                    allTasks={tasks}
                    categoryName={getCategoryName(task.categoryId)}
                    categoryColor={getCategoryColor(task.categoryId)}
                    onToggleComplete={onToggleTaskComplete}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onAddSubtask={onAddSubtask}
                    showTimeScheduling={false}
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Untimed Tasks */}
      {untimedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-secondary-foreground" />
              <h3 className="font-medium">Anytime Today</h3>
              <Badge variant="outline" className="text-xs">
                {untimedTasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {untimedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TaskItem
                  task={task}
                  allTasks={tasks}
                  categoryName={getCategoryName(task.categoryId)}
                  categoryColor={getCategoryColor(task.categoryId)}
                  onToggleComplete={onToggleTaskComplete}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                  onAddSubtask={onAddSubtask}
                  showTimeScheduling={true}
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {dailyTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Calendar size={64} className="mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No tasks scheduled</h3>
          <p className="text-muted-foreground">
            {selectedDate === new Date().toISOString().split('T')[0] 
              ? "You're all free today! Add some tasks to get organized."
              : "No tasks scheduled for this day. Use the main view to schedule tasks."
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}