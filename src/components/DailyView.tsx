import React from 'react';
import { Task, Category } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskItem } from '@/components/TaskItem';
import { CheckCircle, Clock, Calendar, Sun, CaretDown, CaretRight } from '@phosphor-icons/react';
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
  const [isCollapsed, setIsCollapsed] = React.useState(!isCurrentDay); // Non-current days start collapsed
  
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
        <CardHeader className="pb-2 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              {/* Collapse/Expand Button for non-current days */}
              {!isCurrentDay && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? <CaretRight size={12} className="sm:w-3.5 sm:h-3.5" /> : <CaretDown size={12} className="sm:w-3.5 sm:h-3.5" />}
                </Button>
              )}
              {isCurrentDay && <Sun size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" />}
              <h3 className={`font-semibold text-sm sm:text-base lg:text-lg ${titleColor} truncate`}>{title}</h3>
              <Badge variant="outline" className="text-xs px-1 sm:px-1.5 py-0.5 flex-shrink-0 text-[10px] sm:text-xs">
                {totalCount}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {!isCollapsed && (
          <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
            <div className="text-center py-4 sm:py-6 lg:py-8 text-muted-foreground">
              <CheckCircle size={20} className="sm:w-6 sm:h-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">No tasks scheduled for this day</p>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className={`${cardVariant} transition-all duration-200`}>
      <CardHeader className="pb-2 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            {/* Collapse/Expand Button for non-current days */}
            {!isCurrentDay && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <CaretRight size={12} className="sm:w-3.5 sm:h-3.5" /> : <CaretDown size={12} className="sm:w-3.5 sm:h-3.5" />}
              </Button>
            )}
            {isCurrentDay && <Sun size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" />}
            <h3 className={`font-semibold text-sm sm:text-base lg:text-lg ${titleColor} truncate`}>{title}</h3>
            <Badge variant="outline" className="text-xs px-1 sm:px-1.5 py-0.5 flex-shrink-0 text-[10px] sm:text-xs">
              {totalCount}
            </Badge>
          </div>
          {totalCount > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-1 sm:ml-2">
              <div className="w-6 sm:w-8 lg:w-12 xl:w-16 h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isCurrentDay ? 'bg-primary' : 'bg-accent'}`}
                  initial={{ width: 0 }}
                  animate={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
          {/* Timed Tasks */}
          {timedTasks.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Clock size={14} className="sm:w-4 sm:h-4 text-secondary-foreground" />
                <h4 className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground">Scheduled</h4>
                <Badge variant="outline" className="text-xs px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs">
                  {timedTasks.length}
                </Badge>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {timedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-start gap-1.5 sm:gap-2 lg:gap-3 p-1.5 sm:p-2 lg:p-3 rounded-lg border transition-all duration-200 ${
                      task.completed 
                        ? 'bg-muted/50 border-muted/60 opacity-75' 
                        : 'bg-background/50 border-border/50'
                    }`}
                  >
                    {/* Mobile optimized time display */}
                    <div className="flex flex-col items-center min-w-[50px] sm:min-w-[60px] lg:min-w-[70px] pt-0.5 flex-shrink-0">
                      <div className={`text-[10px] sm:text-xs lg:text-sm font-bold px-1 sm:px-1.5 lg:px-2 py-0.5 sm:py-1 rounded-md transition-all duration-200 text-center leading-tight ${
                        task.completed
                          ? 'text-muted-foreground bg-muted/30 line-through'
                          : isCurrentDay
                            ? 'text-primary bg-primary/10'
                            : 'text-accent bg-accent/10'
                      }`}>
                        {task.completed && <span className="mr-0.5 no-underline">✓</span>}
                        {formatTime(task.scheduledTime!)}
                      </div>
                      <div className={`w-0.5 h-2 sm:h-3 lg:h-4 mt-0.5 sm:mt-1 rounded-full transition-all duration-200 ${
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
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Calendar size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
                <h4 className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground">Anytime</h4>
                <Badge variant="outline" className="text-xs px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs">
                  {untimedTasks.length}
                </Badge>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {untimedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (timedTasks.length + index) * 0.03 }}
                    className="p-0.5 sm:p-1"
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
      )}
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
  // Get the three-day range (yesterday, today, tomorrow)
  const { yesterday, today, tomorrow } = getThreeDayRange(selectedDate);
  const todayStr = new Date().toISOString().split('T')[0];

  // Get tasks for each day, including repeated instances
  const yesterdayTasks = getTasksForDate(tasks, yesterday);
  const todayTasks = getTasksForDate(tasks, today);
  const tomorrowTasks = getTasksForDate(tasks, tomorrow);

  // Create the day sections
  const sections = [
    {
      dateStr: yesterday,
      title: formatDateForSection(yesterday, currentTime),
      tasks: yesterdayTasks,
      isCurrentDay: yesterday === todayStr
    },
    {
      dateStr: today,
      title: formatDateForSection(today, currentTime),
      tasks: todayTasks,
      isCurrentDay: today === todayStr
    },
    {
      dateStr: tomorrow,
      title: formatDateForSection(tomorrow, currentTime),
      tasks: tomorrowTasks,
      isCurrentDay: tomorrow === todayStr
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {sections.map((section) => (
        <DaySection
          key={section.dateStr}
          dateStr={section.dateStr}
          title={section.title}
          tasks={section.tasks}
          allTasks={tasks}
          categories={categories}
          onToggleTaskComplete={onToggleTaskComplete}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddSubtask={onAddSubtask}
          onAddTaskAtSameLevel={onAddTaskAtSameLevel}
          currentTime={currentTime}
          isCurrentDay={section.isCurrentDay}
        />
      ))}
    </div>
  );
}