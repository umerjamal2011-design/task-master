import React, { useState } from 'react';
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import { ScrollArea } from '@/components/ui/scroll-area';
  onSelectDate: (date: string) => void;
}
export const PendingTasksSummary:

  selectedDate
  tasks: Task[];

  onSelectDate: (date: string) => void;
  const overdueTasks = 
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
    return category?.name || 'Unkno
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
              </CardC
       
    

            variant="outline"
            onClick={() => setShowPendingDialog(true)}
          >
    

      {/* Detailed Pending Tasks Dialog */}
        <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogTitle>Overdue Tasks<
    

                const tasksForDate = ove
            
                  <motion.div
                    initial={false}
                      backgroundColor: isSelectedDate 
                        : 'transparen
                    className={cn(
                
                        : "border-border hover:border-accent/30"
                  >
              
                      
             
      
   

          
                        </div>
                      <div 
                          {tasksForDate.length
                        <Button
                          size="sm"
                            onSelectDate(date);
          
                  
                  
                    </div
                    {/* Tasks Preview */}
                      {tasksFo
                          key={task.id}
                        >
                
             
                              </span>
                                className="w-2 h-2 rounded-full fle
                              />
                            <div className="flex items-center gap-2 mt-1">
                         
                              {task.scheduledTime && (
                                  <span classNa
                            
                                      {task.scheduledTime}
                                  </div>
                            
                          
                      ))
                      {tasksForDate.length > 3 && (
                          <Butto
                          
                      
                            
                   
            
           
        
              })}
          </ScrollArea>
      </Dialog>
            variant="outline"

            onClick={() => setShowPendingDialog(true)}

          >





      {/* Detailed Pending Tasks Dialog */}

        <DialogContent className="max-w-2xl max-h-[80vh]">











                  <motion.div

                    initial={false}

                      backgroundColor: isSelectedDate 



                    className={cn(



                        : "border-border hover:border-accent/30"

                  >















                        </div>





                        <Button

                          size="sm"

                            onSelectDate(date);









                    {/* Tasks Preview */}



                          key={task.id}

                        >





                              </span>



                              />

                            <div className="flex items-center gap-2 mt-1">



                              {task.scheduledTime && (





                                      {task.scheduledTime}

                                  </div>






                      


















              })}

          </ScrollArea>

      </Dialog>

  );
