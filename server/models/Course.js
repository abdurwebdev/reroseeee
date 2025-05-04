const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    instructor: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Required for creator courses, not for admin courses
    },
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "rejected"],
      default: "draft",
    },
    rejectionReason: {
      type: String,
      required: false,
    },
    videos: [
      {
        url: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
        },
        thumbnail: {
          type: String,
          required: false,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        dislikes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        comments: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            username: {
              type: String,
              required: true,
            },
            profileImage: {
              type: String,
              required: false,
            },
            comment: {
              type: String,
              required: true,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
            isCreator: {
              type: Boolean,
              default: false,
            },
            replies: [
              {
                userId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                },
                username: {
                  type: String,
                  required: true,
                },
                profileImage: {
                  type: String,
                  required: false,
                },
                comment: {
                  type: String,
                  required: true,
                },
                createdAt: {
                  type: Date,
                  default: Date.now,
                },
                isCreator: {
                  type: Boolean,
                  default: false,
                },
              },
            ],
          },
        ],
      },
    ],
    paymentOptions: {
      jazzCash: {
        type: Boolean,
        default: false
      },
      easyPaisa: {
        type: Boolean,
        default: false
      },
      payFast: {
        type: Boolean,
        default: false
      },
      bankTransfer: {
        type: Boolean,
        default: false
      }
    },
    purchaseLink: {
      type: String,
      required: false,
    },
    isPurchased: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);
