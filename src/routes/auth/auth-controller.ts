// auth-controller.ts
import { Request, Response } from 'express'
import { CreateUserDto } from './dtos/CreateUser.dto'
import AuthService from './auth-service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AuthController {

  private readonly authService: AuthService

  constructor(authService: AuthService) {
    this.authService = authService
  }

  /**
   * Standard response handler for controller methods
   */
  private sendResponse<T>(
    res: Response,
    statusCode: number,
    data?: T,
    message?: string,
    error?: string
  ): void {
    const response: ApiResponse<T> = {
      success: statusCode >= 200 && statusCode < 300,
      ...(data && { data }),
      ...(message && { message }),
      ...(error && { error })
    }
    res.status(statusCode).json(response)
  }

  /**
   * Error handler for controller methods
   */
  private handleError(res: Response, error: unknown, message: string = 'An error occurred'): void {
    console.error(`AuthController Error: ${message}`, error)
    const errorMessage = error instanceof Error ? error.message : message
    this.sendResponse(res, 500, undefined, undefined, errorMessage)
  }

  /**
   * Register new user
   */
  registerUser = async (req: Request<{}, {}, CreateUserDto>, res: Response): Promise<void> => {
    try {
      const createUserDto = req.body
      const user = await this.authService.registerUser(createUserDto)
      this.sendResponse(res, 201, { user }, 'User registered successfully')
    } catch (error) {
      this.handleError(res, error, 'Error registering user')
    }
  }

  /**
   * Update user's current time and streak
   */
  updateCurrentTime = async (req: Request<{}, {}, { token: string }>, res: Response): Promise<void> => {
    try {
      const { token } = req.body
      
      if (!token) {
        this.sendResponse(res, 400, undefined, undefined, 'Token is required')
        return
      }

      const result = await this.authService.updateCurrentTime(token)
      
      if (!result || !result.updatedUser) {
        this.sendResponse(res, 401, undefined, undefined, 'Invalid token or user not found')
        return
      }

      this.sendResponse(res, 200, {
        user: result.updatedUser,
        streak: result.streak
      }, 'Time updated successfully')
    } catch (error) {
      this.handleError(res, error, 'Error updating time')
    }
  }

  /**
   * Add XP to user
   */
  addXp = async (req: Request<{}, {}, { token: string }>, res: Response): Promise<void> => {
    try {
      const { token } = req.body
      
      if (!token) {
        this.sendResponse(res, 400, undefined, undefined, 'Token is required')
        return
      }

      const result = await this.authService.addXp(token)
      
      if (!result || !result.updatedUser) {
        this.sendResponse(res, 401, undefined, undefined, 'Invalid token or user not found')
        return
      }

      const levelUpMessage = result.newXp === 0 ? 'Level up!' : undefined
      
      this.sendResponse(res, 200, {
        user: result.updatedUser,
        xpGained: 250,
        newXp: result.newXp
      }, levelUpMessage || 'XP added successfully')
    } catch (error) {
      this.handleError(res, error, 'Error adding XP')
    }
  }

  /**
   * Get user information
   */
  userInfo = async (req: Request<{}, {}, { token: string }>, res: Response): Promise<void> => {
    try {
      const { token } = req.body
      
      if (!token) {
        this.sendResponse(res, 400, undefined, undefined, 'Token is required')
        return
      }

      const result = await this.authService.userInfo(token)
      
      if (!result || !result.user) {
        this.sendResponse(res, 401, undefined, undefined, 'Invalid token or user not found')
        return
      }

      this.sendResponse(res, 200, {
        user: result.user
      }, 'User information retrieved successfully')
    } catch (error) {
      this.handleError(res, error, 'Error fetching user information')
    }
  }

  /**
   * Middleware to validate token
   */
  validateToken = (req: Request, res: Response, next: Function): void => {
    const { token } = req.body

    if (!token) {
      this.sendResponse(res, 400, undefined, undefined, 'Token is required')
      return
    }

    next()
  }
}

export default AuthController; 
