'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

export interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'closed' | 'pending-approval'
  assignee: string
  assigneeName: string
  reporter: string
  reporterName: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  tags: string[]
  timeSpent: number // in minutes
  estimatedTime?: number // in minutes
}

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  userName: string
  duration: number // in minutes
  description: string
  date: Date
}

interface TaskContextType {
  tasks: Task[]
  timeEntries: TimeEntry[]
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void
  getTasksByUser: (userId: string) => Task[]
  getTimeEntriesByTask: (taskId: string) => TimeEntry[]
  getTaskStats: () => { open: number; inProgress: number; closed: number; pendingApproval: number }
  getDailyTaskTrend: () => { date: string; tasks: number }[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Fix login authentication bug',
    description: 'Users are unable to login with correct credentials',
    priority: 'high',
    status: 'in-progress',
    assignee: '1',
    assigneeName: 'John Developer',
    reporter: '2',
    reporterName: 'Jane Manager',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    dueDate: new Date('2024-01-20'),
    tags: ['bug', 'authentication'],
    timeSpent: 120,
    estimatedTime: 240
  },
  {
    id: '2',
    title: 'Implement dark mode',
    description: 'Add dark mode support to the application',
    priority: 'medium',
    status: 'open',
    assignee: '3',
    assigneeName: 'Bob Developer',
    reporter: '2',
    reporterName: 'Jane Manager',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    dueDate: new Date('2024-01-25'),
    tags: ['feature', 'ui'],
    timeSpent: 45,
    estimatedTime: 480
  },
  {
    id: '3',
    title: 'Database performance optimization',
    description: 'Optimize slow database queries',
    priority: 'critical',
    status: 'pending-approval',
    assignee: '1',
    assigneeName: 'John Developer',
    reporter: '2',
    reporterName: 'Jane Manager',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-17'),
    tags: ['performance', 'database'],
    timeSpent: 360,
    estimatedTime: 600
  }
]

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    taskId: '1',
    userId: '1',
    userName: 'John Developer',
    duration: 120,
    description: 'Investigated authentication flow',
    date: new Date('2024-01-16')
  },
  {
    id: '2',
    taskId: '2',
    userId: '3',
    userName: 'Bob Developer',
    duration: 45,
    description: 'Research dark mode implementation',
    date: new Date('2024-01-14')
  },
  {
    id: '3',
    taskId: '3',
    userId: '1',
    userName: 'John Developer',
    duration: 360,
    description: 'Database query optimization',
    date: new Date('2024-01-17')
  }
]

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries)
  const { user } = useAuth()

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setTasks(prev => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
    setTimeEntries(prev => prev.filter(entry => entry.taskId !== id))
  }

  const addTimeEntry = (entryData: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: Date.now().toString()
    }
    setTimeEntries(prev => [...prev, newEntry])
    
    // Update task time spent
    const totalTime = [...timeEntries, newEntry]
      .filter(entry => entry.taskId === entryData.taskId)
      .reduce((sum, entry) => sum + entry.duration, 0)
    
    updateTask(entryData.taskId, { timeSpent: totalTime })
  }

  const getTasksByUser = (userId: string) => {
    return tasks.filter(task => task.assignee === userId)
  }

  const getTimeEntriesByTask = (taskId: string) => {
    return timeEntries.filter(entry => entry.taskId === taskId)
  }

  const getTaskStats = () => {
    const stats = tasks.reduce((acc, task) => {
      if (task.status === 'open') acc.open++
      else if (task.status === 'in-progress') acc.inProgress++
      else if (task.status === 'closed') acc.closed++
      else if (task.status === 'pending-approval') acc.pendingApproval++
      return acc
    }, { open: 0, inProgress: 0, closed: 0, pendingApproval: 0 })
    
    return stats
  }

  const getDailyTaskTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => ({
      date,
      tasks: Math.floor(Math.random() * 10) + 1 // Mock data
    }))
  }

  return (
    <TaskContext.Provider value={{
      tasks,
      timeEntries,
      createTask,
      updateTask,
      deleteTask,
      addTimeEntry,
      getTasksByUser,
      getTimeEntriesByTask,
      getTaskStats,
      getDailyTaskTrend
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}