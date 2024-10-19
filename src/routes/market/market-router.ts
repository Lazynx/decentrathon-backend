import { Router } from 'express'
import MarketService from './market-service';
import MarketController from './market-conroller';

const marketsRouter = Router();

const marketsService = new MarketService();
const marketsController = new MarketController(marketsService);

marketsRouter.get('/market', marketsController.marketExample)

export default marketsRouter