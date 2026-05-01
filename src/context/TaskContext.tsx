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

export const DEMO_VERSION = 'v1.9'; // Incremented to force fresh data sync with 12 tasks

export const INITIAL_TASKS: Task[] = [
  // --- SHOOTER TASKS ---
  {
    id: 't1', title: 'Product Shoot: Summer Footwear', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'Luxe Apparel', campaign: 'Summer Collection',
    deadline: '2026-05-10', status: 'pending', priority: 'high',
    description: 'Capture detailed shots of the upcoming footwear line.'
  },
  {
    id: 't2', title: 'Lifestyle Photography: Beach Vibes', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'Luxe Apparel', campaign: 'Summer Collection',
    deadline: '2026-05-12', status: 'in_progress', priority: 'medium',
    description: 'Outdoor shoot at Santa Monica beach.'
  },
  {
    id: 't3', title: 'Studio Session: Accessory Closeups', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'TechWorld', campaign: 'Cyber-Week Sale',
    deadline: '2026-04-20', status: 'completed', priority: 'low',
    description: 'Focus on small gadgets and accessories.',
    roleNotes: [{ role: 'Shooter', message: 'All raws uploaded to the main server.', timestamp: new Date(Date.now() - 864000000).toISOString(), author: 'Marco Reyes' }]
  },

  // --- EDITOR TASKS ---
  {
    id: 't4', title: 'Color Grading: Spring Lookbook', assignedTo: 'Jin Park',
    role: 'Editor', client: 'Luxe Apparel', campaign: 'Spring Launch',
    deadline: '2026-05-15', status: 'pending', priority: 'high',
    description: 'Apply the warm morning preset to all shots.'
  },
  {
    id: 't5', title: 'Reel Edit: 15s Product Teaser', assignedTo: 'Jin Park',
    role: 'Editor', client: 'TechWorld', campaign: 'Cyber-Week Sale',
    deadline: '2026-05-18', status: 'in_progress', priority: 'medium',
    description: 'Fast-paced edit with energetic music.'
  },
  {
    id: 't6', title: 'Final Export: Cinematic Campaign Video', assignedTo: 'Jin Park',
    role: 'Editor', client: 'Global Fit', campaign: 'Brand Awareness',
    deadline: '2026-04-25', status: 'completed', priority: 'high',
    description: 'Deliver in 4K for YouTube and 1080p for IG.',
    roleNotes: [
      { role: 'Shooter', message: 'Raw footage provided.', timestamp: new Date(Date.now() - 1728000000).toISOString(), author: 'Marco Reyes' },
      { role: 'Editor', message: 'Final exports uploaded to Dropbox.', timestamp: new Date(Date.now() - 864000000).toISOString(), author: 'Jin Park' }
    ]
  },

  // --- ADS MANAGER TASKS ---
  {
    id: 't7', title: 'Ad Set Creation: Meta Conversion Ads', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'Luxe Apparel', campaign: 'Summer Sale',
    deadline: '2026-05-20', status: 'pending', priority: 'high',
    description: 'Targeting women aged 18-35 interested in sustainable fashion.'
  },
  {
    id: 't8', title: 'Budget Optimization: Google Search Ads', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'TechWorld', campaign: 'Electronics Extravaganza',
    deadline: '2026-05-22', status: 'in_progress', priority: 'medium',
    description: 'Adjusting bids based on top performing keywords.'
  },
  {
    id: 't9', title: 'Performance Audit: Q1 Meta Retargeting', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'Beauty Glow', campaign: 'Always-On Retargeting',
    deadline: '2026-04-28', status: 'completed', priority: 'low',
    description: 'Analyze pixel performance and ROAS.',
    roleNotes: [{ role: 'Ads Manager', message: 'ROAS improved by 20% after audience refresh.', timestamp: new Date(Date.now() - 432000000).toISOString(), author: 'Sofia Nguyen' }]
  },

  // --- MANAGER TASKS ---
  {
    id: 't10', title: 'Client Strategy Meeting: Q3 Roadmap', assignedTo: 'Priya Sharma',
    role: 'Manager', client: 'Luxe Apparel', campaign: 'Q3 Strategy',
    deadline: '2026-05-25', status: 'pending', priority: 'high',
    description: 'Drafting the marketing objectives for the next quarter.'
  },
  {
    id: 't11', title: 'Resource Planning: New Hire Onboarding', assignedTo: 'Priya Sharma',
    role: 'Manager', client: 'Internal', campaign: 'Team Growth',
    deadline: '2026-05-28', status: 'in_progress', priority: 'medium',
    description: 'Finalizing the training modules for new editors.'
  },
  {
    id: 't12', title: 'Contract Renewal: TechWorld Partnership', assignedTo: 'Priya Sharma',
    role: 'Manager', client: 'TechWorld', campaign: 'Account Management',
    deadline: '2026-04-30', status: 'completed', priority: 'high',
    description: 'Review and sign the annual service agreement.',
    roleNotes: [{ role: 'Manager', message: 'Agreement signed and uploaded to legal folder.', timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'Priya Sharma' }]
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
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    const isCompleting = updates.status === 'completed' && taskToUpdate.status !== 'completed';
    let pendingNotification: any = null;

    if (isCompleting && nextRoleMember) {
      pendingNotification = {
        type: 'handoff',
        title: 'Task Handed Off',
        message: `"${taskToUpdate.title}" handed off to ${nextRoleMember.name}.`,
        actor: user?.name || 'Team Member',
        targetId: taskToUpdate.id,
        targetType: 'task'
      };
    } else if (isCompleting) {
      pendingNotification = {
        type: 'task_completed',
        title: 'Task Completed',
        message: `"${taskToUpdate.title}" has been finalized.`,
        actor: user?.name || 'Team Member',
        targetId: taskToUpdate.id,
        targetType: 'task'
      };
    }

    // 2. Perform the Task Update
    setTasks(prev => {
      return prev.map(task => {
        if (task.id !== id) return task;

        const timestamp = new Date().toISOString();
        
        // Prepare Role Notes
        let roleNotes = [...(task.roleNotes || [])];
        if (isCompleting && notes) {
          const newNote: TaskNote = {
            role: task.role,
            message: notes,
            timestamp,
            author: user?.name || 'Team Member'
          };
          roleNotes.push(newNote);
        }

        // Handle Handoff Data
        let nextAssignment = {};
        if (isCompleting && nextRoleMember) {
          nextAssignment = {
            status: 'pending',
            assignedTo: nextRoleMember.name,
            role: nextRoleMember.role as TaskRole,
            forwardedBy: user?.name || task.assignedTo
          };
        }

        // Prepare Audit Log
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

    // 3. Add the notification if one was prepared
    if (pendingNotification) {
      addNotification(pendingNotification);
    }
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
