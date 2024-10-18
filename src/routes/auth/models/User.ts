import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  username?: string
  password: string
  surveyAnswers: [string]
  user_courses: string[]
  level: number
  next_level: number
  last_time: Date
  current_time: Date
  streak: number
  xp: number
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String },
  password: { type: String, required: true },
  surveyAnswers: {type: [String], default: []},
  user_courses: { type: [String], default: [] },
  level: { type: Number, default: 1 },
  next_level: { type: Number, default: 750 },
  last_time: { type: Date, default: Date.now },
  current_time: { type: Date, default: Date.now },
  streak: { type: Number, default: 1 },
  xp: { type: Number, default: 0 }
})

export default mongoose.model<IUser>('User', UserSchema)