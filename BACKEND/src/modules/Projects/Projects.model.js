import mongoose,{Schema} from "mongoose";

const projectSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    projectName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index(
  {
    userId: 1,
    projectName: 1,
  },
  {
    unique: true,
  }
);

export const Project = mongoose.model("Project", projectSchema);