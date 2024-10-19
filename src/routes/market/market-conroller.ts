import MarketService from "./market-service";
import { Request, Response } from "express";
class MarketController {
    private marketsService: MarketService;
  
    constructor(marketsService: MarketService) {
      this.marketsService = marketsService;
    }

    marketExample = async (req: Request, res: Response): Promise<any> => {
        return this.marketsService.marketExample();
    };

}

export default MarketController;