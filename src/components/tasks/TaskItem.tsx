'use client'

import { useState } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  User, 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Tag
} from 'lucide-react'
import TaskForm from './TaskForm'
import type { Task } from '@/contexts/TaskContext'

interface TaskItemProps {
  task: Task
  userRole: 'developer' | 'manager'
}

export default function TaskItem({ task, userRole }: TaskItemProps) {
  const { updateTask, deleteTask } = useTask()
  const { user } = useAuth()
  const [showEditForm, setShowEditForm] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'closed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending-approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const canEdit = userRole === 'developer' && task.assignee === user?.id
  const canDelete = userRole === 'developer' && task.assignee === user?.id
  const canClose = userRole === 'developer' && task.assignee === user?.id && 
                   (task.status === 'open' || task.status === 'in-progress')
  const canApprove = userRole === 'manager' && task.status === 'pending-approval'

  const handleStatusChange = (newStatus: string) => {
    updateTask(task.id, { status: newStatus as any })
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id)
    }
  }

  const progressPercentage = task.estimatedTime ? 
    Math.min((task.timeSpent / task.estimatedTime) * 100, 100) : 0

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{task.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(task.status)}>
                  {formatStatus(task.status)}
                </Badge>
                {task.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {canEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>Assigned to: {task.assigneeName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>Reporter: {task.reporterName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Created: {task.createdAt.toLocaleDateString()}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Due: {task.dueDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Time Progress */}
          {task.estimatedTime && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Time Progress</span>
                <span className="text-sm text-gray-600">
                  {Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m / {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {canClose && (
              <Button 
                size="sm" 
                onClick={() => handleStatusChange('pending-approval')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Close for Review
              </Button>
            )}
            
            {canApprove && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handleStatusChange('closed')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange('in-progress')}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reopen
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showEditForm && (
        <TaskForm 
          task={task}
          onClose={() => setShowEditForm(false)} 
        />
      )}
    </>
  )
}