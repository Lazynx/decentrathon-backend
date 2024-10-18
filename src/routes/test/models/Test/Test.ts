import mongoose, { Schema, Document, Model } from 'mongoose';
import ITest from '../../dtos/Test/CreateTest.dto';

// Define the schema for Test
export const TestSchema: Schema = new Schema({
  question: { type: String, required: true },
  answers: { type: [String], required: true },
  correctAnswer: { type: String, required: true } // Adjusted to camelCase
});
