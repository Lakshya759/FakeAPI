import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    fieldName: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "string",
        "number",
        "boolean",
        "email",
        "date",
        "phone",
        "url",
        "image",
        "uuid",
        "name",
        "object",
        "array",
      ],
    },
  },
  {
    _id: false,
  }
);

fieldSchema.add({
  children: [fieldSchema],
});

const schemaSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    schemaName: {
      type: String,
      required: true,
      trim: true,
    },
    endpointName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    fields: {
      type: [fieldSchema],
      default: [],
    },
    settings: {
        defaultCount: {
            type: Number,
            default: 10
        },

        delay: {
            type: Number,
            default: 0
        },

        errorRate: {
            type: Number,
            default: 0
        },

        errorCode: {
            type: Number,
            default: 500
        },

        crud: {
            type: Boolean,
            default: false
        }
    },
  },
  {
    timestamps: true,
  }
);

schemaSchema.index(
    {
        projectId: 1,
        endpointName: 1
    },
    {
        unique: true
    }
);

export const Schema = mongoose.model(
  "Schema",
  schemaSchema
);