import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Task, Category } from '@/types';
import { CategorySection } from '@/components/CategorySection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Circle, FolderPlus } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CATEGORY_ID = 'general';

function App() {
  const [tasks, setTasks] = useKV<Task[]>('tasks', []);
  const [categories, setCategories] = useKV<Category[]>('categories', [
    { id: DEFAULT_CATEGORY_ID, name: 'General', createdAt: new Date().toISOString() }
  ]);
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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

    setTasks(currentTasks => [...currentTasks, newTask]);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
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
      currentTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
        createdAt: new Date().toISOString()
      };

      setCategories(currentCategories => [...currentCategories, newCategory]);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setCategories(currentCategories =>
      currentCategories.map(category =>
        category.id === categoryId ? { ...category, ...updates } : category
      )
    );
  };

  const deleteCategory = (categoryId: string) => {
    // Move tasks from deleted category to General
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.categoryId === categoryId
          ? { ...task, categoryId: DEFAULT_CATEGORY_ID }
          : task
      )
    );

    setCategories(currentCategories =>
      currentCategories.filter(category => category.id !== categoryId)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    } else if (e.key === 'Escape') {
      setShowAddCategory(false);
      setNewCategoryName('');
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
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
              <Button
                onClick={() => setShowAddCategory(true)}
                className="gap-2"
              >
                <FolderPlus size={18} />
                Add Category
              </Button>
            </div>
          </div>

          {/* Add Category Form */}
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
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          <AnimatePresence>
            {categories.length > 0 ? (
              categories.map((category) => {
                const categoryTasks = tasks.filter(task => task.categoryId === category.id);
                return (
                  <CategorySection
                    key={category.id}
                    category={category}
                    tasks={categoryTasks}
                    onAddTask={addTask}
                    onToggleTaskComplete={toggleTaskComplete}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    onUpdateCategory={updateCategory}
                    onDeleteCategory={deleteCategory}
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
        </div>

        {/* Footer Stats */}
        {totalTasks > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">{categories.length}</span> categories
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