import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scro
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock } from '@phosphor-icons/react';
interface PendingTasksSummaryProp
import { Task, Category } from '@/types/index';
  onSelectDate: (date: string) => void;


  tasks: Task[];
  categories,
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const PendingTasksSummary: React.FC<PendingTasksSummaryProps> = ({
  // Get
  categories,
  onSelectDate,
  selectedDate

  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [selectedPendingDate, setSelectedPendingDate] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  
  // Get all overdue tasks (scheduled for dates before today and not completed)
  const overdueTasks = tasks.filter(task => 
    task.scheduledDate && 
    task.scheduledDate < today && 
                  {
    

            </div>
    return null;
   

                <DialogHeader>
                </DialogHeader>
                  <div className="spa
                     
                     
    }
                         
               
                          }}

                              <div 
                              </div>

                                </div>

  return (
      
                          
                              <Button
        <CardContent className="pt-4 pb-4">
                                  e.stopPropagation();
                                  setShowPendingDialo
                                className="text-xs"
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
                                  onSelectDate(date);
                                  setShowPendingDialog(false);
                                }}
                                className="text-xs"
                              >
                    })}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Tasks Preview */}
  );
                            {isSelectedDate && (

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

                                        className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                                        style={{ backgroundColor: category?.color || '#6B7280' }}
                                      />

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

                                          )}
                                        </div>
                                      </div>

                                  );

                                {tasksForDate.length > 5 && (

                                    variant="ghost"

                                    onClick={(e) => {

                                      onSelectDate(date);
                                      setShowPendingDialog(false);
                                    }}
                                    className="w-full text-xs text-muted-foreground"
                                  >
                                    View all {tasksForDate.length} tasks for this day
                                  </Button>

                              </motion.div>

                          </AnimatePresence>

                      );

                  </div>

              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>


