const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Password",
  tableName: "passwords",
  columns: {
    passwordId: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    hashedPassword: {
      type: String,
      nullable: false,
    },
    salt: {
      type: String,
      nullable: false,
    },
    expireAt: {
      type: "timestamp",
      nullable: true,
    },
    mustChange: {
      type: Boolean,
      default: false,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedAttempt: {
      type: "timestamp",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE",
    },
    passwordHistory: {
      target: "PasswordHistory",
      type: "one-to-many",
      inverseSide: "password",
      cascade: true,
    },
  },
});
