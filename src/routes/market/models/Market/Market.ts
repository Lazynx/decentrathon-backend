import { Schema } from "mongoose";
import IMarket from "../../dtos/MarketDTO";
import mongoose, { Model } from "mongoose";

export const CourseSchema: Schema<IMarket> = new Schema({

});
  
const CourseModel: Model<IMarket> = mongoose.model<IMarket>('Course', CourseSchema);
  
export default CourseModel;