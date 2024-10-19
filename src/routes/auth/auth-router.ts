import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth-middleware'
import AuthController from './auth-controller'
import AuthService from './auth-service'

const authRouter = Router()
const authService = new AuthService()
const authController = new AuthController(authService)

authRouter.post('/register', authController.registerUser)

authRouter.put('/userInfo', authController.userInfo)

authRouter.put('/updateCurrentTime', authController.updateCurrentTime)
authRouter.put('/addXp', authController.addXp)

authRouter.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'You have access to this route!' })
})

export default authRouter
