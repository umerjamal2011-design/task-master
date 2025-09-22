import { Task } from '@/types/index';

  const taskDate = new Date(date);
  const tomorrow = new Date(today);
  const yesterday = new Date(today
  
  
  if (taskDateOnly.getTime() === today.g
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  // Compare dates
  if (taskDateOnly.getTime() === today.getTime()) {
    return 'Today';
      if (daysAgo <= 7) {
      } else {
          month: 'short', 
          year: taskDat
      }
  }

export const getTimeLab
  const taskTime = new Dat
  
    hour: 'num
    hour12: true
  
  const
  if (Math.a
  } else if (minutesUntil > 0) {
      return `${timeStrin
      const hoursUntil = Math.floor(minutesUntil / 60);
    } else {
    }
    const minutesSince = M
      return `${timeStrin
      const hoursSince = Math.floor(minutesSince / 60);
    } else 
    }
};
// 
  

  
    // If both have scheduled date and time, compare datetime
    const taskDateTime = new Date(taskDate);
    
  }
  

export const getTask
  
  const today = 
  
  
    taskDateTime.setHours(hours, minutes, 0, 0);
    if (taskDateTime < currentTime) {
  
    }

    return 'overdue';
    return 'current';
      return `${timeString} (in ${minutesUntil}m)`;
    } else if (minutesUntil < 24 * 60) {
      const hoursUntil = Math.floor(minutesUntil / 60);
      return `${timeString} (in ${hoursUntil}h)`;
    } else {
      return `${timeString}`;
    }
  } else {
    const minutesSince = Math.abs(minutesUntil);
    if (minutesSince < 60) {
      return `${timeString} (${minutesSince}m ago)`;
    } else if (minutesSince < 24 * 60) {
      const hoursSince = Math.floor(minutesSince / 60);
      return `${timeString} (${hoursSince}h ago)`;
    } else {
      return `${timeString}`;
    }
  }
};

// Check if a task is overdue
export const isTaskOverdue = (task: Task, currentTime: Date = new Date()): boolean => {
  if (!task.scheduledDate) return false;
  
  const taskDate = new Date(task.scheduledDate);
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  
  if (task.scheduledTime) {
    // If both have scheduled date and time, compare datetime
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);
    
    return taskDateTime < currentTime;
  }
  
  return taskDate < today;
};

// Get task status based on its scheduled date and time
export const getTaskStatus = (task: Task, currentTime: Date = new Date()): 'overdue' | 'current' | 'upcoming' => {
  if (!task.scheduledDate) return 'current';
  
  const taskDate = new Date(task.scheduledDate);
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  if (task.scheduledTime && taskDateOnly.getTime() === today.getTime()) {
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);
    
    if (taskDateTime < currentTime) {
      return 'overdue';
    } else {
      return 'current';
    }
  }

  if (taskDateOnly.getTime() < today.getTime()) {
    return 'overdue';
  } else if (taskDateOnly.getTime() === today.getTime()) {
    return 'current';
  } else {

  }



export const sortTasksBySchedule = (tasks: Task[], currentTime: Date = new Date()): Task[] => {

    // Completed tasks go to the bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;

    // If both have scheduled dates
    if (a.scheduledDate && b.scheduledDate) {
      const dateComparison = a.scheduledDate.localeCompare(b.scheduledDate);

      // If dates are different, sort by date
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are same and both have times, sort by time
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }

      // Tasks with time come before tasks without time on same date
      if (a.scheduledTime && !b.scheduledTime) return -1;
      if (!a.scheduledTime && b.scheduledTime) return 1;

      return 0;


    // If only one has a scheduled date, it comes first
    if (a.scheduledDate && !b.scheduledDate) return -1;
    if (!a.scheduledDate && b.scheduledDate) return 1;

    // Both have no scheduled date, sort by creation time
    return a.createdAt.localeCompare(b.createdAt);
  });
};