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

}

export default UserController;