// server.ts
import express from 'express';
import { createServer } from 'node:http';
import connectDB from './db';
import globalRouter from './routes/global-router';
import { logger } from './logger';
import dotenv from 'dotenv';
import cors from 'cors';
import { Bot } from 'grammy';
import User from './routes/auth/models/User';
import AuthService from './routes/auth/auth-service';
import authRouter from './routes/auth/auth-router'; // Импортируйте маршруты авторизации

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;
const ORIGIN = process.env.ORIGIN || 'https://decentrathon-frontend.vercel.app';


// Проверка наличия TELEGRAM_TOKEN
if (!process.env.TELEGRAM_TOKEN) {
  console.error('Error: TELEGRAM_TOKEN is not defined in environment variables.');
  process.exit(1); // Завершение процесса с ошибкой
}

// Настройка CORS
app.use(cors({
  origin: ORIGIN,
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(logger);
app.use('/api', globalRouter);

// Подключение маршрутов авторизации
app.use('/auth', authRouter);

// Изменение корневого маршрута для возврата списка usernames
app.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username -_id'); // Получаем только поле username
    const usernames = users.map(user => user.username).filter(Boolean); // Извлекаем username и убираем пустые значения
    res.json({ usernames });
  } catch (error) {
    console.error('Error fetching usernames:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

//tamirlan creating authService object there
const authService = new AuthService();

// // Создание бота
// const bot = new Bot(process.env.TELEGRAM_TOKEN as string);

// bot.command('start', async (ctx) => {
//   const user = ctx.from;
//   if (user) {
//     try {
//       let existingUser = await User.findOne({ telegramId: user.id });
      
//       if (!existingUser) {
//         // Регистрация нового пользователя через AuthService и ожидание результата
//         existingUser = await authService.registerUser({
//           telegramId: user.id,
//           username: user.username || '',
//           firstName: user.first_name || '',
//           lastName: user.last_name || '',
//         });
        
//         console.log(`New user saved: ${existingUser.username}`);
//       } else {
//         console.log(`User already exists: ${existingUser.username}`);
//       }

//       await ctx.reply('Привет! Нажми на кнопку, чтобы открыть приложение Spirality', {
//         reply_markup: {
//           inline_keyboard: [
//             [
//               {
//                 text: 'Открыть Spirality',
//                 web_app: {
//                   url: 'https://decentrathon-frontend.vercel.app'
//                 }
//               }
//             ]
//           ]
//         }
//       });
//     } catch (error) {
//       console.error('Error saving user:', error);
//       await ctx.reply('Произошла ошибка при сохранении вашего профиля.');
//     }
//   } else {
//     await ctx.reply('Не удалось определить ваш профиль.');
//   }
// });

// // Обработчик команды /help для бота
// bot.command('help', (ctx) => {
//   ctx.reply('Список команд: /start — открыть приложение, /help — помощь.');
// });

// // Обработка всех сообщений
// bot.on('message', (ctx) => {
//   ctx.reply('Напиши /start, чтобы открыть приложение.');
// });

// // Запуск polling
// bot.start(); // Это включает long polling

// Запуск сервера Express
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server running at ${process.env.PORT}`);
});
