// auth-service.ts
import { CreateUserDto } from './dtos/CreateUser.dto'
import User, { IUser } from './models/User'
import UserModel from './models/User'
import { Document } from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

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
        xp: 0,
        gold: 0
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
  async updateCurrentTime(telegramId: string): Promise<TimeUpdateResponse> {
    try {
      // Поиск пользователя по telegramId
      const user = await UserModel.findOne({ telegramId })
      if (!user) throw new Error('User not found')

      const currentTime = new Date()

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

      // Обновление полей currentTime, lastTime и streak
      const updatedUser = await UserModel.findByIdAndUpdate(
        user._id,
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
  async addXp(telegramId: string): Promise<XpUpdateResponse> {
    try {
      const userDoc = await UserModel.findOne({ telegramId })
      if (!userDoc) throw new Error('telegramId not found or invalid')

    

      let { xp, nextLevel, level } = userDoc

      // Add XP and check for level up
      xp += 250
      if (xp >= nextLevel) {
        xp = 0
        nextLevel += 750
        level += 1
      }

      const updatedUser = await UserModel.findOneAndUpdate(
        {telegramId: telegramId},
        { xp, nextLevel, level },
        { new: true }
      )

      return { updatedUser, newXp: xp }
    } catch (error) {
      console.error('Error adding XP:', error)
      throw new Error('Failed to add XP')
    }
  }

  // Update user gold

  async updateCurrency(telegramId: string, newAmount: number){
    const user = await UserModel.findOne({ telegramId});
    if (!user){
      throw new Error('user not found');
    }

    user.gold = newAmount;
    await user.save();
  }

  // Get user gold
  async getGold(telegramId: string): Promise<number> {
    const user = await UserModel.findOne({telegramId});

    if(!user){
      throw new Error('User not found');
    }

    console.log('User ${userId} has ${user.currencyAmount} currency');

    return user.gold;
  }

  /**
   * Get user information
   */
  async userInfo(telegramId: string): Promise<UserInfoResponse> {
    try {
      const user = await UserModel.findOne({ telegramId });
      if (!user) throw new Error('User not found');
      
      return { user };
    } catch (error) {
      console.error('Error fetching user info:', error)
      throw new Error('Failed to fetch user info')
    }
  }

  /**
   * Add course to user's course list
   */
  async addUserCourse(telegramId: string, courseId: string): Promise<IUser> {
    try {
      const user = await UserModel.findOne({ telegramId });
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
