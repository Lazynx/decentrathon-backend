import { Router } from 'express'
import authRouter from './auth/auth-router'
import testRouter from './test/test-router'
import usersRouter from './users/users-router'
import caseRouter from './marketing/market-router'
const globalRouter = Router()

globalRouter.use('/auth', authRouter)
globalRouter.use('/course',testRouter)
globalRouter.use('/user', usersRouter)
globalRouter.use('/market', caseRouter)
export default globalRouter
