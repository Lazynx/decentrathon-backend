import User from '../auth/models/User';

class MarketService {
    
    async marketExample(): Promise<any> {
        return {"status": 200, "message": "hello, world!"}
    }
    
}

export default MarketService;
