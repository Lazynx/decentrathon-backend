import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth-middleware'
import AuthController from './auth-controller'
import AuthService from './auth-service'

const authRouter = Router()

const authService = new AuthService()
const authController = new AuthController(authService)

// Register
authRouter.post('/register', authController.registerUser)
authRouter.post('/login', authController.loginUser)
authRouter.post('/refresh-token', authController.refreshToken)

//information about the user
authRouter.put('/userInfo', authController.userInfo)

// Gamefication
authRouter.put('/updateCurrentTime', authController.updateCurrentTime)
authRouter.put('/addXp', authController.addXp)


// Check
authRouter.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'You have access to this route!' })
})

export default authRouter
