import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const httpHeaders = v.array(
  v.object({
    key: v.string(),
    value: v.string()
  })
);

const requestBody = v.object({
  text: v.optional(v.string()),
  base64: v.optional(v.string()),
  truncated: v.boolean(),
  size: v.number(),
  contentType: v.optional(v.string())
});

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    lastSeenAt: v.optional(v.number())
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  endpoints: defineTable({
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    source: v.union(v.literal("managed"), v.literal("custom")),
    subdomain: v.optional(v.string()),
    customDomain: v.optional(v.string()),
    pathPrefix: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    signingSecret: v.optional(v.string()),
    isArchived: v.boolean(),
    createdByUserId: v.id("users")
  })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_slug", ["userId", "slug"])
    .index("by_subdomain", ["subdomain"])
    .index("by_custom_domain", ["customDomain"]),

  tunnelSessions: defineTable({
    userId: v.id("users"),
    endpointId: v.optional(v.id("endpoints")),
    clientId: v.string(),
    tunnelId: v.string(),
    relayRegion: v.optional(v.string()),
    relayUrl: v.optional(v.string()),
    localTargetUrl: v.optional(v.string()),
    connectedAt: v.number(),
    disconnectedAt: v.optional(v.number()),
    lastHeartbeatAt: v.optional(v.number()),
    status: v.union(
      v.literal("connecting"),
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("errored")
    )
  })
    .index("by_user_id", ["userId"])
    .index("by_endpoint_id", ["endpointId"])
    .index("by_client_id", ["clientId"])
    .index("by_tunnel_id", ["tunnelId"])
    .index("by_status", ["status"]),

  requests: defineTable({
    userId: v.id("users"),
    endpointId: v.optional(v.id("endpoints")),
    tunnelSessionId: v.optional(v.id("tunnelSessions")),
    requestId: v.string(),
    method: v.string(),
    host: v.optional(v.string()),
    path: v.string(),
    query: v.optional(v.string()),
    url: v.optional(v.string()),
    source: v.union(
      v.literal("relay"),
      v.literal("capture"),
      v.literal("replay"),
      v.literal("mock")
    ),
    provider: v.optional(v.string()),
    receivedAt: v.number(),
    durationMs: v.optional(v.number()),
    requestHeaders: httpHeaders,
    requestBody,
    responseStatusCode: v.optional(v.number()),
    responseHeaders: v.optional(httpHeaders),
    responseBody: v.optional(requestBody),
    signatureVerified: v.optional(v.boolean()),
    signatureProvider: v.optional(v.string()),
    sharedToken: v.optional(v.string()),
    tags: v.optional(v.array(v.string()))
  })
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_received_at", ["userId", "receivedAt"])
    .index("by_endpoint_id_and_received_at", ["endpointId", "receivedAt"])
    .index("by_request_id", ["requestId"])
    .index("by_tunnel_session_id", ["tunnelSessionId"])
    .searchIndex("search_request_path", {
      searchField: "path",
      filterFields: ["userId", "endpointId", "method", "source"]
    }),

  requestShares: defineTable({
    userId: v.id("users"),
    requestId: v.id("requests"),
    token: v.string(),
    createdByUserId: v.id("users"),
    expiresAt: v.optional(v.number()),
    revokedAt: v.optional(v.number())
  })
    .index("by_user_id", ["userId"])
    .index("by_request_id", ["requestId"])
    .index("by_token", ["token"])
});
