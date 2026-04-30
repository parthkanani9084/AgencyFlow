'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskRole, Notification, AuthUser, TaskNote, ActivityLog } from '@/types';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  notifications: Notification[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>, notes?: string, nextRoleMember?: { name: string; role: string }, screenshot?: string) => void;
  deleteTask: (id: string) => void;
  getTasksByRole: (role: TaskRole) => Task[];
  markNotifRead: (id: string) => void;
  clearNotifications: (type?: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const DEMO_VERSION = 'v1.7'; // Incremented for clean migration

export const INITIAL_TASKS: Task[] = [
  {
    id: 's1', title: 'Studio Photography: New Arrival Lineup', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'Luxe Apparel', brand: 'Luxe Apparel', campaign: 'Spring Collection Launch', campaignId: 'c_spring',
    deadline: '2026-04-20', status: 'completed', priority: 'high',
    description: 'Capture the full spring line-up in the studio.',
    forwardedBy: 'Marco Reyes',
    roleNotes: [{ role: 'Shooter', message: 'Uploaded 50+ raw shots. The lighting was set to "Warm Morning".', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Marco Reyes' }],
  },
  {
    id: 's2', title: 'Cinematic Teaser Edit: Spring Lookbook', assignedTo: 'Jin Park',
    role: 'Editor', client: 'Luxe Apparel', brand: 'Luxe Apparel', campaign: 'Spring Collection Launch', campaignId: 'c_spring',
    deadline: '2026-04-25', status: 'in_progress', priority: 'high',
    description: 'Create a cinematic 30s teaser from the studio shots.',
    forwardedBy: 'Marco Reyes',
    roleNotes: [{ role: 'Shooter', message: 'Uploaded 50+ raw shots.', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Marco Reyes' }],
  },
  {
    id: 's3', title: 'Facebook & IG Ad Setup: Spring Launch', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'Luxe Apparel', brand: 'Luxe Apparel', campaign: 'Spring Collection Launch', campaignId: 'c_spring',
    deadline: '2026-05-01', status: 'pending', priority: 'medium',
    description: 'Setup and deploy Meta ads for the Spring collection.',
    forwardedBy: 'Jin Park',
    roleNotes: [
      { role: 'Shooter', message: 'Uploaded 50+ raw shots.', timestamp: new Date(Date.now() - 259200000).toISOString(), author: 'Marco Reyes' },
      { role: 'Editor', message: 'Promo edit finalized with brand colors.', timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'Jin Park' }
    ],
  },
  {
    id: 'w2', title: 'Multi-Channel Campaign Deployment: Cyber-Week', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'TechWorld', brand: 'TechWorld', campaign: 'Cyber-Week Sale', campaignId: 'c_cyber',
    deadline: '2026-05-01', status: 'in_progress', priority: 'high',
    description: 'Scaling ads across Meta, TikTok, and Google.',
    forwardedBy: 'Jin Park',
    platform: 'Meta', budget: 15000, spent: 4500, leads: 820,
    roleNotes: [
      { role: 'Shooter', message: 'Product photography finished.', timestamp: new Date(Date.now() - 345600000).toISOString(), author: 'Marco Reyes' },
      { role: 'Editor', message: 'Vertical and horizontal edits delivered.', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Jin Park' }
    ],
  }
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return INITIAL_TASKS;
    const saved = localStorage.getItem('agencyflow_tasks_v3');
    const version = localStorage.getItem('agencyflow_version');
    if (version !== DEMO_VERSION || !saved) {
      localStorage.setItem('agencyflow_tasks_v3', JSON.stringify(INITIAL_TASKS));
      localStorage.setItem('agencyflow_version', DEMO_VERSION);
      return INITIAL_TASKS;
    }
    return JSON.parse(saved);
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('agencyflow_notifications_v3');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', type: 'task_assigned', title: 'Welcome to AgencyFlow', message: 'Your campaign management dashboard is ready.', timestamp: new Date().toISOString(), read: false, actor: 'System' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('agencyflow_tasks_v3', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('agencyflow_notifications_v3', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `n${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: `t${Date.now()}` };
    setTasks(prev => [newTask, ...prev]);
    addNotification({
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `"${newTask.title}" has been assigned to ${newTask.assignedTo}.`,
      actor: user?.name || 'Manager',
      targetId: newTask.id,
      targetType: 'task'
    });
  };

  const updateTask = (
    id: string, 
    updates: Partial<Task>, 
    notes?: string, 
    nextRoleMember?: { name: string; role: string }, 
    screenshot?: string
  ) => {
    setTasks(prev => {
      return prev.map(task => {
        if (task.id !== id) return task;

        const isCompleting = updates.status === 'completed' && task.status !== 'completed';
        const timestamp = new Date().toISOString();
        
        // 1. Prepare Role Notes if completing
        let roleNotes = [...(task.roleNotes || [])];
        if (isCompleting && notes) {
          const newNote: TaskNote = {
            role: (user?.role as TaskRole) || task.role,
            message: notes,
            timestamp,
            author: user?.name || 'Team Member'
          };
          roleNotes.push(newNote);
        }

        // 2. Handle Handoff Logic
        let nextAssignment = {};
        if (isCompleting && nextRoleMember) {
          nextAssignment = {
            status: 'pending', // Reset for next person
            assignedTo: nextRoleMember.name,
            role: nextRoleMember.role as TaskRole,
            forwardedBy: user?.name || task.assignedTo
          };
          
          addNotification({
            type: 'handoff',
            title: 'Task Handed Off',
            message: `"${task.title}" handed off to ${nextRoleMember.name}.`,
            actor: user?.name || 'Team Member',
            targetId: task.id,
            targetType: 'task'
          });
        } else if (isCompleting) {
          addNotification({
            type: 'task_completed',
            title: 'Task Completed',
            message: `"${task.title}" has been finalized.`,
            actor: user?.name || 'Team Member',
            targetId: task.id,
            targetType: 'task'
          });
        }

        // 3. Prepare Audit Log
        const log: ActivityLog = {
          id: `log-${Date.now()}`,
          status: updates.status || task.status,
          userId: user?.id || 'system',
          role: user?.role || 'system',
          timestamp,
          note: notes
        };

        return {
          ...task,
          ...updates,
          ...nextAssignment,
          roleNotes,
          screenshot: screenshot || task.screenshot,
          activityLogs: [...(task.activityLogs || []), log]
        };
      });
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getTasksByRole = (role: TaskRole) => {
    return tasks.filter(t => t.role === role);
  };

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = (type?: string) => {
    if (type === 'all') {
      setNotifications([]);
    } else {
      setNotifications(prev => prev.filter(n => n.read === false));
    }
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      notifications, 
      addTask, 
      updateTask, 
      deleteTask, 
      getTasksByRole,
      markNotifRead,
      clearNotifications
    }}>
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
