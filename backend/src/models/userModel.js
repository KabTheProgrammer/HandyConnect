import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    userType: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },
    phone: String,
    bio: String,

    // 🏙️ Saved readable location
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    // 📍 GeoJSON coordinates (for distance queries)
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    // 🧭 Track location preference
    useCurrentLocation: {
      type: Boolean,
      default: false, // false = use saved location, true = use GPS
    },

    skills: [String],
    profileImage: String,

    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },

    lastLogout: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual populate for reviews
userSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "provider",
});

// ✅ Create a 2dsphere index for geo queries
userSchema.index({ coordinates: "2dsphere" });

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
