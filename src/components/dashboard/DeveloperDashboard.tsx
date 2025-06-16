'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTask } from '@/contexts/TaskContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import TaskList from '@/components/tasks/TaskList'
import TaskForm from '@/components/tasks/TaskForm'
import TimeTracker from '@/components/time-tracker/TimeTracker'
import { Plus, Bug, Clock, CheckCircle, AlertCircle, User, LogOut } from 'lucide-react'

export default function DeveloperDashboard() {
  const { user, logout } = useAuth()
  const { getTasksByUser, getTaskStats } = useTask()
  const [showTaskForm, setShowTaskForm] = useState(false)
  
  const userTasks = getTasksByUser(user?.id || '')
  const taskStats = getTaskStats()
  
  const userTaskStats = userTasks.reduce((acc, task) => {
    if (task.status === 'open') acc.open++
    else if (task.status === 'in-progress') acc.inProgress++
    else if (task.status === 'closed') acc.closed++
    else if (task.status === 'pending-approval') acc.pendingApproval++
    return acc
  }, { open: 0, inProgress: 0, closed: 0, pendingApproval: 0 })

  const totalTasks = userTasks.length
  const completedTasks = userTaskStats.closed + userTaskStats.pendingApproval
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Developer Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowTaskForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userTaskStats.open}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{userTaskStats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Bug className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{userTaskStats.pendingApproval}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userTaskStats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Your Progress
          </CardTitle>
          <CardDescription>
            Task completion rate: {completionRate.toFixed(1)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="time">Time Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <TaskList tasks={userTasks} userRole="developer" />
        </TabsContent>
        
        <TabsContent value="time">
          <TimeTracker />
        </TabsContent>
      </Tabs>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm onClose={() => setShowTaskForm(false)} />
      )}
    </div>
  )
}