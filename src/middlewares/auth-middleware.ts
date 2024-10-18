import { NextFunction, Request, Response } from 'express'
import AuthService from '../routes/auth/auth-service'
import UserModel from '../routes/auth/models/User'
const authService = new AuthService()


export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Извлекаем telegramId из заголовка X-Telegram-ID
        const telegramId = req.headers['x-telegram-id'];

        if (!telegramId) {
            return res.status(400).json({ message: 'X-Telegram-ID header is required' });
        }

        // Ищем пользователя в базе данных по Telegram ID
        const user = await UserModel.findOne({ telegramId });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Если пользователь найден, продолжаем выполнение
        next();
    } catch (err) {
        console.error('Error in auth middleware:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
// export const authMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization
//   if (!authHeader) {
//     return res.status(401).json({ message: 'Authorization header missing' })
//   }

//   const token = authHeader.split(' ')[1]
//   const payload = authService.verifyJwt(token)

//   if (!payload) {
//     return res.status(401).json({ message: 'Invalid or expired token' })
//   }

//   ;(req as any).user = payload
//   next()
// }
