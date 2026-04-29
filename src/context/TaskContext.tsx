'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskStatus, TaskRole, Notification } from '@/lib/types';

interface TaskContextType {
  tasks: Task[];
  notifications: Notification[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByRole: (role: TaskRole) => Task[];
  markNotifRead: (id: string) => void;
  clearNotifications: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const DEMO_VERSION = 'v1.5';

export const initialTasks: Task[] = [
  // 1. SPRING COLLECTION LAUNCH
  {
    id: 's1', title: 'Studio Photography: New Arrival Lineup', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'Luxe Apparel', campaign: 'Spring Collection Launch', campaignId: 'c_spring',
    deadline: '2026-04-20', status: 'SHOOTER_DONE', priority: 'high',
    description: 'Capture the full spring line-up in the studio.',
    forwardedBy: 'Marco Reyes',
    shooterNotes: 'Uploaded 50+ raw shots. The lighting was set to "Warm Morning".',
    roleNotes: [{ role: 'Shooter', message: 'Uploaded 50+ raw shots. The lighting was set to "Warm Morning".', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Marco Reyes' }],
    previousNotes: 'SHOOTER: Uploaded 50+ raw shots.'
  },
  {
    id: 's2', title: 'Cinematic Teaser Edit: Spring Lookbook', assignedTo: 'Jin Park',
    role: 'Editor', client: 'Luxe Apparel', campaign: 'Spring Collection Launch', campaignId: 'c_spring',
    deadline: '2026-04-25', status: 'in_progress', priority: 'high',
    description: 'Create a cinematic 30s teaser from the studio shots.',
    fromShooter: 'Marco Reyes',
    forwardedBy: 'Marco Reyes',
    roleNotes: [{ role: 'Shooter', message: 'Uploaded 50+ raw shots.', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Marco Reyes' }],
    previousNotes: 'SHOOTER: Uploaded 50+ raw shots.'
  },
  {
    id: 's3', title: 'Facebook & IG Ad Setup: Spring Launch', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'Luxe Apparel', campaign: 'Spring Collection Launch', campaignId: 'c_spring',
    deadline: '2026-05-01', status: 'pending', priority: 'medium',
    description: 'Setup and deploy Meta ads for the Spring collection.',
    forwardedBy: 'Jin Park',
    roleNotes: [
      { role: 'Shooter', message: 'Uploaded 50+ raw shots.', timestamp: new Date(Date.now() - 259200000).toISOString(), author: 'Marco Reyes' },
      { role: 'Editor', message: 'Promo edit finalized with brand colors.', timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'Jin Park' }
    ],
    previousNotes: 'Waiting for Editor to complete edit.'
  },

  // 2. CYBER-WEEK SALE
  {
    id: 'w1', title: 'Product Promo Montage: Cyber Deals', assignedTo: 'Jin Park',
    role: 'Editor', client: 'TechWorld', campaign: 'Cyber-Week Sale', campaignId: 'c_cyber',
    deadline: '2026-04-10', status: 'EDITOR_DONE', priority: 'high',
    description: 'Fast-paced promo video with discount text overlays.',
    nextRole: 'Ads Manager',
    forwardedBy: 'Jin Park',
    editorNotes: 'Final render complete. All formats (9:16, 16:9, 1:1) delivered.',
    roleNotes: [
      { role: 'Shooter', message: 'Studio shots of products complete.', timestamp: new Date(Date.now() - 345600000).toISOString(), author: 'Marco Reyes' },
      { role: 'Editor', message: 'Final render complete.', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Jin Park' }
    ],
    previousNotes: 'SHOOTER: Studio shots of products complete.\n\nEDITOR: Final render complete.'
  },
  {
    id: 'w2', title: 'Multi-Channel Campaign Deployment: Cyber-Week', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'TechWorld', campaign: 'Cyber-Week Sale', campaignId: 'c_cyber',
    deadline: '2026-05-01', status: 'in_progress', priority: 'high',
    description: 'Scaling ads across Meta, TikTok, and Google.',
    forwardedBy: 'Jin Park',
    platform: 'Meta', budget: 15000, spent: 4500, leads: 820,
    roleNotes: [
      { role: 'Shooter', message: 'Product photography finished.', timestamp: new Date(Date.now() - 345600000).toISOString(), author: 'Marco Reyes' },
      { role: 'Editor', message: 'Vertical and horizontal edits delivered.', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Jin Park' }
    ],
    previousNotes: 'EDITOR: Final versions delivered for all platforms.'
  },

  // 3. VELOCITY MOTORS
  {
    id: 'c1', title: 'Drone Footage Capture: GT-Series Track Day', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'Velocity Motors', campaign: 'GT Showcase', campaignId: 'c_gt',
    deadline: '2026-04-15', status: 'SHOOTER_DONE', priority: 'high',
    description: 'Drone and gimbal shots of the GT series on the track.',
    forwardedBy: 'Marco Reyes',
    shooterNotes: '4K 60fps footage uploaded. Some great lens flare shots included.',
    roleNotes: [{ role: 'Shooter', message: '4K 60fps footage uploaded.', timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'Marco Reyes' }],
    previousNotes: 'SHOOTER: 4K 60fps footage uploaded.'
  },
  {
    id: 'c2', title: 'High-Octane Commercial Edit: GT Series', assignedTo: 'Jin Park',
    role: 'Editor', client: 'Velocity Motors', campaign: 'GT Showcase', campaignId: 'c_gt',
    deadline: '2026-04-28', status: 'in_progress', priority: 'high',
    description: 'Heavy sound design and color grading for the track footage.',
    fromShooter: 'Marco Reyes',
    forwardedBy: 'Marco Reyes',
    roleNotes: [{ role: 'Shooter', message: '4K 60fps footage uploaded.', timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'Marco Reyes' }],
    previousNotes: 'SHOOTER: 4K 60fps footage uploaded.'
  },

  // 4. ACTIVE SHOOT
  {
    id: 'e1', title: 'Macro Texture Shots: Sustainable Packaging', assignedTo: 'Marco Reyes',
    role: 'Shooter', client: 'GreenRoot', campaign: 'Eco Rebrand', campaignId: 'c_eco',
    deadline: '2026-05-05', status: 'in_progress', priority: 'medium',
    description: 'Macro shots of the new recycled paper packaging texture.'
  },

  // 5. COMPLETED REPORT
  {
    id: 't2', title: 'Q2 Performance Audit & Optimization', assignedTo: 'Sofia Nguyen',
    role: 'Ads Manager', client: 'GreenRoot', campaign: 'GreenRoot Q2', campaignId: 'c_green',
    deadline: '2026-04-10', status: 'completed', priority: 'low',
    description: 'Review Meta ad performance for Q2.',
    platform: 'Meta', budget: 1000, spent: 1000, leads: 52,
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    roleNotes: [
      { role: 'Shooter', message: 'Raw packaging assets delivered.', timestamp: new Date(Date.now() - 259200000).toISOString(), author: 'Marco Reyes' },
      { role: 'Editor', message: 'Cleaned and resized for web.', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Jin Park' },
      { role: 'Ads Manager', message: 'Audit complete. Urban demographic leads were high.', timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'Sofia Nguyen' }
    ],
    notes: 'Strong performance in urban demographics.'
  }
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem('agencyflow_demo_version');
      const savedTasks = localStorage.getItem('agencyflow_tasks');
      
      if (savedVersion !== DEMO_VERSION || !savedTasks) {
        localStorage.setItem('agencyflow_tasks', JSON.stringify(initialTasks));
        localStorage.setItem('agencyflow_demo_version', DEMO_VERSION);
        return initialTasks;
      }
      return JSON.parse(savedTasks);
    }
    return initialTasks;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem('agencyflow_notif_version');
      const savedNotifs = localStorage.getItem('agencyflow_notifications');
      
      if (savedVersion !== DEMO_VERSION || !savedNotifs) {
        const initialNotifs = [
          { id: 'n1', type: 'task_assigned', title: 'New task assigned', message: 'You have been assigned "Drone Footage Capture: GT-Series Track Day".', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, actor: 'Manager', targetId: 'c1', targetType: 'task' },
          { id: 'n2', type: 'handoff', title: 'Task handed off to you', message: 'Marco Reyes completed shooting for Spring Collection. Ready for editing.', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, actor: 'Marco Reyes', targetId: 's1', targetType: 'task' },
          { id: 'n3', type: 'task_completed', title: 'Task completed', message: 'Sofia Nguyen completed "Q2 Performance Audit & Optimization".', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, actor: 'Sofia Nguyen', targetId: 't2', targetType: 'task' },
        ];
        localStorage.setItem('agencyflow_notifications', JSON.stringify(initialNotifs));
        localStorage.setItem('agencyflow_notif_version', DEMO_VERSION);
        return initialNotifs;
      }
      return JSON.parse(savedNotifs);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('agencyflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('agencyflow_notifications', JSON.stringify(notifications));
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
    const newTask = { ...task, id: `t${Date.now()}` };
    setTasks((prev) => [newTask, ...prev]);
    
    addNotification({
      type: 'task_assigned',
      title: 'New task assigned',
      message: `You have been assigned "${newTask.title}" for ${newTask.campaign}.`,
      actor: 'Manager',
      targetId: newTask.id,
      targetType: 'task'
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      
      const updatedTask = { ...t, ...updates };
      
      if (updates.status && updates.status !== t.status) {
        if (updates.status === 'SHOOTER_DONE' && updatedTask.nextRole === 'Editor') {
          updatedTask.role = 'Editor';
          updatedTask.status = 'pending';
          addNotification({
            type: 'handoff',
            title: 'Shooting Complete: Ready for Edit',
            message: `Task: ${t.title} is ready for processing.`,
            actor: t.assignedTo || 'Unassigned',
            targetId: t.id,
            targetType: 'task'
          });
        }
        else if (updates.status === 'EDITOR_DONE' && updatedTask.nextRole === 'Ads Manager') {
          updatedTask.role = 'Ads Manager';
          updatedTask.status = 'pending';
          addNotification({
            type: 'handoff',
            title: 'Editing Complete: Ready for Ads',
            message: `Task: ${t.title} is ready for deployment.`,
            actor: t.assignedTo || 'Unassigned',
            targetId: t.id,
            targetType: 'task'
          });
        }
        else if (updates.status === 'completed') {
          addNotification({
            type: 'task_completed',
            title: 'Task Fully Completed',
            message: `"${t.title}" has been finalized.`,
            actor: t.assignedTo || 'Unassigned',
            targetId: t.id,
            targetType: 'task'
          });
        }
      }
      return updatedTask;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const getTasksByRole = (role: TaskRole) => {
    return tasks.filter((t) => t.role === role);
  };

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
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
