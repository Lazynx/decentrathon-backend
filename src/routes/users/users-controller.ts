import UserService from "./users-service";
import { Request, Response } from "express";
class UserController {
    private usersService: UserService;
  
    constructor(usersService: UserService) {
      this.usersService = usersService;
    }

    getTopUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const topUsers = await this.usersService.getTopUsers();
    
            if (topUsers) {
                res.status(200).json(topUsers);
            } else {
                res.status(404).json({ message: 'Course not found' });
            }
        } catch (err) {
            console.error('Error getting course:', err);
            res.status(500).json({ message: 'Error getting course', error: err });
        }
    };

    checkUser = async (req: Request, res: Response): Promise<void> => {
        try {
          const { telegramId } = req.query;
      
          if (!telegramId) {
            res.status(400).json({ message: "Telegram ID is required" });
            return;
          }
      
          const userExists = await this.usersService.checkUserExists(telegramId as string);
      
          if (userExists) {
            res.status(200).json({ exists: true });
          } else {
            res.status(404).json({ exists: false });
          }
        } catch (err) {
          console.error('Error checking user existence:', err);
          res.status(500).json({ message: 'Error checking user existence', error: err });
        }
      };
}

export default UserController;