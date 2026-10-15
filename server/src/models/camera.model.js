import mongoose from "mongoose";
// ✅ Detection types enum
const DETECTION_TYPES = ["person", "fire", "smoke", "vehicle", "intrusion"];

// ✅ Time slot schema - ek detection type ke liye kab-kab on hai
const detectionSlotSchema = new mongoose.Schema(
  {
    detectionType: {
      type: String,
      enum: DETECTION_TYPES,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true, // master switch
    },
    // ✅ Days of week (0=Sunday, 1=Monday ... 6=Saturday)
    days: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: (arr) => arr.every((d) => d >= 0 && d <= 6),
        message: "Days must be 0-6",
      },
    },
    // ✅ Multiple time windows per day (e.g., 06:00-12:00 AND 22:00-23:59)
    timeWindows: [
      {
        startTime: {
          type: String, // "HH:mm" format e.g. "22:00"
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        endTime: {
          type: String, // "HH:mm" format e.g. "06:00"
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
      },
    ],
    // ✅ Optional: confidence override per schedule
    confidenceOverride: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
  },
  { _id: false },
);

// ✅ Full schedule schema
const detectionScheduleSchema = new mongoose.Schema(
  {
    // ✅ Master switch - agar false hai to koi bhi detection nahi chalega
    scheduleEnabled: {
      type: Boolean,
      default: false, // default: purana behavior (always on)
    },
    // ✅ Timezone for schedule evaluation
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    // ✅ Per-detection-type schedules
    slots: {
      type: [detectionSlotSchema],
      default: [],
    },
    // ✅ Special: night mode (shortcut for 22:00 - 06:00)
    nightModeEnabled: {
      type: Boolean,
      default: false,
    },
    nightModeStart: { type: String, default: "22:00" },
    nightModeEnd: { type: String, default: "06:00" },
  },
  { _id: false },
);

