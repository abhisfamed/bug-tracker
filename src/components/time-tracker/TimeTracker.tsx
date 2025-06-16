'use client'

import { useState } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Plus, Timer } from 'lucide-react'

export default function TimeTracker() {
  const { user } = useAuth()
  const { getTasksByUser, addTimeEntry, getTimeEntriesByTask } = useTask()
  const [selectedTask, setSelectedTask] = useState('')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  
  const userTasks = getTasksByUser(user?.id || '')
  const openTasks = userTasks.filter(task => 
    task.status === 'open' || task.status === 'in-progress'
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || !duration) return

    addTimeEntry({
      taskId: selectedTask,
      userId: user?.id || '',
      userName: user?.name || '',
      duration: parseInt(duration),
      description,
      date: new Date()
    })

    setSelectedTask('')
    setDuration('')
    setDescription('')
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Time Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Log Time Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task">Task</Label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {openTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you work on?"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={!selectedTask || !duration}>
              <Clock className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Task Time Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Timer className="h-5 w-5 mr-2" />
            Your Task Time Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks assigned to you.</p>
            ) : (
              userTasks.map(task => {
                const timeEntries = getTimeEntriesByTask(task.id)
                const totalTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
                const progressPercentage = task.estimatedTime ? 
                  Math.min((totalTime / task.estimatedTime) * 100, 100) : 0

                return (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline">
                        {formatTime(totalTime)}
                      </Badge>
                    </div>
                    
                    {task.estimatedTime && (
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{formatTime(totalTime)} / {formatTime(task.estimatedTime)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {timeEntries.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">Recent Entries:</h4>
                        <div className="space-y-1">
                          {timeEntries.slice(-3).map(entry => (
                            <div key={entry.id} className="text-sm text-gray-600 flex justify-between">
                              <span>{entry.description || 'No description'}</span>
                              <span>{formatTime(entry.duration)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}