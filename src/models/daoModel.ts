import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const daoSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4(),
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: false,
  },
  membersRoot: {
    type: String,
    required: true,
    unique: true,
  },
});

export const Dao = mongoose.model('Dao', daoSchema);
