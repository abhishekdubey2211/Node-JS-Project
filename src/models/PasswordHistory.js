const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "PasswordHistory",
  tableName: "passwordHistory",
  columns: {
    historyId: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    hashedPassword: {
      type: String,
      nullable: false,
    },
    changedOn: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    password: {
      target: "Password",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});
