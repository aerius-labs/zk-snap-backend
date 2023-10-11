import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const proposalSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4(),
    required: true,
  },
  daoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'inactive',
  },
  options: {
    type: [String],
    required: true,
  },
  encryptionKeyPair: {
    type: { publicKey: String, privateKey: String },
    required: true,
  },
  result: {
    type: [Number],
    required: true,
  },
});

export const Proposal = mongoose.model('Proposal', proposalSchema);
