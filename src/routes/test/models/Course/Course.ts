import { Schema } from "mongoose";
import { ICourse } from "../../dtos/Course/CreateCourse.dto";
import mongoose, { Model } from "mongoose";
import { TopicSchema } from "../Topic/Topic";

export const CourseSchema: Schema<ICourse> = new Schema({
    headName: { type: String, required: true }, // Adjusted to camelCase
    topics: { type: [TopicSchema], required: true },
    imageUrl: { type: String, required: true }
  });
  
  const CourseModel: Model<ICourse> = mongoose.model<ICourse>('Course', CourseSchema);
  
  export default CourseModel;