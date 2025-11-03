import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  examDate: { type: Date, required: true },
  endDate: { type: Date },
  subject: { type: String },
  venue: { type: String },
  instructions: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
