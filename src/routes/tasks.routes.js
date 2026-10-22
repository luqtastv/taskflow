import { Router } from 'express'
import { getAllTasks, createTask, getTaskById, updateTask, updateTaskState, deleteTask } from '../controllers/tasks.contollers.js'

export const router = Router()

router.route('/tasks')
    .get(getAllTasks)
    .post(createTask)

router.route('/tasks/:id')
    .get(getTaskById)
    .put(updateTask)
    .patch(updateTaskState)
    .delete(deleteTask)