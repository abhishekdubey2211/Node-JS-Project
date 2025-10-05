const { UUID } = require("sequelize");
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    // Optional numeric auto-increment ID
 id: {
  type: "int",
  primary: true,
  generated: "increment",
    nullable: false, // must be NOT NULL
},
    // userId: {
    //   type: "uuid",
    //   primary: true,
    //   generated: "uuid",
    // },
    
      // Auto-generated UUID (not primary)
      // Auto-generated UUID (not primary)
    userId: {
      type: "varchar",
      length: 36,
      nullable: false,
      unique: true,
    },
    uniqueUserId: {
      type: String,
      nullable: false,
      unique: true,
    },
    employeeCode: {
      type: String,
      nullable: false,
      unique: true,
    },
    username: {
      type: String,
      nullable: false,
      unique: true,
    },
    firstName: {
      type: String,
      nullable: false,
    },
    middleName: {
      type: String,
      nullable: true,
    },
    lastName: {
      type: String,
      nullable: false,
    },
    gender: {
      type: String,
      nullable: false,
    },
    dob: {
      type: Date,
      nullable: false,
    },
    email: {
      type: String,
      nullable: false,
      unique: true,
    },
    alternateEmail: {
      type: String,
      nullable: true,
    },
    contact: {
      type: String,
      nullable: false,
    },
    alternateContact: {
      type: String,
      nullable: true,
    },
    organisationName: {
      type: String,
      nullable: false,
    },
    designation: {
      type: String,
      nullable: false,
    },
    nationality: {
      type: String,
      nullable: false,
    },
    profileImage: {
      type: String,
      nullable: true,
    },
    userType: {
      type: String,
      nullable: false,
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
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  relations: {
    addresses: {
      target: "Address",
      type: "one-to-many",
      inverseSide: "user",
      cascade: true,
    },
    passwords: {
      target: "Password",
      type: "one-to-many",
      inverseSide: "user",
      cascade: true,
    },
    userDetails: {
      target: "UserDetails",
      type: "one-to-many",
      inverseSide: "user",
      cascade: true,
    },
  },
});
