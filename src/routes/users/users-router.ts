import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth-middleware';
// import AuthController from './auth-controller';
// import AuthService from './auth-service';
import UserController from './users-controller';
import UserService from './users-service';
import { Request, Response } from 'express';
const usersRouter = Router();

const userService = new UserService();
const userController = new UserController(userService);

// const authService = new AuthService();
// const authController = new AuthController(authService);

usersRouter.get('/users', userController.getTopUsers)

export default usersRouter;
