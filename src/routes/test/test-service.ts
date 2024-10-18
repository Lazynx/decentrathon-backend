// import TestModel, { ICourse, ITest, ITopic } from './models/Test/Test';
import { ICourse } from './dtos/Course/CreateCourse.dto';
import ITest from './dtos/Test/CreateTest.dto';
import CourseModel from './models/Course/Course';
import ITopic from './dtos/Topic/CreateTopic.dto';
import User from '../auth/models/User';

import { uploadFile } from '../../middlewares/s3-middleware';
import openai from '../../openai';

import UserModel from '../auth/models/User'
import RefreshTokenModel from '../auth/models/RefreshToken'


import { promptWithMaterial } from './prompt/prompt.with.material';
import { promptWithoutMaterial } from './prompt/prompt.without.material';

class TestService {
  private async *processStreamedJsonArray(
    stream: AsyncIterable<any>
  ): AsyncGenerator<any> {
    let accumulator = '';
    let depth = 0;
    let isInString = false;

    for await (const part of stream) {
      const chunk = part.choices[0]?.delta?.content;

      if (chunk) {
        for (const char of chunk) {
          if (char === '"' && (accumulator.slice(-1) !== '\\' || isInString)) {
            isInString = !isInString;
          }

          if (isInString || depth > 0) {
            accumulator += char;
          }

          if (!isInString) {
            if (char === '{') {
              depth++;
              if (depth === 1) {
                accumulator = '{';
              }
            } else if (char === '}') {
              depth--;
            }
          }

          if (depth === 0 && !isInString && accumulator.trim() !== '') {
            try {
              const parsedObject = JSON.parse(accumulator);
              yield parsedObject;
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
            accumulator = '';
          }
        }
      }
    }
  }

  async createCourse(
    course: Partial<ICourse>,
    token: string,
    user_interest: string,
    userInput: string,
    imageBuffer: any,
    imageFileName: string
  ): Promise<ICourse> {
    try {
      if (imageBuffer !== "" && imageFileName !== ""){

        const bucketName = process.env.AWS_BUCKET_NAME!;
        const imageKey = `test-images/${Date.now().toString()}-${imageFileName}`;
  
        console.log('Uploading image file to S3:', { bucketName, imageKey });
        const imageUrl = await uploadFile(bucketName, imageBuffer, imageKey);
        console.log('Image file uploaded to S3:', imageUrl);
  
        const base64Image = imageBuffer.toString('base64');
        const userPrompt = `
        я хочу курс о ${userInput}
        Мне нравится ${user_interest}`;
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: promptWithMaterial
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: userPrompt },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ],
          stream: false
        });
  
        let messageContent = response.choices[0]?.message?.content || null;
        console.log('Received message content:', messageContent);
  
        if (!messageContent) {
          throw new Error('No content received from OpenAI');
        }
  
        messageContent = messageContent.replace(/```json|```/g, '').trim();
        console.log("this is message content with trim!!: ", messageContent);
        const testDescriptions = JSON.parse(messageContent);
        console.log("Parsed testDescriptions:", testDescriptions);
  
        if (!testDescriptions.course_structure || !Array.isArray(testDescriptions.course_structure.topics) || testDescriptions.course_structure.topics.length === 0) {
          throw new Error('Invalid structure in the response from OpenAI');
        }
  
        const newCourse = new CourseModel({
          ...course,
          headName: testDescriptions.course_structure.head_name,
          topics: testDescriptions.course_structure.topics,
          imageUrl: imageUrl
        });
  
        const courseId = newCourse._id;
        const userJson = await RefreshTokenModel.findOne({ token }).select('user');
        const userId = (userJson as any).user.toString();
        
        // Добавляем ID курса к пользователю
        
        await User.findByIdAndUpdate(
          userId,
          { $push: { user_courses: courseId } },
          { new: true }
        );
        
        console.log('Saving test to database:', newCourse);
        const savedTest = await newCourse.save();
  
