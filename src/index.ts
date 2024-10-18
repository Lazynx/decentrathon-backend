import express from 'express';
import { createServer } from 'node:http';
import connectDB from './db';
import globalRouter from './routes/global-router';
import { logger } from './logger';
import dotenv from 'dotenv';
import cors from 'cors';
import { Bot } from 'grammy';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;
const ORIGIN = 'https://spirality-frontend.vercel.app' || process.env.ORIGIN;

app.use(cors({
  origin: ORIGIN,
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(logger);
app.use('/api', globalRouter);

// Создание бота
const bot = new Bot(process.env.TELEGRAM_TOKEN as string);

// Обработчик команды /start для бота
bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Нажми на кнопку, чтобы открыть приложение Spirality', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть Spirality',
            web_app: {
              url: 'https://spirality-frontend.vercel.app'
            }
          }
        ]
      ]
    }
  });
});

// Обработчик команды /help для бота
bot.command('help', (ctx) => {
  ctx.reply('Список команд: /start — открыть приложение, /help — помощь.');
});

// Обработка всех сообщений
bot.on('message', (ctx) => {
  ctx.reply('Напиши /start, чтобы открыть приложение.');
});

// Запуск polling
bot.start(); // Это включает long polling

// Запуск сервера Express
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
