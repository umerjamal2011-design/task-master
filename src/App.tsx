import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Task, Category, PrayerTimes, LocationData, PrayerSettings } from '@/types';
import { SortableCategoryList } from '@/components/SortableCategoryList';
import { SortableCategoryNavigation } from '@/components/SortableCategoryNavigation';
import { DailyView } from '@/components/DailyView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckCircle, Circle, FolderPlus, Calendar, List, Sun, Palette, Hash, TrendUp, Dot, Moon, ListBullets, X, MapPin } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { getTasksForDate, isRepeatingTask } from '@/lib/repeat-utils';

const DEFAULT_CATEGORY_ID = 'general';
const PRAYER_CATEGORY_ID = 'prayers';

function App() {
  const [tasks, setTasks] = useKV<Task[]>('tasks', []);
  const [categories, setCategories] = useKV<Category[]>('categories', [
    { id: DEFAULT_CATEGORY_ID, name: 'General', createdAt: new Date().toISOString(), order: 0 }
  ]);
  const [isDarkMode, setIsDarkMode] = useKV<boolean>('dark-mode', false);
  const [prayerSettings, setPrayerSettings] = useKV<PrayerSettings>('prayer-settings', {
    enabled: false,
    method: 2 // Islamic Society of North America (ISNA)
  });
  
  const [currentView, setCurrentView] = useState<'categories' | 'daily'>('categories');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [quickAddTaskCategory, setQuickAddTaskCategory] = useState<string | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingUpPrayers, setIsSettingUpPrayers] = useState(false);
  const [locationPermissionState, setLocationPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  // Check location permission status
  useEffect(() => {
    if ('navigator' in window && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          setLocationPermissionState(result.state);
          result.onchange = () => {
            setLocationPermissionState(result.state);
          };
        })
        .catch(() => {
          setLocationPermissionState('unknown');
        });
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Prayer functionality
  const getCurrentLocation = async (): Promise<LocationData> => {
    try {
      // First try to use browser's GPS location (most accurate)
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 10000, // 10 seconds
                maximumAge: 300000, // 5 minutes cache
              }
            );
          });

          // Get location details from coordinates using reverse geocoding
          const { latitude, longitude } = position.coords;
          
          // Try to get city/country from coordinates
          try {
            const geocodeResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              return {
                city: geocodeData.city || geocodeData.locality || 'Unknown',
                country: geocodeData.countryName || 'Unknown',
                latitude,
                longitude,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              };
            }
          } catch (geocodeError) {
            console.log('Reverse geocoding failed, using coordinates only:', geocodeError);
          }

          // If reverse geocoding fails, return coordinates with timezone
          return {
            city: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            country: 'GPS Location',
            latitude,
            longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };
        } catch (gpsError) {
          console.log('GPS location failed, trying IP location:', gpsError);
        }
      }

      // Fallback to IP-based location
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          return {
            city: ipData.city || 'Unknown',
            country: ipData.country_name || 'Unknown',
            latitude: ipData.latitude || 0,
            longitude: ipData.longitude || 0,
            timezone: ipData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
          };
        }
      } catch (ipError) {
        console.log('IP location failed:', ipError);
      }
      
      // Final fallback to timezone-based approximation
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return {
        city: 'Unknown',
        country: 'Unknown', 
        latitude: 0,
        longitude: 0,
        timezone: timezone
      };
    } catch (error) {
      console.error('All location methods failed:', error);
      // Return default values if all else fails
      return {
        city: 'Unknown',
        country: 'Unknown',
        latitude: 21.422487, // Mecca coordinates as default
        longitude: 39.826206,
        timezone: 'UTC'
      };
    }
  };

  const getPrayerTimes = async (location: LocationData, date: string): Promise<PrayerTimes | null> => {
    try {
      const method = prayerSettings?.method || 2;
      const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }
      
      const data = await response.json();
      const timings = data.data.timings;
      
      return {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha
      };
    } catch (error) {
      console.error('Failed to get prayer times:', error);
      return null;
    }
  };

  const createPrayerCategory = () => {
    const categoryList = categories || [];
    const existingPrayerCategory = categoryList.find(cat => cat.id === PRAYER_CATEGORY_ID);
    
    if (!existingPrayerCategory) {
      const maxOrder = Math.max(...categoryList.map(cat => cat.order ?? new Date(cat.createdAt).getTime()), -1);
      const prayerCategory: Category = {
        id: PRAYER_CATEGORY_ID,
        name: 'Prayers',
        color: '#10B981', // Green color for prayers
        createdAt: new Date().toISOString(),
        order: maxOrder + 1
      };
      
      setCategories(currentCategories => [...(currentCategories || []), prayerCategory]);
    }
  };

  const addPrayerTasks = async (prayerTimes: PrayerTimes, date: string) => {
    const prayerNames = [
      { name: 'Fajr', time: prayerTimes.fajr, description: 'Dawn Prayer' },
      { name: 'Dhuhr', time: prayerTimes.dhuhr, description: 'Noon Prayer' },
      { name: 'Asr', time: prayerTimes.asr, description: 'Afternoon Prayer' },
      { name: 'Maghrib', time: prayerTimes.maghrib, description: 'Sunset Prayer' },
      { name: 'Isha', time: prayerTimes.isha, description: 'Night Prayer' }
    ];

    // Remove existing prayer tasks for the date to avoid duplicates
    setTasks(currentTasks => {
      const filteredTasks = (currentTasks || []).filter(task => {
        const isPrayerTask = task.categoryId === PRAYER_CATEGORY_ID;
        const isForSameDate = task.scheduledDate === date;
        return !(isPrayerTask && isForSameDate);
      });

      // Add new prayer tasks
      const newPrayerTasks = prayerNames.map(prayer => ({
        id: generateId(),
        title: `${prayer.name} Prayer`,
        description: `${prayer.description} - ${prayer.time}`,
        completed: false,
        categoryId: PRAYER_CATEGORY_ID,
        scheduledDate: date,
        scheduledTime: prayer.time,
        createdAt: new Date().toISOString(),
        priority: 'high' as const
      }));

      return [...filteredTasks, ...newPrayerTasks];
    });
  };

  const setupPrayerTimes = async () => {
    setIsSettingUpPrayers(true);
    
    try {
      // Get location
      const location = await getCurrentLocation();
      console.log('Location obtained:', location);
      
      // Create prayer category if it doesn't exist
      createPrayerCategory();
      
      // Get today's prayer times
      const today = new Date().toISOString().split('T')[0];
      const prayerTimes = await getPrayerTimes(location, today);
      
      if (prayerTimes) {
        // Add prayer tasks for today
        await addPrayerTasks(prayerTimes, today);
        
        // Update prayer settings
        setPrayerSettings({
          enabled: true,
          location,
          lastUpdated: new Date().toISOString(),
          method: prayerSettings?.method || 2
        });
        
        console.log('Prayer times setup completed for', location.city, location.country);
        
        // Show success message with location source info
        const locationSource = location.city.startsWith('GPS:') ? '📍 GPS' : 
                              location.city === 'Unknown' ? '🌐 Default' : '🌐 IP';
        toast.success(`${locationSource} - Prayer times set for ${location.city}, ${location.country}`);
        
        // Update location permission state
        if (locationPermissionState !== 'granted' && location.city !== 'Unknown') {
          setLocationPermissionState('granted');
        }
      }
    } catch (error) {
      console.error('Failed to setup prayer times:', error);
      
      // Show specific error message based on the error type
      let errorMessage = 'Failed to setup prayer times. Please try again or set location manually.';
      
      if (error instanceof GeolocationPositionError || error?.code) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Location access denied. You can still use prayer times with IP-based location or set manually.';
            setLocationPermissionState('denied');
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Location unavailable. Using IP-based location instead.';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location request timed out. Using IP-based location instead.';
            break;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSettingUpPrayers(false);
    }
  };

  const updateDailyPrayerTimes = async () => {
    if (!prayerSettings?.enabled || !prayerSettings?.location) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastUpdated = prayerSettings?.lastUpdated ? new Date(prayerSettings.lastUpdated).toISOString().split('T')[0] : null;
      
      // Only update if we haven't updated today
      if (lastUpdated !== today) {
        const prayerTimes = await getPrayerTimes(prayerSettings.location, today);
        
        if (prayerTimes) {
          await addPrayerTasks(prayerTimes, today);
          
          setPrayerSettings(prev => ({
            enabled: prev?.enabled || false,
            location: prev?.location,
            method: prev?.method || 2,
            lastUpdated: new Date().toISOString()
          }));
          
          console.log('Daily prayer times updated');
        }
      }
    } catch (error) {
      console.error('Failed to update daily prayer times:', error);
    }
  };

  // Update prayer times daily
  useEffect(() => {
    updateDailyPrayerTimes();
  }, [prayerSettings?.enabled]); // Run when prayer settings change

  // Check for prayer time updates every hour
  useEffect(() => {
    if (!prayerSettings?.enabled) return;
    
    const interval = setInterval(updateDailyPrayerTimes, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [prayerSettings?.enabled, prayerSettings?.location]);

  const categoryColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
    '#EC4899', // pink
    '#6B7280', // gray
  ];

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Cleanup function to remove orphaned tasks (tasks with non-existent parent IDs or category IDs)
  const cleanupOrphanedTasks = React.useCallback((currentCategories: Category[]) => {
    setTasks(currentTasks => {
      if (!currentTasks || currentTasks.length === 0) return [];
      
      const validCategoryIds = new Set(currentCategories.map(cat => cat.id));
      
      // First pass: remove tasks with invalid category IDs
      let cleanedTasks = currentTasks.filter(task => {
        // Must be a valid object with required properties
        if (!task || !task.id || typeof task.completed !== 'boolean') {
          console.log('Removing invalid task object:', task);
          return false;
        }
        
        // Must belong to a valid category
        if (!validCategoryIds.has(task.categoryId)) {
          console.log('Removing task with invalid category:', task.id, task.categoryId);
          return false;
        }
        
        return true;
      });
      
      // Second pass: remove tasks with invalid parent IDs (orphaned subtasks)
      const validTaskIds = new Set(cleanedTasks.map(task => task.id));
      cleanedTasks = cleanedTasks.filter(task => {
        if (task.parentId && !validTaskIds.has(task.parentId)) {
          console.log('Removing orphaned subtask:', task.id, 'parent:', task.parentId);
          return false;
        }
        return true;
      });
      
      if (cleanedTasks.length !== currentTasks.length) {
        console.log(`Cleaned up ${currentTasks.length - cleanedTasks.length} invalid tasks`);
      }
      
      return cleanedTasks;
    });
  }, []);

  // Run cleanup when categories change (not on every task change to avoid loops)
  useEffect(() => {
    if (!tasks || tasks.length === 0 || !categories || categories.length === 0) return;
    
    const validCategoryIds = new Set(categories.map(cat => cat.id));
    
    // Check if cleanup is needed
    const hasInvalidTasks = tasks.some(task => 
      !task || 
      !task.id || 
      typeof task.completed !== 'boolean' ||
      !validCategoryIds.has(task.categoryId) ||
      (task.parentId && !tasks.some(t => t?.id === task.parentId))
    );
    
    if (hasInvalidTasks) {
      console.log('Auto-cleanup: Found invalid tasks, cleaning up...');
      cleanupOrphanedTasks(categories);
    }
  }, [categories, cleanupOrphanedTasks]); // Only trigger on category changes to avoid infinite loops

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get valid tasks with comprehensive filtering - exclude repeated instances for counting
  const validTasks = React.useMemo(() => {
    if (!tasks || tasks.length === 0 || !categories || categories.length === 0) {
      console.log('No tasks or categories, returning empty array');
      return [];
    }
    
    const validCategoryIds = new Set(categories.map(cat => cat.id));
    console.log('Valid category IDs:', Array.from(validCategoryIds));
    
    // First filter: basic validity and category existence
    const basicValid = tasks.filter(task => {
      if (!task) {
        console.log('Filtering out null/undefined task');
        return false;
      }
      if (!task.id) {
        console.log('Filtering out task without ID:', task);
        return false;
      }
      if (!task.title) {
        console.log('Filtering out task without title:', task.id);
        return false;
      }
      if (typeof task.completed !== 'boolean') {
        console.log('Filtering out task with invalid completed field:', task.id, task.completed);
        return false;
      }
      if (!task.categoryId) {
        console.log('Filtering out task without categoryId:', task.id);
        return false;
      }
      if (!validCategoryIds.has(task.categoryId)) {
        console.log('Filtering out task with invalid categoryId:', task.id, task.categoryId);
        return false;
      }
      return true;
    });
    
    console.log(`Basic validation: ${tasks.length} -> ${basicValid.length}`);
    
    // Second filter: ensure parent-child relationships are valid
    const taskIds = new Set(basicValid.map(task => task.id));
    const fullyValid = basicValid.filter(task => {
      if (task.parentId && !taskIds.has(task.parentId)) {
        console.log('Filtering out orphaned subtask:', task.id, 'parent:', task.parentId);
        return false;
      }
      return true;
    });
    
    console.log(`Final validation: ${basicValid.length} -> ${fullyValid.length}`);
    return fullyValid;
  }, [tasks, categories]);
  
  // Count only non-repeated instances for display purposes
  const nonRepeatedTasks = validTasks.filter(task => !task.isRepeatedInstance);
  const totalTasks = nonRepeatedTasks.length;
  const completedTasks = nonRepeatedTasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Check for data inconsistencies
  const hasDataInconsistencies = (tasks || []).length !== validTasks.length;

  // Add a function to force clear all data (for debugging)
  const forceDataReset = () => {
    console.log('Force clearing all data...');
    setTasks(() => {
      console.log('Tasks state setter called with empty array');
      return [];
    });
  };

  // Debug function to clear all tasks (can be called from browser console)
  useEffect(() => {
    (window as any).clearAllTasks = forceDataReset;
    
    (window as any).emergencyReset = emergencyReset;
    
    (window as any).showTasksData = () => {
      console.log('=== CURRENT STATE DEBUG ===');
      console.log('Raw tasks array:', tasks);
      console.log('Current categories:', categories);
      console.log('Valid tasks (computed):', validTasks);
      console.log('Raw task count:', (tasks || []).length);
      console.log('Valid task count:', validTasks.length);
      console.log('Total tasks:', totalTasks);
      console.log('Completed tasks:', completedTasks);
      console.log('Pending tasks:', pendingTasks);
      console.log('Has inconsistencies:', hasDataInconsistencies);
      
      // Check for specific inconsistencies
      if (tasks && tasks.length > 0) {
        const categoryIds = new Set((categories || []).map(c => c.id));
        const invalidTasks = tasks.filter(t => 
          !t || !t.id || !t.categoryId || !categoryIds.has(t.categoryId)
        );
        console.log('Invalid tasks found:', invalidTasks);
        
        const orphanedTasks = tasks.filter(t => 
          t && t.parentId && !tasks.some(parent => parent.id === t.parentId)
        );
        console.log('Orphaned subtasks found:', orphanedTasks);
      }
      console.log('=== END DEBUG ===');
    };
    
    // Debug function to test location detection
    (window as any).testLocationDetection = async () => {
      console.log('Testing location detection...');
      try {
        const location = await getCurrentLocation();
        console.log('Location detection result:', location);
        console.log('Location permission state:', locationPermissionState);
      } catch (error) {
        console.error('Location detection failed:', error);
      }
    };
    
    // Function to check if current state is consistent
    (window as any).checkConsistency = () => {
      const rawCount = (tasks || []).length;
      const validCount = validTasks.length;
      const difference = rawCount - validCount;
      
      console.log(`State consistency check: Raw=${rawCount}, Valid=${validCount}, Diff=${difference}`);
      
      if (difference > 0) {
        console.warn(`Found ${difference} invalid tasks that should be cleaned up`);
        return false;
      } else {
        console.log('State is consistent');
        return true;
      }
    };
    
    // Manual cleanup function (for testing)
    (window as any).manualCleanup = () => {
      console.log('Running manual cleanup...');
      cleanupOrphanedTasks(categories || []);
      
      setTimeout(() => {
        console.log('Manual cleanup completed. Checking state...');
        (window as any).showTasksData();
      }, 100);
    };
  }, [tasks, categories, validTasks, totalTasks, completedTasks, pendingTasks, hasDataInconsistencies]);
  
  // Function to fix data inconsistencies
  const fixDataInconsistencies = () => {
    const originalCount = (tasks || []).length;
    const validCount = validTasks.length;
    const toRemove = originalCount - validCount;
    
    console.log('Fixing data inconsistencies...', {
      originalCount,
      validCount,
      removing: toRemove,
      validTasks: validTasks
    });
    
    // Force update with only valid tasks using functional setter
    setTasks(() => {
      console.log('Setting tasks to valid tasks only:', validTasks);
      return [...validTasks]; // Create a new array to ensure state change detection
    });
    
    console.log(`Removed ${toRemove} corrupted tasks immediately`);
  };
  
  // Emergency data reset function (for severe corruption)
  const emergencyReset = async () => {
    if (confirm('This will delete ALL tasks and categories and reset the app. Are you sure?')) {
      console.log('Starting emergency reset...');
      
      // Clear state immediately with functional setters
      setTasks(() => {
        console.log('Emergency reset: clearing all tasks');
        return [];
      });
      setCategories(() => {
        console.log('Emergency reset: resetting categories to default');
        return [{ id: DEFAULT_CATEGORY_ID, name: 'General', createdAt: new Date().toISOString(), order: 0 }];
      });
      
      // Also try to clear KV storage directly if accessible
      try {
        if (typeof window !== 'undefined' && (window as any).spark?.kv) {
          await (window as any).spark.kv.delete('tasks');
          await (window as any).spark.kv.delete('categories');
          console.log('KV storage cleared');
        }
      } catch (error) {
        console.log('Could not clear KV storage:', error);
      }
      
      console.log('Emergency reset completed');
      
      // Force page reload as last resort
      if (confirm('Reload page to ensure clean state?')) {
        window.location.reload();
      }
    }
  };

  const addTask = (categoryId: string, title: string, description?: string, taskOptions?: Partial<Task>) => {
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      completed: false,
      categoryId,
      createdAt: new Date().toISOString(),
      ...taskOptions
    };

    setTasks(currentTasks => {
      const updatedTasks = [...(currentTasks || []), newTask];
      return updatedTasks;
    });
    
    return newTask;
  };

  const addSubtask = (parentId: string, title: string) => {
    setTasks(currentTasks => {
      const tasksList = currentTasks || [];
      const parentTask = tasksList.find(t => t.id === parentId);
      if (!parentTask) return tasksList;

      const newSubtask: Task = {
        id: generateId(),
        title,
        completed: false,
        categoryId: parentTask.categoryId,
        parentId,
        createdAt: new Date().toISOString()
      };

      return [...tasksList, newSubtask];
    });
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(currentTasks => {
      const tasksList = currentTasks || [];
      const targetTask = tasksList.find(t => t.id === taskId);
      if (!targetTask) return tasksList;

      const newCompletedState = !targetTask.completed;

      // Function to recursively find all subtasks
      const findAllSubtasks = (parentId: string): string[] => {
        const directSubtasks = tasksList.filter(task => task.parentId === parentId);
        let allSubtasks: string[] = [];
        
        for (const subtask of directSubtasks) {
          allSubtasks.push(subtask.id);
          // Recursively find subtasks of this subtask
          allSubtasks = allSubtasks.concat(findAllSubtasks(subtask.id));
        }
        
        return allSubtasks;
      };

      return tasksList.map(task => {
        // Update the target task
        if (task.id === taskId) {
          return {
            ...task,
            completed: newCompletedState,
            completedAt: newCompletedState ? new Date().toISOString() : undefined
          };
        }

        // If we're completing a parent task, auto-complete all its subtasks
        if (newCompletedState && findAllSubtasks(taskId).includes(task.id)) {
          return {
            ...task,
            completed: true,
            completedAt: new Date().toISOString()
          };
        }

        // If we're uncompleting a parent task, we'll leave subtasks as they are
        // (user might want to keep some completed)
        
        return task;
      });
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(currentTasks => {
      const tasksList = currentTasks || [];
      return tasksList.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        return task;
      });
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks(currentTasks => {
      const tasksList = currentTasks || [];
      
      // Find all tasks that need to be deleted (the task and all its subtasks recursively)
      const tasksToDelete = new Set<string>();
      
      const findAllSubtasks = (parentId: string) => {
        tasksToDelete.add(parentId);
        const subtasks = tasksList.filter(task => task.parentId === parentId);
        subtasks.forEach(subtask => findAllSubtasks(subtask.id));
      };
      
      findAllSubtasks(taskId);
      
      // Filter out all tasks that should be deleted
      return tasksList.filter(task => !tasksToDelete.has(task.id));
    });
  };

  const reorderCategories = (reorderedCategories: Category[]) => {
    setCategories(reorderedCategories);
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const categoryList = categories || [];
      const maxOrder = Math.max(...categoryList.map(cat => cat.order ?? new Date(cat.createdAt).getTime()), -1);
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        createdAt: new Date().toISOString(),
        order: maxOrder + 1
      };

      setCategories(currentCategories => [...(currentCategories || []), newCategory]);
      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
      setShowAddCategory(false);
    }
  };

  const addQuickTask = (categoryId: string) => {
    if (quickTaskTitle.trim()) {
      addTask(categoryId, quickTaskTitle.trim().substring(0, 150));
      setQuickTaskTitle('');
      setQuickAddTaskCategory(null);
    }
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setCategories(currentCategories =>
      (currentCategories || []).map(category =>
        category.id === categoryId ? { ...category, ...updates } : category
      )
    );
  };

  const deleteCategory = (categoryId: string) => {
    if (categoryId === DEFAULT_CATEGORY_ID || categoryId === PRAYER_CATEGORY_ID) {
      console.log('Cannot delete system category:', categoryId);
      return;
    }

    console.log('Deleting category:', categoryId);
    
    // First, delete all tasks in this category (don't move them)
    setTasks(currentTasks => {
      const originalTaskCount = (currentTasks || []).length;
      const tasksToDelete = (currentTasks || []).filter(task => task.categoryId === categoryId);
      const remainingTasks = (currentTasks || []).filter(task => task.categoryId !== categoryId);
      
      console.log(`Category ${categoryId}: Deleting ${tasksToDelete.length} tasks, keeping ${remainingTasks.length}/${originalTaskCount} tasks`);
      console.log('Tasks being deleted:', tasksToDelete.map(t => ({ id: t.id, title: t.title })));
      console.log('Tasks remaining after category deletion:', remainingTasks.map(t => ({ id: t.id, title: t.title, categoryId: t.categoryId })));
      
      return remainingTasks;
    });

    // Then delete the category
    setCategories(currentCategories => {
      const originalCatCount = (currentCategories || []).length;
      const filtered = (currentCategories || []).filter(category => category.id !== categoryId);
      console.log(`Categories: ${originalCatCount} -> ${filtered.length}`);
      console.log('Remaining categories:', filtered.map(c => ({ id: c.id, name: c.name })));
      return filtered;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    } else if (e.key === 'Escape') {
      setShowAddCategory(false);
      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
    }
  };

  const handleQuickTaskKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addQuickTask(categoryId);
    } else if (e.key === 'Escape') {
      setQuickAddTaskCategory(null);
      setQuickTaskTitle('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Data Inconsistency Alert */}
      {hasDataInconsistencies && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-destructive">⚠️</span>
              <span className="text-destructive">
                Task count mismatch detected - {(tasks || []).length - validTasks.length} corrupted entries
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fixDataInconsistencies}
                className="text-xs h-7"
              >
                Fix Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={emergencyReset}
                className="text-xs h-7 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Reset All
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-card/50 border-b border-border px-4 py-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="h-10 w-10 p-0"
            >
              <ListBullets size={20} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">Organize your day</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalTasks > 0 && (
              <Badge variant="outline" className="text-sm px-2 py-1">
                {completedTasks}/{totalTasks}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-10 w-10 p-0"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Tabs */}
        <div className="mt-4">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'categories' | 'daily')}>
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="categories" className="gap-2 text-sm">
                <List size={16} />
                Categories
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-2 text-sm">
                <Sun size={16} />
                Daily View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-card/50 border-r border-border sticky top-0 h-screen overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="h-8 w-8 p-0"
                  title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Organize your day</p>
            </div>

            {/* Progress Stats */}
            {totalTasks > 0 && (
              <Card className="mb-6 bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendUp size={20} className="text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">{completedTasks} of {totalTasks}</div>
                      <div className="text-sm text-muted-foreground">Tasks Completed</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{completionRate}% Complete</span>
                      <span>{pendingTasks} Remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Tabs */}
            <div className="mb-6">
              <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'categories' | 'daily')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="categories" className="gap-2 text-xs">
                    <List size={14} />
                    Categories
                  </TabsTrigger>
                  <TabsTrigger value="daily" className="gap-2 text-xs">
                    <Sun size={14} />
                    Daily View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Category Stats & Navigation */}
            {currentView === 'categories' && (categories || []).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Hash size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Categories</span>
                </div>
                
                {/* Overall Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-secondary/30 rounded-lg">
                    <div className="font-semibold text-sm text-foreground">{(categories || []).length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-2 bg-accent/10 rounded-lg">
                    <div className="font-semibold text-sm text-accent">{completedTasks}</div>
                    <div className="text-xs text-muted-foreground">Done</div>
                  </div>
                  <div className="text-center p-2 bg-primary/10 rounded-lg">
                    <div className="font-semibold text-sm text-primary">{pendingTasks}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>

                {/* Category Navigation */}
                <div className="space-y-4">
                  <SortableCategoryNavigation
                    categories={categories || []}
                    tasks={validTasks}
                    onReorderCategories={reorderCategories}
                    onScrollToCategory={scrollToCategory}
                    quickAddTaskCategory={quickAddTaskCategory}
                    onQuickAddTaskCategory={setQuickAddTaskCategory}
                    quickTaskTitle={quickTaskTitle}
                    onQuickTaskTitleChange={setQuickTaskTitle}
                    onQuickTaskSubmit={addQuickTask}
                  />
                  
                  {/* Add Category Button in Sidebar */}
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    {/* Prayer Times Button */}
                    <Button
                      variant={prayerSettings?.enabled ? "default" : "outline"}
                      onClick={setupPrayerTimes}
                      disabled={isSettingUpPrayers}
                      className="w-full gap-2 text-sm h-10 hover:bg-accent/20"
                    >
                      <MapPin size={16} />
                      {isSettingUpPrayers ? 'Getting location...' : prayerSettings?.enabled ? 'Update Prayer Times' : 'Setup Prayer Times'}
                    </Button>
                    
                    {/* Location Permission Status */}
                    {locationPermissionState === 'denied' && (
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="text-xs text-orange-700 dark:text-orange-300">
                          📍 Location access denied. Prayer times will use IP-based location (less accurate). You can set location manually in the prayer category.
                        </div>
                      </div>
                    )}
                    
                    {locationPermissionState === 'prompt' && !prayerSettings?.enabled && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          💡 For most accurate prayer times, allow location access when prompted. You can also set location manually in the prayer category.
                        </div>
                      </div>
                    )}
                    
                    {prayerSettings?.enabled && prayerSettings?.location && (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xs text-green-700 dark:text-green-300">
                          ✅ Prayer times active for {prayerSettings.location.city}, {prayerSettings.location.country}
                        </div>
                      </div>
                    )}
                    
                    {/* Prayer Info */}
                    {prayerSettings?.enabled && prayerSettings.location && (
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <div className="text-xs text-muted-foreground mb-1">Prayer Location:</div>
                        <div className="text-sm font-medium text-accent">
                          {prayerSettings.location.city}, {prayerSettings.location.country}
                        </div>
                        {prayerSettings.lastUpdated && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Updated: {new Date(prayerSettings.lastUpdated).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowAddCategory(true)}
                      className="w-full gap-2 text-sm h-10 border-dashed hover:bg-secondary/30"
                    >
                      <FolderPlus size={16} />
                      Add Category
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Date Picker for Daily View */}
            {currentView === 'daily' && (
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-foreground"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              
              {/* Mobile Sidebar */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full w-80 bg-card/98 backdrop-blur-md border-r border-border z-50 lg:hidden overflow-y-auto shadow-2xl"
              >
                <div className="p-6">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
                      <p className="text-sm text-muted-foreground">Organize your day</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X size={16} />
                    </Button>
                  </div>

                  {/* Progress Stats */}
                  {totalTasks > 0 && (
                    <Card className="mb-6 bg-primary/5 border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <TrendUp size={20} className="text-primary" />
                          <div>
                            <div className="font-semibold text-foreground">{completedTasks} of {totalTasks}</div>
                            <div className="text-sm text-muted-foreground">Tasks Completed</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${completionRate}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{completionRate}% Complete</span>
                            <span>{pendingTasks} Remaining</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Category Stats & Navigation for Mobile */}
                  {currentView === 'categories' && (categories || []).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Hash size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Categories</span>
                      </div>
                      
                      {/* Overall Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-secondary/30 rounded-lg">
                          <div className="font-semibold text-sm text-foreground">{(categories || []).length}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center p-2 bg-accent/10 rounded-lg">
                          <div className="font-semibold text-sm text-accent">{completedTasks}</div>
                          <div className="text-xs text-muted-foreground">Done</div>
                        </div>
                        <div className="text-center p-2 bg-primary/10 rounded-lg">
                          <div className="font-semibold text-sm text-primary">{pendingTasks}</div>
                          <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                      </div>

                      {/* Category Navigation */}
                      <div className="space-y-4">
                        <SortableCategoryNavigation
                          categories={categories || []}
                          tasks={validTasks}
                          onReorderCategories={reorderCategories}
                          onScrollToCategory={scrollToCategory}
                          quickAddTaskCategory={quickAddTaskCategory}
                          onQuickAddTaskCategory={setQuickAddTaskCategory}
                          quickTaskTitle={quickTaskTitle}
                          onQuickTaskTitleChange={setQuickTaskTitle}
                          onQuickTaskSubmit={addQuickTask}
                          isMobile={true}
                          onMobileClose={() => setIsMobileSidebarOpen(false)}
                        />
                        
                        {/* Add Category Button in Mobile Sidebar */}
                        <div className="pt-2 border-t border-border/30 space-y-2">
                          {/* Prayer Times Button */}
                          <Button
                            variant={prayerSettings?.enabled ? "default" : "outline"}
                            onClick={() => {
                              setupPrayerTimes();
                              setIsMobileSidebarOpen(false);
                            }}
                            disabled={isSettingUpPrayers}
                            className="w-full gap-2 text-sm h-10 hover:bg-accent/20"
                          >
                            <MapPin size={16} />
                            {isSettingUpPrayers ? 'Getting location...' : prayerSettings?.enabled ? 'Update Prayer Times' : 'Setup Prayer Times'}
                          </Button>
                          
                          {/* Location Permission Status */}
                          {locationPermissionState === 'denied' && (
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                              <div className="text-xs text-orange-700 dark:text-orange-300">
                                📍 Location access denied. Prayer times will use IP-based location (less accurate). You can set location manually in the prayer category.
                              </div>
                            </div>
                          )}
                          
                          {locationPermissionState === 'prompt' && !prayerSettings?.enabled && (
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="text-xs text-blue-700 dark:text-blue-300">
                                💡 For most accurate prayer times, allow location access when prompted. You can also set location manually in the prayer category.
                              </div>
                            </div>
                          )}
                          
                          {prayerSettings?.enabled && prayerSettings?.location && (
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="text-xs text-green-700 dark:text-green-300">
                                ✅ Prayer times active for {prayerSettings.location.city}, {prayerSettings.location.country}
                              </div>
                            </div>
                          )}
                          
                          {/* Prayer Info */}
                          {prayerSettings?.enabled && prayerSettings.location && (
                            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                              <div className="text-xs text-muted-foreground mb-1">Prayer Location:</div>
                              <div className="text-sm font-medium text-accent">
                                {prayerSettings.location.city}, {prayerSettings.location.country}
                              </div>
                              {prayerSettings.lastUpdated && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Updated: {new Date(prayerSettings.lastUpdated).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddCategory(true);
                              setIsMobileSidebarOpen(false);
                            }}
                            className="w-full gap-2 text-sm h-10 border-dashed hover:bg-secondary/30"
                          >
                            <FolderPlus size={16} />
                            Add Category
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date Picker for Daily View in Mobile */}
                  {currentView === 'daily' && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full text-foreground"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 lg:overflow-auto">
          <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4 max-w-4xl pb-24 lg:pb-8">

            {/* Add Category Form */}
            {currentView === 'categories' && (
              <>
                <div className="hidden lg:flex justify-end mb-4">
                  <Button
                    onClick={() => setShowAddCategory(true)}
                    className="gap-2"
                  >
                    <FolderPlus size={18} />
                    Add Category
                  </Button>
                </div>

                <AnimatePresence>
                  {showAddCategory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mb-6"
                    >
                      <Card className="bg-secondary/50 border-dashed">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Input
                                placeholder="Category name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="flex-1"
                              />
                              <div className="flex gap-2">
                                <Button onClick={addCategory} disabled={!newCategoryName.trim()}>
                                  <Plus size={16} />
                                  Add
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowAddCategory(false);
                                    setNewCategoryName('');
                                    setNewCategoryColor('#3B82F6');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Palette size={14} />
                                Choose Color
                              </Label>
                              <div className="flex flex-wrap gap-2">
                                {categoryColors.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewCategoryColor(color)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                                      newCategoryColor === color 
                                        ? 'border-foreground scale-110' 
                                        : 'border-border hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Content */}
            <Tabs value={currentView} className="space-y-3">
              <TabsContent value="categories" className="space-y-3">
                <AnimatePresence>
                  {(categories || []).length > 0 ? (
                    <SortableCategoryList
                      categories={categories || []}
                      tasks={validTasks}
                      onAddTask={addTask}
                      onToggleTaskComplete={toggleTaskComplete}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onUpdateCategory={updateCategory}
                      onDeleteCategory={deleteCategory}
                      onAddSubtask={addSubtask}
                      onReorderCategories={reorderCategories}
                      prayerSettings={prayerSettings}
                      onUpdatePrayerSettings={async (settings) => {
                        setPrayerSettings(settings);
                        // Update prayer times with new settings
                        if (settings.location) {
                          const today = new Date().toISOString().split('T')[0];
                          const prayerTimes = await getPrayerTimes(settings.location, today);
                          if (prayerTimes) {
                            await addPrayerTasks(prayerTimes, today);
                          }
                        }
                      }}
                      isUpdatingPrayers={isSettingUpPrayers}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <Circle size={64} className="mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-medium mb-2">No categories yet</h3>
                      <p className="text-muted-foreground mb-4">Create your first category to start organizing tasks</p>
                      <Button onClick={() => setShowAddCategory(true)} className="gap-2">
                        <FolderPlus size={18} />
                        Add Your First Category
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="daily">
                <DailyView
                  tasks={validTasks}
                  categories={categories || []}
                  selectedDate={selectedDate}
                  onToggleTaskComplete={toggleTaskComplete}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onAddSubtask={addSubtask}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Mobile Floating Add Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-30">
          <Button
            onClick={() => setShowAddCategory(true)}
            size="lg"
            className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground"
          >
            <Plus size={28} weight="bold" />
          </Button>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster 
        theme={isDarkMode ? 'dark' : 'light'}
        position="bottom-right"
        richColors
      />
    </div>
  );
}

export default App;