import { Router } from 'express'
import authRouter from './auth/auth-router'
import testRouter from './test/test-router'
import usersRouter from './users/users-router'
const globalRouter = Router()

globalRouter.use('/auth', authRouter)
globalRouter.use('/course',testRouter)
globalRouter.use('/user', usersRouter)

export default globalRouter
