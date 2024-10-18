import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth-middleware'
import TestService from './test-service'
import TestController from './test-controller'
import multer from 'multer'

const testRouter = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

const testService = new TestService()
const testController = new TestController(testService)

// creating course
testRouter.post(
  '/create',
  upload.fields([{ name: 'material', maxCount: 4 }]),
  testController.createCourse
)

// getting courses
testRouter.get('/get_all', testController.getAllCourses)
testRouter.get('/:id', testController.getCourse)
testRouter.get('/:id/get_topic_id', testController.getTopicId)
testRouter.get('/:id/:internalId', testController.getTopic)

// update
testRouter.post('/:id/:internalId/complete', testController.completeTopic)

// user
testRouter.post('/user_courses', testController.userCourses);

// soon
// testRouter.put('/tests/:id', testController.updateCourse)
testRouter.delete('/:id', testController.deleteCourse)

export default testRouter
