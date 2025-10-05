const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Address",
  tableName: "addresses",
  columns: {
    addressId: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    addressType: {
      type: String,
      nullable: false,
    },
    address1: {
      type: String,
      nullable: false,
    },
    address2: {
      type: String,
      nullable: true,
    },
    country: {
      type: String,
      nullable: false,
    },
    state: {
      type: String,
      nullable: false,
    },
    city: {
      type: String,
      nullable: false,
    },
    pincode: {
      type: String,
      nullable: false,
    },
    landmark: {
      type: String,
      nullable: true,
    },
    village: {
      type: String,
      nullable: true,
    },
    district: {
      type: String,
      nullable: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
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