        return savedTest;
      }
      else{
        const userPrompt = `
        я хочу ${userInput} добавь примеры с 
         ${user_interest} чтобы я мог понять тему`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: promptWithoutMaterial
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: userPrompt }
              ]
            }
          ],
          stream: false
        });
  
        let messageContent = response.choices[0]?.message?.content || null;
        console.log('Received message content:', messageContent);
  
        if (!messageContent) {
          throw new Error('No content received from OpenAI');
        }
  
        messageContent = messageContent.replace(/```json|```/g, '').trim();
        console.log("this is message content with trim!!: ", messageContent);
        const testDescriptions = JSON.parse(messageContent);
        console.log("Parsed testDescriptions:", testDescriptions);
  
        if (!testDescriptions.course_structure || !Array.isArray(testDescriptions.course_structure.topics) || testDescriptions.course_structure.topics.length === 0) {
          throw new Error('Invalid structure in the response from OpenAI');
        }
  
        const newCourse = new CourseModel({
          ...course,
          headName: testDescriptions.course_structure.head_name,
          topics: testDescriptions.course_structure.topics,
          imageUrl: "without-image-url"
        });
  
        const courseId = newCourse._id;
        const userJson = await RefreshTokenModel.findOne({ token }).select('user');
        const userId = (userJson as any).user.toString();
        
        // Добавляем ID курса к пользователю
        
        await User.findByIdAndUpdate(
          userId,
          { $push: { user_courses: courseId } },
          { new: true }
        );
        
        console.log('Saving test to database:', newCourse);
        const savedTest = await newCourse.save();
  
        return savedTest;
      }
    } catch (err) {
      console.error('Error creating test:', err);
      throw err;
    }
  }

  async getCourse(id: string): Promise<ICourse | null> {
    try {
      return CourseModel.findById(id);
    } catch (err) {
      console.error('Error getting test:', err);
      throw err;
    }
  }

  async userCourses(token: string): Promise<any> {
    try {
      const userRefreshToken = await RefreshTokenModel.findOne({ token }).select('user');
      const userId = (userRefreshToken as any).user;

      const userData = await User.findById(userId).select('user_courses');
      
      return userData
    } catch (err) {
      console.error('Error getting test:', err);
      throw err;
    }
  }


  async getTopic(id_of_course, id_of_topic: string): Promise<ITopic | null> {
    try {
      const course = await CourseModel.findById(id_of_course).select('topics');
    if (!course) return null;

      const topic = course.topics.find((t: any) => t._id.toString() === id_of_topic);
      return topic || null;
    } catch (err) {
      console.error('Error getting test:', err);
      throw err;
    }
  }

  async completeTopic(id_of_course: string, id_of_topic: string): Promise<any> {
    try {
      const course = await CourseModel.findById(id_of_course).select('topics');
      if (!course) return null;
  
      const topic = course.topics.find((t: any) => t._id.toString() === id_of_topic);
      if (!topic) return null;
  
      topic.is_completed = true;
  
      // Обновление курса в базе данных
      await CourseModel.updateOne(
        { _id: id_of_course, 'topics._id': id_of_topic },
        { $set: { 'topics.$.is_completed': true } }
      );
  
      return topic;
    } catch (err) {
      console.error('Error completing topic:', err);
      throw err;
    }
  }

  async getTopicId(id_of_course: string): Promise<any | null> {
    try {
      const course = await CourseModel.findById(id_of_course).select('topics');
      const name_of_course = await CourseModel.findById(id_of_course).select('headName');
      if (!course) return null;
    
      const id_collection: any = {
        name_of_course,
        "id_collection": []
      }

      course.topics.forEach((t: any) => {
        id_collection["id_collection"].push(t._id.toString());
      });

      console.log(id_collection["id_collection"]);
      return id_collection || null;
    } catch (err) {
      console.error('Error getting test:', err);
      throw err;
    }
  }

  // async get(id_of_course, id_of_topic: string): Promise<ICourse | null> {
  //   try {
  //     return CourseModel.findById(id_of_course).find({ topics: String }).findById(id_of_topic);
  //   } catch (err) {
  //     console.error('Error getting test:', err);
  //     throw err;
  //   }
  // }

  async getAllCourses(): Promise<{ course_collection: string[] }> {
    try {
      const courses = await CourseModel.find();
      const course_collection: { course_collection: string[] } = {
        course_collection: []
      };
  
      courses.forEach((t: any) => {
        course_collection.course_collection.push(t._id.toString());
      });
  
      return course_collection;
  
    } catch (err) {
      console.error('Error getting tests:', err);
      throw err;
    }
  }

  // async updateCourse(
  //   id: string,
  //   testUpdate: Partial<ITest>,
  //   imageBuffer?: Buffer,
  //   imageFileName?: string
  // ): Promise<ITest | null> {
  //   try {
  //     let imageUrl: string | undefined;
  //     if (imageBuffer && imageFileName) {
  //       const bucketName = process.env.AWS_BUCKET_NAME!;
  //       const imageKey = `tests/${Date.now().toString()}-${imageFileName}`;

  //       console.log('Uploading image file to S3:', { bucketName, imageKey });
  //       imageUrl = await uploadFile(bucketName, imageBuffer, imageKey);
  //       console.log('Image file uploaded to S3:', imageUrl);
  //     }

  //     const test = await TestModel.findById(id);
  //     if (!test) throw new Error('Test not found');

  //     if (imageUrl) {
  //       testUpdate.image = imageUrl;
  //     }

  //     Object.assign(test, testUpdate);
  //     const updatedTest = await test.save();

  //     return updatedTest;
  //   } catch (err) {
  //     console.error('Error updating test:', err);
  //     throw err;
  //   }
  // }

  async deleteCourse(id: string): Promise<ICourse | null> {
    try {
      return CourseModel.findByIdAndDelete(id);
    } catch (err) {
      console.error('Error deleting test:', err);
      throw err;
    }
  }
}

export default TestService;