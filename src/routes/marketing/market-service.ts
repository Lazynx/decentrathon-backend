import User, { IUser } from '../auth/models/User';
import { Cases, CaseType, Outcome } from './models/Case';

export class CaseService {
    /**
     * Выбирает случайный исход на основе заданных шансов
     */
    private getRandomOutcome(caseType: CaseType): Outcome | null {
        const random = Math.random();
        let cumulative = 0;

        for (const outcomeEntry of caseType.outcomes) {
            cumulative += outcomeEntry.chance;
            if (random <= cumulative) {
                return outcomeEntry.outcome;
            }
        }

        return null;
    }

    /**
     * Обрабатывает покупку кейса пользователем
     */
    public async purchaseCase(telegramId: number, caseName: string): Promise<{ message: string; gold: number; countOfOpenCases: number }> {
        // Найти кейс по имени
        const caseType = Cases.find(c => c.name.toLowerCase() === caseName.toLowerCase());
        if (!caseType) {
            throw new Error('Тип кейса не найден.');
        }

        // Найти пользователя
        const user = await User.findOne({ telegramId });
        if (!user) {
            throw new Error('Пользователь не найден.');
        }

        // Проверить, хватает ли у пользователя голды
        if (user.gold < caseType.cost) {
            throw new Error('Недостаточно голды для покупки кейса.');
        }

        // Вычесть стоимость кейса
        user.gold -= caseType.cost;

        // Получить случайный исход
        const outcome = this.getRandomOutcome(caseType);
        if (!outcome) {
            throw new Error('Не удалось определить исход кейса.');
        }

        // Обработать исход
        if (outcome.type === 'gold') {
            user.gold += outcome.value;
        } else if (outcome.type === 'broken') {
            // Ничего не делаем, это неудача
        }

        // Увеличить счетчик открытых кейсов
        user.countOfOpenCases += 1;

        // Обновить время взаимодействия
        user.lastTime = user.currentTime;
        user.currentTime = new Date();

        // Сохранить изменения пользователя
        await user.save();

        return {
            message: outcome.message,
            gold: user.gold,
            countOfOpenCases: user.countOfOpenCases,
        };
    }

    /**
     * Получает топ-10 пользователей по количеству открытых кейсов
     */
    public async getTopUsers(): Promise<IUser[]> {
        const topUsers = await User.find()
            .sort({ countOfOpenCases: -1 })
            .limit(10)
            .select('telegramId username countOfOpenCases gold')
            .lean();

        return topUsers;
    }
}
