'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTask } from '@/contexts/TaskContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TaskList from '@/components/tasks/TaskList'
import TaskForm from '@/components/tasks/TaskForm'
import ManagerTimeView from '@/components/time-tracker/ManagerTimeView'
import TaskTrendChart from '@/components/dashboard/TaskTrendChart'
import { Plus, Bug, Clock, CheckCircle, AlertCircle, Users, LogOut } from 'lucide-react'

export default function ManagerDashboard() {
  const { user, logout } = useAuth()
  const { tasks, getTaskStats } = useTask()
  const [showTaskForm, setShowTaskForm] = useState(false)
  
  const taskStats = getTaskStats()
  const totalTasks = tasks.length
  const pendingApproval = tasks.filter(task => task.status === 'pending-approval')

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Manager Dashboard
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="border-l-4 border-l-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{taskStats.open}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{taskStats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Bug className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{taskStats.pendingApproval}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{taskStats.closed}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <TaskTrendChart />
      </div>

      <Tabs defaultValue="all-tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="pending-approval">
            Pending Approval ({pendingApproval.length})
          </TabsTrigger>
          <TabsTrigger value="time-management">Time Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-tasks">
          <TaskList tasks={tasks} userRole="manager" />
        </TabsContent>
        
        <TabsContent value="pending-approval">
          <TaskList tasks={pendingApproval} userRole="manager" />
        </TabsContent>
        
        <TabsContent value="time-management">
          <ManagerTimeView />
        </TabsContent>
      </Tabs>

      
      {showTaskForm && (
        <TaskForm onClose={() => setShowTaskForm(false)} />
      )}
    </div>
  )
}
