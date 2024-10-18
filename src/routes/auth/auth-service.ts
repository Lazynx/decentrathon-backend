// auth-service.ts
import { CreateUserDto } from './dtos/CreateUser.dto'
import { IUser } from './models/User'
import UserModel from './models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import RefreshTokenModel from './models/RefreshToken'

dotenv.config()

class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET!
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!

  async registerUser(createUserDto: CreateUserDto): Promise<IUser> {
    const { email, password, username, surveyAnswers } = createUserDto
    const hashedPassword = await bcrypt.hash(password, 10)
    const currentTime = new Date()

    const newUser = new UserModel({
      email,
      username,
      surveyAnswers,
      password: hashedPassword,
      last_time: currentTime,
      current_time: currentTime
    })

    await newUser.save()
    return newUser
  }

  async loginUser(
    email: string,
    password: string
  ): Promise<{
    user: IUser
    accessToken: string
    refreshToken: string
  } | null> {
    const user = await UserModel.findOne({ email })
    if (!user) return null

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return null

    const accessToken = this.generateJwt(user)
    const refreshToken = this.generateRefreshToken(user)

    const refreshTokenDoc = new RefreshTokenModel({
      token: refreshToken,
      user: user._id
    })
    await refreshTokenDoc.save()

    return { user, accessToken, refreshToken }
  }

  async updateCurrentTime(token: string): Promise<any> {
    const user_json = await RefreshTokenModel.findOne({ token }).select('user');
    const user_id = ((user_json as any).user);
  
    const currentTime = new Date();
  
    const updatedUser = await UserModel.findByIdAndUpdate(
      (user_id as any).toString(),
      { current_time: currentTime },
      { new: true }
    );
    const millisecondsInDay = 24 * 60 * 60 * 1000;
  
    const lastTime = updatedUser?.last_time;
    let streakDays: number | undefined;
  
    if (lastTime) {
      streakDays = (currentTime.getTime() - new Date(lastTime).getTime()) / millisecondsInDay;
    }
  
    let streak = updatedUser?.streak || 0;
    if (streakDays !== undefined) {
      if (streakDays - streak >= 1 && streakDays - streak < 2) {
        streak += 1;
      } else if(streakDays - streak >= 2){
        streak = 0;
        const lastTime = currentTime;
      }
    }
  
    const finalUpdatedUser = await UserModel.findByIdAndUpdate(
      (user_id as any).toString(),
      { streak, last_time: lastTime },
      { new: true }
    );
  
    return { updatedUser: finalUpdatedUser, streak };
  }

  async addXp(token: string): Promise<any> {
    try {
      const userJson = await RefreshTokenModel.findOne({ token }).select('user');
      if (!userJson) {
        throw new Error('Token not found');
      }
  
      const userId = userJson.user.toString();
  
      const User = await UserModel.findById(userId);
      if (!User) {
        throw new Error('User not found');
      }
  
      let newXp = (User.xp || 0) + 250;
      let next_level_upd = User.next_level;
      let level_upd = User.level;

      if (newXp >= next_level_upd) {
          newXp = 0;
          next_level_upd += 750;
          level_upd += 1;  
      }

      const finalUpdatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { xp: newXp, next_level: next_level_upd, level: level_upd},
        { new: true }
      );
  
      if (!finalUpdatedUser) {
        throw new Error('Failed to update user XP');
      }
  
      return { updatedUser: finalUpdatedUser, newXp };
    } catch (error) {
      return { error: error };
    }
  }
  
  
  async userInfo(token: string): Promise<any> {
    try {
      const userJson = await RefreshTokenModel.findOne({ token }).select('user');
      if (!userJson) {
        throw new Error('Token not found');
      }
  
      const userId = userJson.user.toString();
  
      const User = await UserModel.findById(userId);
      if (!User) {
        throw new Error('User not found');
      }
  
      
      return { user: User };
    } catch (error) {
      return { error: error };
    }
  }
  
  private generateJwt(user: IUser): string {
    return jwt.sign({ id: user._id, email: user.email }, this.jwtSecret, {
      expiresIn: '30d'
    })
  }
  
  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      { id: user._id, email: user.email },
      this.jwtRefreshSecret,
      { expiresIn: '60d' }
    )
  }

  verifyJwt(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret)
    } catch (err) {
      return null
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtRefreshSecret)
    } catch (err) {
      return null
    }
  }

  async refreshToken(
    oldToken: string
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const payload = this.verifyRefreshToken(oldToken)
    if (!payload) return null

    const user = await UserModel.findById(payload.id)
    if (!user) return null

    const newAccessToken = this.generateJwt(user)
    const newRefreshToken = this.generateRefreshToken(user)

    const refreshTokenDoc = new RefreshTokenModel({
      token: newRefreshToken,
      user: user._id
    })
    await refreshTokenDoc.save()

    await RefreshTokenModel.deleteOne({ token: oldToken })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }
}

export default AuthService
