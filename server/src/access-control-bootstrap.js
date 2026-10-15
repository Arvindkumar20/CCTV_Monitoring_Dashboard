// src/access-control-bootstrap.js
import { ac } from "./access-control-instance.js";
import logger from "./config/logger.js";

export async function bootstrapAccessControl() {
  // 1. Permissions — jo bhi tumhare app mein hai
  await ac.permissions.registerMany([
    // camera resource
    { resourceType: "camera", key: "view" },
    { resourceType: "camera", key: "recordings" },
    { resourceType: "camera", key: "notifications" },
    { resourceType: "camera", key: "download" },
    { resourceType: "camera", key: "ptz" },
    { resourceType: "camera", key: "manage" },

    // category resource
    { resourceType: "category", key: "view" },
    { resourceType: "category", key: "manage" },
  ]);

  // 2. Roles — tumhare existing enum se map
  await ac.roles.createMany([
    {
      key: "camera_viewer",
      scope: "resourceType",
      resourceType: "camera",
      permissions: [
        { resourceType: "camera", key: "view" },
        { resourceType: "camera", key: "recordings" },
      ],
    },
    {
      key: "camera_operator",
      scope: "resourceType",
      resourceType: "camera",
      permissions: [
        { resourceType: "camera", key: "view" },
        { resourceType: "camera", key: "recordings" },
        { resourceType: "camera", key: "notifications" },
        { resourceType: "camera", key: "ptz" },
      ],
    },
    {
      key: "camera_manager",
      scope: "resourceType",
      resourceType: "camera",
      permissions: [
        { resourceType: "camera", key: "view" },
        { resourceType: "camera", key: "recordings" },
        { resourceType: "camera", key: "notifications" },
        { resourceType: "camera", key: "download" },
        { resourceType: "camera", key: "ptz" },
        { resourceType: "camera", key: "manage" },
      ],
    },
  ]);

  logger.info("✅ Access control bootstrapped");
}