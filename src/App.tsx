import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Task, Category } from '@/types';
import { CategorySection } from '@/components/CategorySection';
import { DailyView } from '@/components/DailyView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckCircle, Circle, FolderPlus, Calendar, List, Sun, Palette, Hash, TrendUp, Dot } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CATEGORY_ID = 'general';

function App() {
  const [tasks, setTasks] = useKV<Task[]>('tasks', []);
  const [categories, setCategories] = useKV<Category[]>('categories', [
    { id: DEFAULT_CATEGORY_ID, name: 'General', createdAt: new Date().toISOString() }
  ]);
  
  const [currentView, setCurrentView] = useState<'categories' | 'daily'>('categories');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [quickAddTaskCategory, setQuickAddTaskCategory] = useState<string | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

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

  const addTask = (categoryId: string, title: string, description?: string) => {
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      completed: false,
      categoryId,
      createdAt: new Date().toISOString()
    };

    setTasks(currentTasks => [...(currentTasks || []), newTask]);
  };

  const addSubtask = (parentId: string, title: string) => {
    const parentTask = tasks?.find(t => t.id === parentId);
    if (!parentTask) return;

    const newSubtask: Task = {
      id: generateId(),
      title,
      completed: false,
      categoryId: parentTask.categoryId,
      parentId,
      createdAt: new Date().toISOString()
    };

    setTasks(currentTasks => [...(currentTasks || []), newSubtask]);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(currentTasks =>
      (currentTasks || []).map(task =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined
            }
          : task
      )
    );
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(currentTasks =>
      (currentTasks || []).map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(currentTasks => (currentTasks || []).filter(task => task.id !== taskId));
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        createdAt: new Date().toISOString()
      };

      setCategories(currentCategories => [...(currentCategories || []), newCategory]);
      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
      setShowAddCategory(false);
    }
  };

  const addQuickTask = (categoryId: string) => {
    if (quickTaskTitle.trim()) {
      addTask(categoryId, quickTaskTitle.trim());
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
    // Move tasks from deleted category to General
    setTasks(currentTasks =>
      (currentTasks || []).map(task =>
        task.categoryId === categoryId
          ? { ...task, categoryId: DEFAULT_CATEGORY_ID }
          : task
      )
    );

    setCategories(currentCategories =>
      (currentCategories || []).filter(category => category.id !== categoryId)
    );
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

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const totalTasks = (tasks || []).length;
  const completedTasks = (tasks || []).filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sticky Sidebar */}
      <div className="w-80 bg-card/50 border-r border-border sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-foreground mb-1">TaskFlow</h1>
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
                    <span>{totalTasks - completedTasks} Remaining</span>
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
                  <div className="font-semibold text-sm text-primary">{totalTasks - completedTasks}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>

              {/* Category Navigation */}
              <div className="space-y-2">
                {(categories || []).map((category) => {
                  const categoryTasks = (tasks || []).filter(task => task.categoryId === category.id);
                  const completedCount = categoryTasks.filter(task => task.completed).length;
                  const categoryProgress = categoryTasks.length > 0 ? Math.round((completedCount / categoryTasks.length) * 100) : 0;
                  
                  return (
                    <div key={category.id} className="space-y-1">
                      <div className="flex items-center gap-1">
                        {/* Quick Add Task Button */}
                        <button
                          onClick={() => setQuickAddTaskCategory(quickAddTaskCategory === category.id ? null : category.id)}
                          className="p-1.5 rounded-md hover:bg-secondary/50 transition-colors flex-shrink-0"
                          title="Add task to this category"
                          style={{ 
                            color: category.color || '#3B82F6',
                            backgroundColor: quickAddTaskCategory === category.id ? `${category.color || '#3B82F6'}15` : 'transparent'
                          }}
                        >
                          <Plus size={14} />
                        </button>
                        
                        {/* Category Button */}
                        <button
                          onClick={() => scrollToCategory(category.id)}
                          className="flex-1 text-left p-3 rounded-lg bg-background hover:bg-secondary/30 transition-colors border border-border/50 hover:border-border group"
                          style={{
                            background: `linear-gradient(135deg, ${category.color || '#3B82F6'}08 0%, ${category.color || '#3B82F6'}03 100%)`,
                            borderColor: `${category.color || '#3B82F6'}20`
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color || '#3B82F6' }}
                              />
                              <span className="font-medium text-sm">{category.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {completedCount}/{categoryTasks.length}
                            </Badge>
                          </div>
                          {categoryTasks.length > 0 && (
                            <div className="space-y-1">
                              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: category.color || '#3B82F6' }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${categoryProgress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{categoryProgress}%</span>
                                <span>{categoryTasks.length - completedCount} left</span>
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                      
                      {/* Quick Add Task Input */}
                      <AnimatePresence>
                        {quickAddTaskCategory === category.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-6"
                          >
                            <div className="flex gap-2 p-2 bg-secondary/20 rounded-md border border-dashed"
                                 style={{ borderColor: `${category.color || '#3B82F6'}30` }}>
                              <Input
                                placeholder="Quick task..."
                                value={quickTaskTitle}
                                onChange={(e) => setQuickTaskTitle(e.target.value)}
                                onKeyDown={(e) => handleQuickTaskKeyDown(e, category.id)}
                                autoFocus
                                className="flex-1 h-8 text-sm"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => addQuickTask(category.id)}
                                disabled={!quickTaskTitle.trim()}
                                className="h-8 px-3"
                              >
                                <Plus size={12} />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                
                {/* Add Category Button in Sidebar */}
                <div className="pt-2 border-t border-border/30">
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
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto px-6 py-8 max-w-4xl">

          {/* Add Category Form */}
          {currentView === 'categories' && (
            <>
              <div className="flex justify-end mb-4">
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
                          <div className="flex gap-3">
                            <Input
                              placeholder="Category name"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="flex-1"
                            />
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
          <Tabs value={currentView} className="space-y-6">
            <TabsContent value="categories" className="space-y-6">
            <AnimatePresence>
              {(categories || []).length > 0 ? (
                (categories || []).map((category) => {
                  const categoryTasks = (tasks || []).filter(task => task.categoryId === category.id);
                  return (
                    <CategorySection
                      key={category.id}
                      category={category}
                      tasks={categoryTasks}
                      allTasks={tasks || []}
                      onAddTask={addTask}
                      onToggleTaskComplete={toggleTaskComplete}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onUpdateCategory={updateCategory}
                      onDeleteCategory={deleteCategory}
                      onAddSubtask={addSubtask}
                      canDeleteCategory={category.id !== DEFAULT_CATEGORY_ID}
                    />
                  );
                })
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
              tasks={tasks || []}
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
    </div>
  );
}

export default App;