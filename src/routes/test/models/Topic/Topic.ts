import { Schema } from "mongoose";
import { TestSchema } from "../Test/Test";

// Define the schema for Topic
export const TopicSchema: Schema = new Schema({
    topic: { type: String, required: true },
    conspect: { type: String, required: true },
    tests: { type: [TestSchema], required: true },
    is_completed: { type: Boolean, default: false }
});
  