import mongoose, { Document, Schema, ObjectId } from 'mongoose'

export interface IUser extends Document {
  // Telegram Authentication Fields
  _id: ObjectId;
  telegramId: number // Уникальный идентификатор пользователя в Telegram
  username?: string // Имя пользователя в Telegram (опционально)
  firstName?: string // Имя (опционально)
  lastName?: string // Фамилия (опционально)
  // Дополнительные поля пользователя
  surveyAnswers: string[] // Массив ответов на опросы
  userCourses: string[] // Массив курсов пользователя
  level: number // Текущий уровень пользователя
  nextLevel: number // XP, необходимый для перехода на следующий уровень
  lastTime: Date // Время последнего взаимодействия
  currentTime: Date // Текущее время или время последнего обновления
  streak: number // Количество дней подряд, когда пользователь был активен
  xp: number // Текущий XP пользователя
  currency: number //Внутриигровая валюта, ее крч можно обменять на коины
}

const UserSchema: Schema = new Schema({
  // Telegram Authentication Fields
  telegramId: { type: Number, required: true, unique: true }, // Уникальный идентификатор пользователя в Telegram
  username: { type: String }, // Имя пользователя в Telegram (опционально)
  firstName: { type: String }, // Имя (опционально)
  lastName: { type: String }, // Фамилия (опционально)

  // Дополнительные поля пользователя
  surveyAnswers: { type: [String], default: [] }, // Массив ответов на опросы
  userCourses: { type: [String], default: [] }, // Массив курсов пользователя
  level: { type: Number, default: 1 }, // Текущий уровень пользователя
  nextLevel: { type: Number, default: 750 }, // XP, необходимый для перехода на следующий уровень
  lastTime: { type: Date, default: Date.now }, // Время последнего взаимодействия
  currentTime: { type: Date, default: Date.now }, // Текущее время или время последнего обновления
  streak: { type: Number, default: 0 }, // Количество дней подряд, когда пользователь был активен
  xp: { type: Number, default: 0 }, // Текущий XP пользователя
  currency: { type: Number, default: 0}, // внутриигровая валюта, нуль по умолчанию
})


export default mongoose.model<IUser>('User', UserSchema)