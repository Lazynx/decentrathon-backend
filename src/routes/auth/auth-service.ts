// auth-service.ts
import { CreateUserDto } from './dtos/CreateUser.dto'
import { IUser } from './models/User'
import UserModel from './models/User'
import RefreshTokenModel from './models/RefreshToken'
import { Document } from 'mongoose'

interface TimeUpdateResponse {
  updatedUser: IUser | null;
  streak: number;
}

interface XpUpdateResponse {
  updatedUser: IUser | null;
  newXp: number;
}

interface UserInfoResponse {
  user: IUser | null;
}

export class AuthService {
  /**
   * Register a new user or return existing user
   */
  async registerUser(createUserDto: CreateUserDto): Promise<IUser> {
    const { telegramId, username, firstName, lastName } = createUserDto

    try {
      const existingUser = await UserModel.findOne({ telegramId })
      if (existingUser) {
        return existingUser
      }

      const currentTime = new Date()
      const newUser = new UserModel({
        telegramId,
        username: username || '',
        firstName: firstName || '',
        lastName: lastName || '',
        surveyAnswers: [],
        userCourses: [],
        level: 1,
        nextLevel: 750,
        lastTime: currentTime,
        currentTime: currentTime,
        streak: 0,
        xp: 0
      })

      return await newUser.save()
    } catch (error) {
      console.error('Error in user registration:', error)
      throw new Error('Failed to register user')
    }
  }

  /**
   * Update user's current time and calculate streak
   */
  async updateCurrentTime(token: string): Promise<TimeUpdateResponse> {
    try {
      const userDoc = await RefreshTokenModel.findOne({ token }).select('user')
      if (!userDoc?.user) throw new Error('Token not found or invalid')

      const userId = userDoc.user.toString()
      const currentTime = new Date()

      const user = await UserModel.findById(userId)
      if (!user) throw new Error('User not found')

      const millisecondsInDay = 24 * 60 * 60 * 1000
      const lastTime = user.lastTime
      let streak = user.streak

      if (lastTime) {
        const daysDifference = (currentTime.getTime() - lastTime.getTime()) / millisecondsInDay
        
        if (daysDifference >= 1 && daysDifference < 2) {
          streak += 1
        } else if (daysDifference >= 2) {
          streak = 0
        }
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { 
          currentTime,
          lastTime: currentTime,
          streak
        },
        { new: true }
      )

      return { updatedUser, streak }
    } catch (error) {
      console.error('Error updating time:', error)
      throw new Error('Failed to update time')
    }
  }

  /**
   * Add XP to user and handle level progression
   */
  async addXp(token: string): Promise<XpUpdateResponse> {
    try {
      const userDoc = await RefreshTokenModel.findOne({ token }).select('user')
      if (!userDoc?.user) throw new Error('Token not found or invalid')

      const userId = userDoc.user.toString()
      const user = await UserModel.findById(userId)
      if (!user) throw new Error('User not found')

      let { xp, nextLevel, level } = user

      // Add XP and check for level up
      xp += 250
      if (xp >= nextLevel) {
        xp = 0
        nextLevel += 750
        level += 1
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { xp, nextLevel, level },
        { new: true }
      )

      return { updatedUser, newXp: xp }
    } catch (error) {
      console.error('Error adding XP:', error)
      throw new Error('Failed to add XP')
    }
  }

  /**
   * Get user information
   */
  async userInfo(token: string): Promise<UserInfoResponse> {
    try {
      const userDoc = await RefreshTokenModel.findOne({ token }).select('user')
      if (!userDoc?.user) throw new Error('Token not found or invalid')

      const userId = userDoc.user.toString()
      const user = await UserModel.findById(userId)
      if (!user) throw new Error('User not found')

      return { user }
    } catch (error) {
      console.error('Error fetching user info:', error)
      throw new Error('Failed to fetch user info')
    }
  }

  /**
   * Add course to user's course list
   */
  async addUserCourse(userId: string, courseId: string): Promise<IUser> {
    try {
      const user = await UserModel.findById(userId)
      if (!user) throw new Error('User not found')

      if (!user.userCourses.includes(courseId)) {
        user.userCourses.push(courseId)
        return await user.save()
      }

      return user
    } catch (error) {
      console.error('Error adding course:', error)
      throw new Error('Failed to add course')
    }
  }

  /**
   * Add survey answer for user
   */
  async addSurveyAnswer(userId: string, answer: string): Promise<IUser> {
    try {
      const user = await UserModel.findById(userId)
      if (!user) throw new Error('User not found')

      user.surveyAnswers.push(answer)
      return await user.save()
    } catch (error) {
      console.error('Error adding survey answer:', error)
      throw new Error('Failed to add survey answer')
    }
  }
}

export default AuthService;
