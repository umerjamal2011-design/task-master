import React from 'react';
import { Task, Category } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskItem } from '@/components/TaskItem';
import { CheckCircle, Clock, Calendar, Sun } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { getTasksForDate } from '@/lib/repeat-utils';
import { getThreeDayRange, formatDateForSection } from '@/lib/date-utils';

interface DailyViewProps {
  tasks: Task[];
  categories: Category[];
  selectedDate: string;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onAddTaskAtSameLevel: (referenceTaskId: string, title: string) => void;
  currentTime?: Date;
}

interface DaySectionProps {
  dateStr: string;
  title: string;
  tasks: Task[];
  allTasks: Task[];
  categories: Category[];
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onAddTaskAtSameLevel: (referenceTaskId: string, title: string) => void;
  currentTime: Date;
  isCurrentDay?: boolean;
}

function DaySection({
  dateStr,
  title,
  tasks,
  allTasks,
  categories,
  onToggleTaskComplete,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onAddTaskAtSameLevel,
  currentTime,
  isCurrentDay = false
}: DaySectionProps) {
  // Separate timed and untimed tasks
  const timedTasks = tasks
    .filter(task => task.scheduledTime)
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

  const untimedTasks = tasks.filter(task => !task.scheduledTime);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'General';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
  };

  // Helper function to calculate task depth for proper indentation in daily view
  const calculateTaskDepth = (task: Task, allTasks: Task[]): number => {
    if (!task.parentId) return 0;
    
    const parent = allTasks.find(t => t.id === task.parentId);
    if (!parent) return 0;
    
    return calculateTaskDepth(parent, allTasks) + 1;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  const cardVariant = isCurrentDay 
    ? 'bg-primary/5 border-primary/30 shadow-lg' 
    : 'bg-card border-border';

  const titleColor = isCurrentDay ? 'text-primary' : 'text-foreground';

  if (totalCount === 0) {
    return (
      <Card className={`${cardVariant} transition-all duration-200`}>
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCurrentDay && <Sun size={18} className="text-primary" />}
              <h3 className={`font-semibold text-base sm:text-lg ${titleColor}`}>{title}</h3>
              <Badge variant="outline" className="text-xs">
                {totalCount}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-6 px-3 sm:px-6">
          <div className="text-center">
            <Calendar size={28} className="mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No tasks scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${cardVariant} transition-all duration-200`}>
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            {isCurrentDay && <Sun size={18} className="text-primary flex-shrink-0" />}
            <h3 className={`font-semibold text-base sm:text-lg ${titleColor} truncate`}>{title}</h3>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {totalCount}
            </Badge>
          </div>
          {totalCount > 0 && (
            <div className="flex items-center gap-2 ml-6 sm:ml-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {completedCount}/{totalCount}
              </span>
              <div className="w-12 sm:w-16 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isCurrentDay ? 'bg-primary' : 'bg-accent'}`}
                  initial={{ width: 0 }}
                  animate={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-3 sm:px-6">
        {/* Timed Tasks */}
        {timedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className={isCurrentDay ? 'text-primary' : 'text-secondary-foreground'} />
              <h4 className="text-sm font-medium text-muted-foreground">Scheduled</h4>
              <Badge variant="secondary" className="text-xs">
                {timedTasks.length}
              </Badge>
            </div>
            <div className="space-y-1">
              {timedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-start gap-2 sm:gap-3 p-2 rounded-lg border transition-all duration-200 ${
                    task.completed 
                      ? 'bg-muted/50 border-muted/60 opacity-75' 
                      : 'bg-background/50 border-border/50'
                  }`}
                >
                  {/* Mobile optimized time display */}
                  <div className="flex flex-col items-center min-w-[60px] sm:min-w-[70px] pt-0.5">
                    <div className={`text-xs sm:text-sm font-bold px-1.5 sm:px-2 py-1 rounded-md transition-all duration-200 text-center ${
                      task.completed
                        ? 'text-muted-foreground bg-muted/30 line-through'
                        : isCurrentDay
                          ? 'text-primary bg-primary/10'
                          : 'text-accent bg-accent/10'
                    }`}>
                      {task.completed && <span className="mr-1 no-underline">✓</span>}
                      {formatTime(task.scheduledTime!)}
                    </div>
                    <div className={`w-0.5 h-3 sm:h-4 mt-1 rounded-full transition-all duration-200 ${
                      task.completed 
                        ? 'bg-muted/60' 
                        : isCurrentDay 
                          ? 'bg-primary/60' 
                          : 'bg-accent/60'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <TaskItem
                      task={task}
                      allTasks={allTasks}
                      categoryName={getCategoryName(task.categoryId)}
                      categoryColor={getCategoryColor(task.categoryId)}
                      onToggleComplete={onToggleTaskComplete}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      onAddSubtask={onAddSubtask}
                      onAddTaskAtSameLevel={onAddTaskAtSameLevel}
                      showTimeScheduling={false}
                      depth={calculateTaskDepth(task, allTasks)}
                      isDailyView={true}
                      currentTime={currentTime}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Untimed Tasks */}
        {untimedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-muted-foreground" />
              <h4 className="text-sm font-medium text-muted-foreground">Anytime</h4>
              <Badge variant="outline" className="text-xs">
                {untimedTasks.length}
              </Badge>
            </div>
            <div className="space-y-1">
              {untimedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (timedTasks.length + index) * 0.03 }}
                  className="p-1"
                >
                  <TaskItem
                    task={task}
                    allTasks={allTasks}
                    categoryName={getCategoryName(task.categoryId)}
                    categoryColor={getCategoryColor(task.categoryId)}
                    onToggleComplete={onToggleTaskComplete}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onAddSubtask={onAddSubtask}
                    onAddTaskAtSameLevel={onAddTaskAtSameLevel}
                    showTimeScheduling={true}
                    depth={calculateTaskDepth(task, allTasks)}
                    isDailyView={true}
                    currentTime={currentTime}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DailyView({
  tasks,
  categories,
  selectedDate,
  onToggleTaskComplete,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onAddTaskAtSameLevel,
  currentTime = new Date()
}: DailyViewProps) {
  // Get the three day range based on selected date
  const { yesterday, today, tomorrow } = getThreeDayRange(selectedDate);
  const currentDateStr = new Date().toISOString().split('T')[0];

  // Get tasks for each day
  const yesterdayTasks = getTasksForDate(tasks, yesterday);
  const todayTasks = getTasksForDate(tasks, today);
  const tomorrowTasks = getTasksForDate(tasks, tomorrow);

  // Debug logging
  React.useEffect(() => {
    console.log('=== Three-Day Daily View Debug ===');
    console.log('Selected date:', selectedDate);
    console.log('Date range:', { yesterday, today, tomorrow });
    console.log('Current date:', currentDateStr);
    console.log('Yesterday tasks:', yesterdayTasks.length);
    console.log('Today tasks:', todayTasks.length);
    console.log('Tomorrow tasks:', tomorrowTasks.length);
  }, [selectedDate, yesterday, today, tomorrow, yesterdayTasks, todayTasks, tomorrowTasks]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Daily Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="hidden sm:inline">Three-day view centered on </span>
            {formatDateForSection(selectedDate, currentTime)}
          </p>
        </div>
      </div>

      {/* Three Day Sections - Mobile optimized spacing */}
      <div className="space-y-4 sm:space-y-6">
        {/* Yesterday Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DaySection
            dateStr={yesterday}
            title={formatDateForSection(yesterday, currentTime)}
            tasks={yesterdayTasks}
            allTasks={tasks}
            categories={categories}
            onToggleTaskComplete={onToggleTaskComplete}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onAddSubtask={onAddSubtask}
            onAddTaskAtSameLevel={onAddTaskAtSameLevel}
            currentTime={currentTime}
            isCurrentDay={false}
          />
        </motion.div>

        {/* Today Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DaySection
            dateStr={today}
            title={formatDateForSection(today, currentTime)}
            tasks={todayTasks}
            allTasks={tasks}
            categories={categories}
            onToggleTaskComplete={onToggleTaskComplete}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onAddSubtask={onAddSubtask}
            onAddTaskAtSameLevel={onAddTaskAtSameLevel}
            currentTime={currentTime}
            isCurrentDay={today === currentDateStr}
          />
        </motion.div>

        {/* Tomorrow Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DaySection
            dateStr={tomorrow}
            title={formatDateForSection(tomorrow, currentTime)}
            tasks={tomorrowTasks}
            allTasks={tasks}
            categories={categories}
            onToggleTaskComplete={onToggleTaskComplete}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onAddSubtask={onAddSubtask}
            onAddTaskAtSameLevel={onAddTaskAtSameLevel}
            currentTime={currentTime}
            isCurrentDay={false}
          />
        </motion.div>
      </div>

      {/* Overall Summary - Mobile optimized */}
      {(yesterdayTasks.length > 0 || todayTasks.length > 0 || tomorrowTasks.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-secondary/30 border-secondary/40">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="font-medium text-foreground">Three-Day Summary</h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs sm:text-sm">Yesterday:</span>
                    <Badge variant="outline" className="text-xs">
                      {yesterdayTasks.filter(t => t.completed).length}/{yesterdayTasks.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs sm:text-sm">Today:</span>
                    <Badge variant={today === currentDateStr ? "default" : "outline"} className="text-xs">
                      {todayTasks.filter(t => t.completed).length}/{todayTasks.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs sm:text-sm">Tomorrow:</span>
                    <Badge variant="outline" className="text-xs">
                      {tomorrowTasks.filter(t => t.completed).length}/{tomorrowTasks.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}