// ═══════════════════════════════════════════
// ✅ UPDATE detectionSettings schema
// ═══════════════════════════════════════════
const detectionSettingsSchema = new mongoose.Schema(
  {
    personConfidence: { type: Number, default: 0.45, min: 0, max: 1 },
    fireConfidence: { type: Number, default: 0.5, min: 0, max: 1 },
    smokeConfidence: { type: Number, default: 0.5, min: 0, max: 1 },
    vehicleConfidence: { type: Number, default: 0.5, min: 0, max: 1 },
    frameSampleRate: { type: Number, default: 5 },
    cooldownMs: { type: Number, default: 30000 },

    // ✅ Master toggles (backward compatible)
    detectPerson: { type: Boolean, default: true },
    detectFire: { type: Boolean, default: true },
    detectSmoke: { type: Boolean, default: true },
    detectVehicle: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },

    // ✅ NEW: Schedule
    schedule: {
      type: detectionScheduleSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

const cameraSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Camera name is required"],
      trim: true,
      minlength: [3, "Camera name must be at least 3 characters"],
      maxlength: [100, "Camera name cannot exceed 100 characters"],
    },
    rtspUrl: {
      type: String,
      required: [true, "RTSP URL is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return v.startsWith("rtsp://") || v.startsWith("rtsps://");
        },

        message: "RTSP URL must start with rtsp:// or rtsps://",
      },
    },
    mainCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Main category is required"],
      index: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
      index: true,
    },
    subSubCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NestedSubCategory",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
      index: true,
    },
    streamStatus: {
      type: String,
      enum: [
        "stopped",
        "startted",
        "streaming",
        "unknown",
        "connecting",
        "error",
        "online",
        "offline",
      ],
      default: "online",
      index: true,
    },
    detectionSettings: {
      type: detectionSettingsSchema,
      default: () => ({}),
      // personConfidence: { type: Number, default: 0.45 },
      // fireConfidence: { type: Number, default: 0.5 },
      // frameSampleRate: { type: Number, default: 5 },
      // cooldownMs: { type: Number, default: 30000 },
      // detectPerson: { type: Boolean, default: true },
      // detectFire: { type: Boolean, default: true },
      // detectSmoke: { type: Boolean, default: true },
      // enabled: { type: Boolean, default: true },
    },
    // ✅ NEW: HLS URL - PERMANENTLY STORED
    hlsUrl: {
      type: String,
      default: null,
      index: true,
    },

    // ✅ NEW: Stream Configuration with HLS URL
    streamConfig: {
      hlsUrl: { type: String, default: null },
      streamKey: { type: String, default: null },
      transport: {
        type: String,
        enum: ["tcp", "udp", "auto"],
        default: "auto",
      },
      healthStatus: {
        type: String,
        enum: [
          "online",
          "offline",
          "connecting",
          "error",
          "stopped",
          "starting",
        ],
        default: "offline",
      },
      lastStreamStart: { type: Date, default: null },
      lastStreamStop: { type: Date, default: null },
      streamDuration: { type: Number, default: 0 },
      lastError: { type: String, default: null },
      lastErrorAt: { type: Date, default: null },
      lastHealthyAt: { type: Date, default: null },
      framesReceived: { type: Number, default: 0 },
    },

    lastPingAt: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    streamSettings: {
      type: {
        protocol: { type: String, default: "rtsp" },
        port: { type: Number, default: 554 },
        transport: { type: String, enum: ["tcp", "udp"], default: "tcp" },
        latency: { type: Number, default: 200 },
        fps: { type: Number, default: 25 },
        resolution: { type: String, default: "1920x1080" },
      },
      default: {},
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // cameraSchema mein add karein
    cameraId: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        return `CAM-${this._id.toString().slice(-6).toUpperCase()}`;
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ✅ Compound index for unique camera name under same user
cameraSchema.index({ name: 1, createdBy: 1 }, { unique: true });

// ✅ Index for RTSP URL (for quick lookups)
cameraSchema.index({ rtspUrl: 1 });

// ✅ Index for HLS URL (for quick lookups)
cameraSchema.index({ hlsUrl: 1 });

// ✅ Compound indexes for common queries
cameraSchema.index({ mainCategoryId: 1, status: 1 });
cameraSchema.index({ subCategoryId: 1, status: 1 });
cameraSchema.index({ subSubCategoryId: 1, status: 1 });
cameraSchema.index({ streamStatus: 1, lastPingAt: -1 });
cameraSchema.index({ createdAt: -1 });

// ✅ NEW: Index for stream status with hlsUrl
cameraSchema.index({ hlsUrl: 1, streamStatus: 1 });

// Pre-save middleware
cameraSchema.pre("save", async function (next) {
  // Import models
  const Category = mongoose.model("Category");
  const SubCategory = mongoose.model("SubCategory");
  const NestedSubCategory = mongoose.model("NestedSubCategory");

  // Verify main category exists
  const mainCategory = await Category.findById(this.mainCategoryId);
  if (!mainCategory) {
    throw new Error("Main category not found");
  }

  // If sub category provided, verify it belongs to main category
  if (this.subCategoryId) {
    const subCategory = await SubCategory.findById(this.subCategoryId);
    if (!subCategory) {
      throw new Error("Sub category not found");
    }
    if (
      subCategory.mainCategoryId.toString() !== this.mainCategoryId.toString()
    ) {
      throw new Error("Sub category must belong to the selected main category");
    }
  }

  // If nested sub category provided, verify it belongs to sub category
  if (this.subSubCategoryId) {
    if (!this.subCategoryId) {
      throw new Error(
        "Sub category is required when selecting nested sub category",
      );
    }

    const nestedSubCategory = await NestedSubCategory.findById(
      this.subSubCategoryId,
    );
    if (!nestedSubCategory) {
      throw new Error("Nested sub category not found");
    }

    if (
      nestedSubCategory.subCategoryId.toString() !==
      this.subCategoryId.toString()
    ) {
      throw new Error(
        "Nested sub category must belong to the selected sub category",
      );
    }

    if (
      nestedSubCategory.mainCategoryId.toString() !==
      this.mainCategoryId.toString()
    ) {
      throw new Error(
        "Nested sub category must belong to the selected main category",
      );
    }
  }

  return;
});

// ✅ NEW: Pre-update middleware to handle hlsUrl
cameraSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // If stream is being stopped, clear hlsUrl
  if (update.streamStatus === "stopped" || update.streamStatus === "offline") {
    if (!update.hlsUrl) {
      // Keep existing hlsUrl if not explicitly cleared
    }
  }

  return;
});

