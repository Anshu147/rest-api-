import mongoose from 'mongoose';

export const TASK_STATUSES = ['todo', 'in_progress', 'completed'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Status must be one of: todo, in_progress, completed'
      },
      default: 'todo'
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: 'Priority must be one of: low, medium, high'
      },
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    },
    projectId: {
      type: Number,
      required: [true, 'Project ID is required'],
      index: true
    },
    ownerId: {
      type: Number,
      required: [true, 'Owner ID is required'],
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for performant querying and filtering
taskSchema.index({ ownerId: 1, status: 1 });
taskSchema.index({ ownerId: 1, priority: 1 });
taskSchema.index({ ownerId: 1, projectId: 1 });

export const Task = mongoose.model('Task', taskSchema);
