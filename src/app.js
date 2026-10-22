import express from 'express'
import { router as taskRouter } from './routes/tasks.routes.js'

const app = express()

app.use(express.json())


app.get('/', (_, res) => {
    res.json({ message: 'Welcome to the TaskFlow API', status: 200 })
})

app.use('/', taskRouter)

export default app