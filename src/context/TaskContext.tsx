'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskStatus, TaskRole, TaskPriority } from '@/lib/types';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByRole: (role: TaskRole) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const initialTasks: Task[] = [
  {
    id: 't1', title: 'Shoot product photos for NovaBrew launch', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'Jordan Lee', campaign: 'NovaBrew Spring Launch',
    deadline: '2026-04-15', status: 'in_progress', priority: 'high',
    description: 'Capture 20+ product shots in studio setup. Include lifestyle and flat-lay compositions.'
  },
  {
    id: 't2', title: 'Edit raw footage for PulseWear reel', assignedTo: 'Jin Park',
    role: 'Editor', client: 'Samantha Cruz', campaign: 'PulseWear Q2 Reel',
    deadline: '2026-04-18', status: 'pending', priority: 'high',
    description: 'Cut 60-second reel from raw footage. Add transitions, color grade, and music sync.',
    fromShooter: 'Marco Reyes',
    previousNotes: 'Raw files uploaded to Drive link /pulsewear-raw. Direct sunlight shots preferred.'
  },
  {
    id: 't3', title: 'Run Meta ads for GreenRoot campaign', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'Ethan Patel', campaign: 'GreenRoot Awareness',
    deadline: '2026-04-20', status: 'in_progress', priority: 'medium',
    description: 'Set up and launch Meta ad sets. Budget: $2,000. Target: eco-conscious 25-40 demographic.',
    platform: 'Meta', budget: 2000, spent: 840, leads: 62,
    previousNotes: 'Videos are edited with high contrast as requested.'
  },
  {
    id: 't4', title: 'Shoot behind-the-scenes for LuxeHome', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'Mia Tanaka', campaign: 'LuxeHome Interior Series',
    deadline: '2026-04-22', status: 'pending', priority: 'medium',
    description: 'Document the interior styling process. Capture 3-4 rooms with natural lighting.'
  },
  {
    id: 't5', title: 'Edit NovaBrew promo video', assignedTo: 'Jin Park',
    role: 'Editor', client: 'Jordan Lee', campaign: 'NovaBrew Spring Launch',
    deadline: '2026-04-25', status: 'pending', priority: 'high',
    description: 'Produce 30-second promo from shooter footage. Brand colors: dark brown and cream.',
    fromShooter: 'Marco Reyes'
  },
  {
    id: 't6', title: 'Launch Google Ads for PulseWear', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'Samantha Cruz', campaign: 'PulseWear Q2 Reel',
    deadline: '2026-04-28', status: 'completed', priority: 'low',
    description: 'Set up search and display campaigns. Track conversions via GA4.',
    platform: 'Google', budget: 1500, spent: 1500, leads: 118,
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    notes: 'Campaign performing well. CPC is lower than expected.'
  },
  {
    id: 't7', title: 'Shoot event coverage for GreenRoot', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'Ethan Patel', campaign: 'GreenRoot Awareness',
    deadline: '2026-04-12', status: 'completed', priority: 'medium',
    description: 'Cover the GreenRoot pop-up event. Capture crowd, products, and key moments.'
  },
  {
    id: 't8', title: 'Edit LuxeHome showcase reel', assignedTo: 'Jin Park',
    role: 'Editor', client: 'Mia Tanaka', campaign: 'LuxeHome Interior Series',
    deadline: '2026-04-30', status: 'pending', priority: 'low',
    description: 'Compile interior shots into a 45-second showcase. Soft ambient music.',
    fromShooter: 'Marco Reyes'
  },
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: `t${Date.now()}` };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const getTasksByRole = (role: TaskRole) => {
    return tasks.filter((t) => t.role === role);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTasksByRole }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
