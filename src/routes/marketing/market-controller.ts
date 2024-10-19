// src/controllers/case-controller.ts

import { Request, Response } from 'express';
import { CaseService } from './market-service';

export class CaseController {
    private caseService: CaseService;

    constructor(caseService: CaseService) {
        this.caseService = caseService;
        this.purchaseCase = this.purchaseCase.bind(this);
        this.getTopUsers = this.getTopUsers.bind(this);
    }

    /**
     * Обрабатывает покупку кейса
     */
    public async purchaseCase(req: Request, res: Response): Promise<void> {
        const { telegramId, caseName } = req.body;

        if (!telegramId || !caseName) {
            res.status(400).json({ message: 'telegramId и caseName обязательны.' });
            return;
        }

        try {
            const result = await this.caseService.purchaseCase(telegramId, caseName);
            res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'Тип кейса не найден.' || error.message === 'Пользователь не найден.') {
                res.status(404).json({ message: error.message });
            } else if (error.message === 'Недостаточно голды для покупки кейса.') {
                res.status(400).json({ message: error.message });
            } else {
                console.error('Ошибка при покупке кейса:', error);
                res.status(500).json({ message: 'Внутренняя ошибка сервера.' });
            }
        }
    }

    /**
     * Получает топ-10 пользователей
     */
    public async getTopUsers(req: Request, res: Response): Promise<void> {
        try {
            const topUsers = await this.caseService.getTopUsers();
            res.status(200).json({ topUsers });
        } catch (error) {
            console.error('Ошибка при получении топ пользователей:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера.' });
        }
    }
}