// ✅ NEW: Method to get stream URL
cameraSchema.methods.getStreamUrl = function () {
  // First check streamConfig
  if (this.streamConfig?.hlsUrl) {
    return this.streamConfig.hlsUrl;
  }
  // Then check main hlsUrl
  if (this.hlsUrl) {
    return this.hlsUrl;
  }
  return null;
};

// ✅ NEW: Method to check if stream is healthy
cameraSchema.methods.isStreamHealthy = function () {
  // Check if we have a healthy timestamp
  const lastHealthy = this.streamConfig?.lastHealthyAt || this.lastPingAt;
  if (!lastHealthy) return false;

  const now = Date.now();
  const age = now - new Date(lastHealthy).getTime();

  // Stream is healthy if last ping was within 30 seconds
  return age < 30000 && this.streamStatus === "streaming";
};

// ✅ NEW: Method to update stream status with hlsUrl
cameraSchema.methods.updateStream = async function (status, hlsUrl = null) {
  this.streamStatus = status;
  this.lastPingAt = new Date();

  if (hlsUrl !== undefined) {
    this.hlsUrl = hlsUrl;
    if (!this.streamConfig) {
      this.streamConfig = {};
    }
    this.streamConfig.hlsUrl = hlsUrl;
  }

  if (status === "streaming") {
    this.streamConfig.lastHealthyAt = new Date();
    this.streamConfig.healthStatus = "online";
    if (!this.streamConfig.lastStreamStart) {
      this.streamConfig.lastStreamStart = new Date();
    }
  }

  if (status === "stopped" || status === "offline" || status === "error") {
    this.streamConfig.healthStatus = status;
    this.streamConfig.lastStreamStop = new Date();
  }

  await this.save();
  return this;
};

// ✅ NEW: Static method to get all cameras with stream URLs
cameraSchema.statics.getAllWithStreams = async function (userId, userRole) {
  const filter = userRole === "admin" ? {} : { createdBy: userId };

  const cameras = await this.find(filter)
    .populate("mainCategoryId", "name")
    .populate("subCategoryId", "name")
    .populate("subSubCategoryId", "name")
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email")
    .sort("-createdAt")
    .lean();

  // ✅ Add stream availability info
  return cameras.map((camera) => ({
    ...camera,
    // Always return hlsUrl (even if null)
    hlsUrl: camera.hlsUrl || null,
    streamConfig: camera.streamConfig || {},
    isStreaming:
      camera.streamStatus === "streaming" && camera.isStreamHealthy(),
  }));
};

// ✅ NEW: Static method to get active streams
cameraSchema.statics.getActiveStreams = async function (userId, userRole) {
  const filter = { streamStatus: "streaming" };

  if (userRole !== "admin") {
    filter.createdBy = userId;
  }

  return this.find(filter)
    .populate("mainCategoryId", "name")
    .populate("createdBy", "fullName email")
    .select("name hlsUrl streamStatus streamConfig lastPingAt")
    .sort("-lastPingAt");
};

// ✅ NEW: Static method to cleanup stale streams
cameraSchema.statics.cleanupStaleStreams = async function () {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - 60000); // 1 minute ago

  const staleCameras = await this.find({
    streamStatus: "streaming",
    $or: [
      { lastPingAt: { $lt: staleThreshold } },
      { "streamConfig.lastHealthyAt": { $lt: staleThreshold } },
    ],
  });

  let cleanedCount = 0;
  for (const camera of staleCameras) {
    camera.streamStatus = "offline";
    camera.streamConfig.healthStatus = "offline";
    camera.streamConfig.lastError = "Stream stale - no ping received";
    camera.streamConfig.lastErrorAt = new Date();
    await camera.save();
    cleanedCount++;
  }

  return cleanedCount;
};

