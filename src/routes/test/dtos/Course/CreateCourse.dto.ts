import ITopic from "../Topic/CreateTopic.dto";
import { Document } from "mongoose";

export interface ICourse extends Document {
    headName: string; // Adjusted to camelCase
    topics: ITopic[];
    imageUrl: string; // Ensure this matches the schema in CourseSchema
}
  