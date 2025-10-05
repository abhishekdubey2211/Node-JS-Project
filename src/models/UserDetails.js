const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "UserDetails",
  tableName: "userDetails",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    parameterId: {
      type: String,
      nullable: false,
    },
    parameterName: {
      type: String,
      nullable: false,
    },
    srNo: {
      type: Number,
      nullable: false,
    },
    value: {
      type: String,
      nullable: false,
    },
    description: {
      type: String,
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
    deletedAt: {
      type: "timestamp",
      nullable: true,
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
  },
});