// Virtual for full category path
cameraSchema.virtual("categoryPath").get(function () {
  return {
    main: this.mainCategoryId,
    sub: this.subCategoryId,
    subSub: this.subSubCategoryId,
  };
});

// Virtual for full path name
cameraSchema.virtual("fullPath").get(async function () {
  const path = [];
  const Category = mongoose.model("Category");
  const SubCategory = mongoose.model("SubCategory");
  const NestedSubCategory = mongoose.model("NestedSubCategory");

  // Get main category
  const mainCategory = await Category.findById(this.mainCategoryId);
  if (mainCategory) {
    path.push(mainCategory.name);
  }

  // Get sub category
  if (this.subCategoryId) {
    const subCategory = await SubCategory.findById(this.subCategoryId);
    if (subCategory) {
      path.push(subCategory.name);
    }
  }

  // Get nested sub category
  if (this.subSubCategoryId) {
    const nestedSubCategory = await NestedSubCategory.findById(
      this.subSubCategoryId,
    );
    if (nestedSubCategory) {
      path.push(nestedSubCategory.name);
    }
  }

  return path.join(" > ");
});

// ✅ Virtual for stream availability
cameraSchema.virtual("hasStream").get(function () {
  return !!this.hlsUrl;
});

// ✅ Virtual for stream health
cameraSchema.virtual("streamHealth").get(function () {
  if (!this.streamConfig?.lastHealthyAt) return "unknown";

  const now = Date.now();
  const age = now - new Date(this.streamConfig.lastHealthyAt).getTime();

  if (age < 10000) return "excellent";
  if (age < 30000) return "good";
  if (age < 60000) return "fair";
  return "poor";
});

// Method to check if user can modify
cameraSchema.methods.canModify = function (userId, userRole) {
  if (userRole === "admin") return true;
  return this.createdBy.toString() === userId.toString();
};

// Method to update stream status
cameraSchema.methods.updateStreamStatus = async function (status) {
  this.streamStatus = status;
  this.lastPingAt = new Date();
  await this.save();
  return this;
};

// Static method to get cameras by category
cameraSchema.statics.getByCategory = async function (
  categoryId,
  categoryType,
  userId,
  userRole,
) {
  const filter = {};

  if (categoryType === "main") {
    filter.mainCategoryId = categoryId;
  } else if (categoryType === "sub") {
    filter.subCategoryId = categoryId;
  } else if (categoryType === "nested") {
    filter.subSubCategoryId = categoryId;
  }

  if (userRole !== "admin") {
    filter.createdBy = userId;
  }

  return this.find(filter)
    .populate("mainCategoryId", "name")
    .populate("subCategoryId", "name")
    .populate("subSubCategoryId", "name")
    .populate("createdBy", "fullName email")
    .sort("-createdAt");
};

// Static method to get statistics
cameraSchema.statics.getStats = async function (userId, userRole) {
  const filter = userRole === "admin" ? {} : { createdBy: userId };

  const [
    total,
    active,
    inactive,
    maintenance,
    online,
    offline,
    streaming,
    byCategory,
  ] = await Promise.all([
    this.countDocuments(filter),
    this.countDocuments({ ...filter, status: "active" }),
    this.countDocuments({ ...filter, status: "inactive" }),
    this.countDocuments({ ...filter, status: "maintenance" }),
    this.countDocuments({ ...filter, streamStatus: "online" }),
    this.countDocuments({ ...filter, streamStatus: "offline" }),
    this.countDocuments({ ...filter, streamStatus: "streaming" }),
    this.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$mainCategoryId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          categoryName: { $arrayElemAt: ["$category.name", 0] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    total,
    active,
    inactive,
    maintenance,
    online,
    offline,
    streaming,
    byCategory,
  };
};

const Camera = mongoose.model("Camera", cameraSchema);

export default Camera;
