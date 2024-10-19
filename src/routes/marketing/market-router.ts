// src/routes/case-router.ts

import { Router } from 'express';
import { CaseController } from './market-controller';
import { CaseService } from './market-service';

const caseRouter = Router();
const caseService = new CaseService();
const caseController = new CaseController(caseService);

// Маршрут для покупки кейса
caseRouter.post('/purchase-case', caseController.purchaseCase);

// Маршрут для получения топ-10 пользователей
caseRouter.get('/top-users', caseController.getTopUsers);

export default caseRouter;
