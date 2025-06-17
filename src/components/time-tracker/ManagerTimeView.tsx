'use client'

import { useTask } from '@/contexts/TaskContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Clock, TrendingUp } from 'lucide-react'

export default function ManagerTimeView() {
  const { tasks, timeEntries } = useTask()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const timeByUser = timeEntries.reduce((acc, entry) => {
    if (!acc[entry.userId]) {
      acc[entry.userId] = {
        userName: entry.userName,
        totalTime: 0,
        taskCount: new Set()
      }
    }
    acc[entry.userId].totalTime += entry.duration
    acc[entry.userId].taskCount.add(entry.taskId)
    return acc
  }, {} as Record<string, { userName: string; totalTime: number; taskCount: Set<string> }>)

  const userStats = Object.entries(timeByUser).map(([userId, data]) => ({
    userId,
    userName: data.userName,
    totalTime: data.totalTime,
    taskCount: data.taskCount.size
  }))

  const taskTimeAnalysis = tasks.map(task => {
    const taskEntries = timeEntries.filter(entry => entry.taskId === task.id)
    const totalTime = taskEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const progressPercentage = task.estimatedTime ? 
      Math.min((totalTime / task.estimatedTime) * 100, 100) : 0

    return {
      ...task,
      actualTime: totalTime,
      progressPercentage,
      isOverEstimate: task.estimatedTime ? totalTime > task.estimatedTime : false
    }
  }).sort((a, b) => b.actualTime - a.actualTime)

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-purple-100 text-purple-800'
      case 'closed': return 'bg-green-100 text-green-800'
      case 'pending-approval': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Developer Time Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStats.map(user => (
              <div key={user.userId} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{user.userName}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Time:</span>
                    <Badge variant="outline">{formatTime(user.totalTime)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Tasks:</span>
                    <Badge variant="outline">{user.taskCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg per Task:</span>
                    <Badge variant="outline">
                      {user.taskCount > 0 ? formatTime(Math.round(user.totalTime / user.taskCount)) : '0h 0m'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Task Time Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taskTimeAnalysis.map(task => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-600">Assigned to: {task.assigneeName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {formatTime(task.actualTime)}
                    </Badge>
                    {task.isOverEstimate && (
                      <Badge variant="destructive">Over Estimate</Badge>
                    )}
                  </div>
                </div>

                {task.estimatedTime && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress vs Estimate</span>
                      <span>
                        {formatTime(task.actualTime)} / {formatTime(task.estimatedTime)}
                      </span>
                    </div>
                    <Progress 
                      value={task.progressPercentage} 
                      className={`h-2 ${task.isOverEstimate ? 'bg-red-100' : ''}`}
                    />
                    <div className="text-xs text-gray-500">
                      {task.progressPercentage.toFixed(1)}% of estimated time used
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <Badge className={getStatusBadgeClass(task.status)}>
                    {task.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getPriorityBadgeClass(task.priority)}>
                    {task.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Time Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeEntries.reduce((sum, entry) => sum + entry.duration, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Time Logged</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.estimatedTime && t.timeSpent <= t.estimatedTime).length}
              </div>
              <div className="text-sm text-gray-600">Tasks on Track</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {tasks.filter(t => t.estimatedTime && t.timeSpent > t.estimatedTime).length}
              </div>
              <div className="text-sm text-gray-600">Tasks Over Estimate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
