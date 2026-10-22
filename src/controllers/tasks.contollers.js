import { allowedStates } from '../data/tasks.js'
import { pool } from '../db.js'
import { nanoid } from 'nanoid'

function isValidBody(body) {
    return (
        body !== null &&
        typeof body === 'object' &&
        !Array.isArray(body) &&
        Object.keys(body).length > 0
    )
}

export async function getAllTasks(_, res) {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC')
        return res.status(200).json({ message: 'GET /tasks', status: res.statusCode, data: result.rows })
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return res.status(500).json({ message: 'Internal server error', status: res.statusCode, data: null })
    }
}

export async function createTask(req, res) {
    if (!isValidBody(req.body)) {
        return res.status(400).json({ message: 'Request body is required', status: 400 })
    }
    
    const { title, description } = req.body

    if (!title || !description || typeof title !== 'string' || typeof description !== 'string' || title.trim() === '' || description.trim() === '') {
        return res.status(400).json({ message: 'Title and description are required', status: 400 })
    }

    const trimmedTitle = title.trim().toLowerCase()

    try {
        const newTaskId = nanoid()
        const createdAt = new Date().toISOString()
        const updatedAt = createdAt

        const result = await pool.query(
            'INSERT INTO tasks (id, title, description, state, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [newTaskId, trimmedTitle, description, 'pending', createdAt, updatedAt]
        )

        res.status(201).json({ message: 'Task created successfully', status: res.statusCode, data: result.rows[0] })
    } catch (error) {
        if (error.code === '23505') { // Unique violation error code
            return res.status(409).json({ message: 'Task with this title already exists', status: 409 })
        } 
        console.error('Error creating task:', error)
        return res.status(500).json({ message: 'Internal server error', status: res.statusCode, data: null })
    }
}

export async function getTaskById(req, res) {
    const { id } = req.params

    try {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found', status: 404, data: null })
        }

        res.status(200).json({ message: `GET /tasks/${id}`, status: res.statusCode, data: result.rows[0] })
    } catch (error) {
        console.error('Error fetching task by ID:', error)
        return res.status(500).json({ message: 'Internal server error', status: res.statusCode, data: null })
    }
}

export async function updateTask(req, res) {
    const { id } = req.params

    if (!isValidBody(req.body)) {
        return res.status(400).json({ message: 'Request body is required', status: 400 })
    }

    const { title, description, state } = req.body

    try {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found', status: 404, data: null })
        }

        const task = result.rows[0]

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ message: 'Title must be a non-empty string', status: 400 })
        }

        const trimmedTitle = title.trim().toLowerCase()
        const titleExists = await pool.query('SELECT * FROM tasks WHERE LOWER(title) = $1 AND id <> $2', [trimmedTitle, id])
        if (titleExists.rows.length > 0) {
            return res.status(409).json({ message: 'Task with this title already exists', status: 400 })
        }

        if (!description || typeof description !== 'string' || description.trim() === '') {
            return res.status(400).json({ message: 'Description must be a non-empty string', status: 400 })
        }

        if (!state || typeof state !== 'string' || !allowedStates.includes(state)) {
            return res.status(400).json({ message: 'Invalid state. Allowed states are: pending, in-progress, completed', status: 400 })
        }

        const updatedAt = new Date().toISOString()

        const updateResult = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, state = $3, updated_at = $4 WHERE id = $5 RETURNING *',
            [trimmedTitle, description.trim(), state, updatedAt, id]
        )

        res.status(200).json({ message: 'Task updated successfully', status: res.statusCode, data: updateResult.rows[0] })
    } catch (error) {
        console.error('Error updating task:', error)
        return res.status(500).json({ message: 'Internal server error', status: res.statusCode, data: null })
    }
}

export async function updateTaskState(req, res) {
    const { id } = req.params

    if (!isValidBody(req.body)) {
        return res.status(400).json({ message: 'Request body is required', status: 400 })
    }

    const { state } = req.body

    try {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found', status: 404, data: null })
        }

        if (!state || typeof state !== 'string' || !allowedStates.includes(state)) {
            return res.status(400).json({ message: 'Invalid state. Allowed states are: pending, in-progress, completed', status: 400 })
        }

        const updatedAt = new Date().toISOString()

        const updateResult = await pool.query(
            'UPDATE tasks SET state = $1, updated_at = $2 WHERE id = $3 RETURNING *',
            [state, updatedAt, id]
        )

        res.status(200).json({ message: 'Task state updated successfully', status: res.statusCode, data: updateResult.rows[0] })
    } catch (error) {
        console.error('Error updating task state:', error)
        return res.status(500).json({ message: 'Internal server error', status: res.statusCode, data: null })
    }
}

export async function deleteTask(req, res) {
    const { id } = req.params

    try {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found', status: 404, data: null })
        }

        await pool.query('DELETE FROM tasks WHERE id = $1', [id])

        res.status(200).json({ message: `Task deleted successfully id: ${id}`, status: res.statusCode, data: null })
    } catch (error) {
        console.error('Error deleting task:', error)
        return res.status(500).json({ message: 'Internal server error', status: res.statusCode, data: null })
    }
}
