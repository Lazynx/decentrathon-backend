export interface CreateUserDto {
  username?: string
  email: string
  password: string
  surveyAnswers: [string]
}
