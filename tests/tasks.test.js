import { beforeEach, afterAll, expect, test } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import {pool} from '../src/db.js'

beforeEach(async () => {
    await pool.query('TRUNCATE TABLE tasks')
})

afterAll(async () => {
    await pool.end()
})

test('GET /tasks should return all tasks', async () => {
    const response = await request(app).get('/tasks')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data')
    expect(Array.isArray(response.body.data)).toBe(true)
})

test('POST /tasks should create a new task', async () => {
    const newTask = {
        title: 'New Task',
        description: 'This is a new task'
    }

    const response = await request(app).post('/tasks').send(newTask)
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data).toHaveProperty('id')
    expect(response.body.data.title).toBe(newTask.title.toLowerCase())
    expect(response.body.data.description).toBe(newTask.description)
})

test('POST /tasks should return 400 if title or description is missing', async () => {
    const newTask = {
        title: 'Incomplete Task'
    }

    const response = await request(app).post('/tasks').send(newTask)
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message')
})

test('POST /tasks should return 409 if task with the same title already exists', async () => {
    const newTask = {
        title: 'Duplicate Task',
        description: 'This is a duplicate task'
    }

    await request(app).post('/tasks').send(newTask)

    const response = await request(app).post('/tasks').send(newTask)
    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('message')
})

// Task/:id tests

test('GET /tasks/:id should return a specific task', async () => {
    const newTask = {
        title: 'Another Task',
        description: 'This is another task'
    }

    const postResponse = await request(app).post('/tasks').send(newTask)
    const taskId = postResponse.body.data.id

    const getResponse = await request(app).get(`/tasks/${taskId}`)
    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveProperty('data')
    expect(getResponse.body.data.id).toBe(taskId)
    expect(getResponse.body.data.title).toBe(newTask.title.toLowerCase())
    expect(getResponse.body.data.description).toBe(newTask.description)
})

test('GET /tasks/:id should return 404 if task does not exist', async () => {
    const response = await request(app).get('/tasks/nonexistent-id')
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message')
})

test('PUT /tasks/:id should update a specific task', async () => {
    const newTask = {
        title: 'Task to Update',
        description: 'This task will be updated'
    }

    const postResponse = await request(app).post('/tasks').send(newTask)
    const taskId = postResponse.body.data.id

    const updatedTask = {
        title: 'Updated Task',
        description: 'This task has been updated',
        state: 'completed'
    }

    const putResponse = await request(app).put(`/tasks/${taskId}`).send(updatedTask)
    expect(putResponse.status).toBe(200)
    expect(putResponse.body).toHaveProperty('data')
    expect(putResponse.body.data.id).toBe(taskId)
    expect(putResponse.body.data.title).toBe(updatedTask.title.toLowerCase())
    expect(putResponse.body.data.description).toBe(updatedTask.description)
    expect(putResponse.body.data.state).toBe(updatedTask.state)
})

test('PUT /tasks/:id should return 400 if title or description is missing', async () => {
    const newTask = {
        title: 'Task with Missing Fields',
        description: 'This task will have missing fields'
    }

    const postResponse = await request(app).post('/tasks').send(newTask)
    const taskId = postResponse.body.data.id

    const updatedTask = {
        title: 'Updated Task'
    }

    const putResponse = await request(app).put(`/tasks/${taskId}`).send(updatedTask)
    expect(putResponse.status).toBe(400)
    expect(putResponse.body).toHaveProperty('message')
})

test('PUT /tasks/:id should return 404 if task does not exist', async () => {
    const updatedTask = {
        title: 'Nonexistent Task',
        description: 'This task does not exist',
        state: 'completed'
    }

    const response = await request(app).put('/tasks/nonexistent-id').send(updatedTask)
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message')
})

test('PATCH /tasks/:id should update the state of a specific task', async () => {
    const newTask = {
        title: 'Task to Update State',
        description: 'This task will have its state updated'
    }

    const postResponse = await request(app).post('/tasks').send(newTask)
    const taskId = postResponse.body.data.id

    const updatedState = {
        state: 'in-progress'
    }

    const patchResponse = await request(app).patch(`/tasks/${taskId}`).send(updatedState)
    expect(patchResponse.status).toBe(200)
    expect(patchResponse.body).toHaveProperty('data')
    expect(patchResponse.body.data.id).toBe(taskId)
    expect(patchResponse.body.data.state).toBe(updatedState.state)
})

test('PATCH /tasks/:id should return 404 if task does not exist', async () => {
    const updatedState = {
        state: 'in-progress'
    }

    const response = await request(app).patch('/tasks/nonexistent-id').send(updatedState)
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message')
})  

test('PATCH /tasks/:id should return 400 if state is missing', async () => {
    const newTask = {
        title: 'Task with Missing State',
        description: 'This task will have a missing state update'
    }

    const postResponse = await request(app).post('/tasks').send(newTask)
    const taskId = postResponse.body.data.id

    const patchResponse = await request(app).patch(`/tasks/${taskId}`).send({})
    expect(patchResponse.status).toBe(400)
    expect(patchResponse.body).toHaveProperty('message')
})

test('PATCH /tasks/:id should return 400 if state is invalid', async () => {
    const newTask = {
        title: 'Task with Invalid State',
        description: 'This task will have an invalid state update'
    }

    const postResponse = await request(app).post('/tasks').send(newTask)
    const taskId = postResponse.body.data.id

    const invalidState = {
        state: 'invalid-state'
    }

    const patchResponse = await request(app).patch(`/tasks/${taskId}`).send(invalidState)
    expect(patchResponse.status).toBe(400)
    expect(patchResponse.body).toHaveProperty('message')
})

test('DELETE /tasks/:id should delete a specific task', async () => {
    const newTask = {
        title: 'Task to Delete',
        description: 'This task will be deleted'
    }

    const postResponse = await request(app).post('/tasks').send(newTask)
    const taskId = postResponse.body.data.id

    const deleteResponse = await request(app).delete(`/tasks/${taskId}`)

    expect(deleteResponse.status).toBe(200)
    expect(deleteResponse.body.data).toBeNull()

    const getResponse = await request(app).get(`/tasks/${taskId}`)
    expect(getResponse.status).toBe(404)
})

test('DELETE /tasks/:id should return 404 if task does not exist', async () => {
    const response = await request(app).delete('/tasks/nonexistent-id')
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message')
})