import mongoose from "mongoose";
import { ac } from "../src/access-control-instance.js";
import { User } from "../src/models/user.model.js";

await mongoose.connect(process.env.MONGO_URI);

const admins = await User.find({ role: "admin" }).select("_id").lean();

for (const admin of admins) {
  await ac.access.grant({
    subjectId: admin._id.toString(),
    subjectType: "user",
    resourceType: "*",         // all resource types
    resourceId: "*",           // all resources
    permissions: [{ key: "*", effect: "allow" }],
    grantedBy: "system",
  });
  console.log("seeded", admin._id.toString());
}

process.exit(0);