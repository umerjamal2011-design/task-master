import { Task } from '@/types/index';

  const taskDate = new Date(date);
  
  yesterday.setDate(today.getDate(
  tomorrow.setDate(today.getDate() + 1);
  
  // Compare dates
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  // Compare dates
  if (taskDateOnly.getTime() === today.getTime()) {
        day: 'numer
      });
  } else {
    const daysDiff = Math.floor((taskDateOnly.getTime() - tod
      return `In ${day
      const weeksDiff = Math.floor(d
    } else {
        month: 'short', 
        year: taskDate.g
    }
};
// Get time label with minutes until/since for to
  const [hours, minutes] = time.split(':').map(Number);
  taskTime.s
  const timeString = taskTime.toLocaleTimeString('en
    minute: '2-digit',
  });
  const timeDiff = taskTime.getTime() - currentTime.getTime();
  
    r
    if (mi
    } else if (minu
      return `${timeString} (in ${hoursUntil}h)`;
      return `${timeStri
  } else {
    if (minutesSince < 60) {
    } else if (minutesSince < 24 * 60) {
      return `${timeString} (${hoursSince}h ago)`;
      return
  }

export const isTaskOver
  const taskDate = new Date(task.scheduledDate);
  
    c
   
  


export const getTaskStatus = (task: Task, currentTime: Date = new Date()): 'overdue' | 
  
  const today = new Date(curre
  
  
    taskDateTime.setHours(hours, minutes, 0, 0);
    if (taskDateTime
    } else if (taskDat
    } else {
  });
  
  const timeDiff = taskTime.getTime() - currentTime.getTime();
  const minutesUntil = Math.round(timeDiff / (1000 * 60));
  
  if (Math.abs(minutesUntil) < 1) {
    return `${timeString} (now)`;
  } else if (minutesUntil > 0) {
    if (minutesUntil < 60) {
      return `${timeString} (in ${minutesUntil}m)`;
    } else if (minutesUntil < 24 * 60) {
      const hoursUntil = Math.floor(minutesUntil / 60);
      return `${timeString} (in ${hoursUntil}h)`;
    } else {
      return `${timeString}`;
    /
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
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);
    return taskDateTime < currentTime;
  }
  
  return taskDate < today;
};

// Get task status based on its scheduled date and time
export const getTaskStatus = (task: Task, currentTime: Date = new Date()): 'overdue' | 'current' | 'upcoming' => {
  if (!task.scheduledDate) return 'upcoming';
  
  const taskDate = new Date(task.scheduledDate);
  const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  if (task.scheduledTime && taskDateOnly.getTime() === today.getTime()) {
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDateTime = new Date(taskDate);
    taskDateTime.setHours(hours, minutes, 0, 0);
    
    if (taskDateTime < currentTime) {
      return 'overdue';
    } else if (taskDateOnly.getTime() === today.getTime()) {
      return 'current';
    } else {
      return 'upcoming';
    }
  }
  
  if (taskDateOnly < today) {

  } else if (taskDateOnly.getTime() === today.getTime()) {

  } else {
    return 'upcoming';
  }


// Sort tasks by their scheduled time and status
export const sortTasksBySchedule = (tasks: Task[], currentTime: Date = new Date()): Task[] => {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to the end
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;

    // If both have scheduled dates
    if (a.scheduledDate && b.scheduledDate) {
      const dateComparison = a.scheduledDate.localeCompare(b.scheduledDate);

      

      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }

      // Tasks with time come before tasks without time on same date
      if (a.scheduledTime && !b.scheduledTime) return -1;
      if (!a.scheduledTime && b.scheduledTime) return 1;

    
    // If only one has a scheduled date, it comes first
    if (a.scheduledDate && !b.scheduledDate) return -1;
    if (!a.scheduledDate && b.scheduledDate) return 1;
    

    return a.createdAt.localeCompare(b.createdAt);

};