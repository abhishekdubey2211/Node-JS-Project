const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "UserSession",
  tableName: "end_user_sessions",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    sessionId: {
      type: "varchar",
      length: 100,
      unique: true,
      nullable: false,
    },
    sessionToken: {
      type: "varchar",
      length: 50,
      unique: true,
      nullable: false,
    },
    loggedInAt: {
      type: "timestamp",
      createDate: true,
    },
    loggedOutAt: {
      type: "timestamp",
      nullable: true,
    },
    expiresAt: {
      type: "timestamp",
      nullable: false,
    },
    active: {
      type: "boolean",
      default: true,
      nullable: false,
    },
    ip: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    device: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    location: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    userAgent: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "userId" },
      inverseSide: "sessions",
      nullable: false,
    },
  },
  indices: [
    { name: "idx_session_id", columns: ["sessionId"], unique: true },
    { name: "idx_session_active", columns: ["active"] },
    { name: "idx_session_expires_at", columns: ["expiresAt"] },
  ],
});
