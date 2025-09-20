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
import { Plus, CheckCircle, Circle, FolderPlus, Calendar, List, Sun, Palette, Hash } from '@phosphor-icons/react';
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">TaskFlow</h1>
              <p className="text-muted-foreground">Organize your day, one task at a time</p>
            </div>
            <div className="flex items-center gap-4">
              {totalTasks > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={20} className="text-accent" />
                    <span className="font-medium">{completedTasks} of {totalTasks} completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{completionRate}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'categories' | 'daily')} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="categories" className="gap-2">
                <List size={16} />
                Categories
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-2">
                <Sun size={16} />
                Daily View
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category Navigation Bar */}
          {currentView === 'categories' && (categories || []).length > 1 && (
            <Card className="mb-6 bg-secondary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Hash size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Quick Navigation</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(categories || []).map((category) => {
                    const categoryTasks = (tasks || []).filter(task => task.categoryId === category.id);
                    const completedCount = categoryTasks.filter(task => task.completed).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => scrollToCategory(category.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background hover:bg-secondary/50 transition-colors border border-border/50 hover:border-border text-sm"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        />
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {completedCount}/{categoryTasks.length}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Date Picker for Daily View */}
          {currentView === 'daily' && (
            <div className="flex justify-end mb-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          )}
        </div>

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

        {/* Footer Stats */}
        {totalTasks > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">{(categories || []).length}</span> categories
              </div>
              <div>
                <span className="font-medium text-foreground">{totalTasks}</span> total tasks
              </div>
              <div>
                <span className="font-medium text-accent">{completedTasks}</span> completed
              </div>
              <div>
                <span className="font-medium text-primary">{totalTasks - completedTasks}</span> pending
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;