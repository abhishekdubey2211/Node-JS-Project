const {
  typeormDataSource: AppDataSource,
} = require("../connections/MySqlDBConnection");
const { getTimestampPrefix } = require("../middlewares/AuditorMiddleware");
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const userRepo = AppDataSource.getRepository("User");
const passwordRepo = AppDataSource.getRepository("Password");
const addressRepo = AppDataSource.getRepository("Address");
const userDetailsRepo = AppDataSource.getRepository("UserDetails");

class UserService {
  // -------------------- VALIDATION --------------------
  static validateUserData(data) {
    const requiredFields = [
      "uniqueUserId",
      "employeeCode",
      "username",
      "firstName",
      "lastName",
      "gender",
      "dob",
      "email",
      "contact",
      "organisationName",
      "designation",
      "nationality",
      "userType",
    ];
    const missing = requiredFields.filter((f) => !data[f]);
    if (missing.length)
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  static validateAddressData(data) {
    const requiredFields = [
      "addressType",
      "address1",
      "country",
      "state",
      "city",
      "pincode",
    ];
    const missing = requiredFields.filter((f) => !data[f]);
    if (missing.length)
      throw new Error(`Missing required address fields: ${missing.join(", ")}`);
  }

  static validateUserDetailsData(data) {
    const requiredFields = ["parameterId", "parameterName", "srNo", "value"];
    const missing = requiredFields.filter((f) => !data[f]);
    if (missing.length)
      throw new Error(
        `Missing required user detail fields: ${missing.join(", ")}`
      );
  }
  // ---------------- Generate uniqueUserId ----------------
  static generateUniqueUserId(prefix = "USR") {
    const timestamp = getTimestampPrefix();
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random number
    return `${prefix}-${timestamp}-${randomNum}`;
  }

  // -------------------- USER --------------------
  static async createUser(data) {
    this.validateUserData(data);

    // Generate UUID for userId
    data.userId = uuidv4();

    // Step 1: Generate unique userId
    data.uniqueUserId = this.generateUniqueUserId();

    // Step 2: Generate custom salt (timestamp-based pepper)
    const salt = getTimestampPrefix();
    console.log("Generated salt/pepper:", salt);

    // Step 3: Hash password with bcrypt (10 rounds recommended)
    const hashedPassword = await bcrypt.hash(data.password + "~" + salt, 10);

    // Step 4: Remove raw password from user data
    const { password, ...userData } = data;

    // Step 5: Save User first
    const user = userRepo.create(userData);
    const savedUser = await userRepo.save(user);

    // Step 6: Calculate expiry date
    const expiryDays = parseInt(process.env.PASSWORD_EXPIRY_DAYS || "365", 10); // default 3665 days
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + expiryDays);

    // Step 7: Save password entry linked to user
    const passwordEntity = passwordRepo.create({
      hashedPassword,
      salt, // your custom salt/pepper
      expireAt, // expiry date
      user: savedUser, // relation
    });
    await passwordRepo.save(passwordEntity);

    return savedUser;
  }

  static async updateUser(userId, data) {
    this.validateUserData({ ...data, userId });
    await userRepo.update({ userId }, data);
    return await this.getUserById(userId);
  }

  static async getUserById(userId) {
    return await userRepo.findOne({
      where: { userId, isDeleted: false  ,isActive : true},
      relations: ["addresses", "userDetails"],
    });
  }

  static async getUserByEmailOrUsername(emailOrUsername) {
    return await userRepo.findOne({
      where: [
        { email: emailOrUsername, isDeleted: false },
        { username: emailOrUsername, isDeleted: false },
      ],
      relations: ["addresses", "userDetails"],
    });
  }

  static async getAllUsers() {
    return await userRepo.find({
      where: { isDeleted: false },
      relations: ["addresses", "userDetails"],
    });
  }

  static async deleteUser(userId) {
    return await userRepo.update(
      { userId },
      { isDeleted: true, deletedAt: new Date() }
    );
  }

  // -------------------- ADDRESS --------------------
  static async addAddressByUserId(userId, addressData) {
    this.validateAddressData(addressData);
    const user = await this.getUserById(userId);
    if (!user) throw new Error("User not found");
    const address = addressRepo.create({ ...addressData, user });
    return await addressRepo.save(address);
  }

  static async updateAddressById(addressId, updateData) {
    this.validateAddressData(updateData);
    await addressRepo.update({ addressId }, updateData);
    return await addressRepo.findOne({ where: { addressId } });
  }

  static async getAddressByUserId(userId) {
    return await addressRepo.find({
      where: { user: { userId }, deletedAt: null },
    });
  }

  static async deleteAddressByUserIdAndAddressId(userId, addressId) {
    const address = await addressRepo.findOne({
      where: { addressId, user: { userId } },
    });
    if (!address) throw new Error("Address not found for user");
    return await addressRepo.update({ addressId }, { deletedAt: new Date() });
  }

  // -------------------- USER DETAILS --------------------
  static async addUserDetailsByUserId(userId, detailsData) {
    if (!Array.isArray(detailsData)) detailsData = [detailsData];
    const user = await this.getUserById(userId);
    if (!user) throw new Error("User not found");

    const savedDetails = [];
    for (const d of detailsData) {
      this.validateUserDetailsData(d);
      const detail = userDetailsRepo.create({ ...d, user });
      savedDetails.push(await userDetailsRepo.save(detail));
    }
    return savedDetails;
  }

  static async updateUserDetailsByUserIdAndParameterId(
    userId,
    parameterId,
    updateData
  ) {
    const detail = await userDetailsRepo.findOne({
      where: { user: { userId }, parameterId },
    });
    if (!detail) throw new Error("User detail not found");
    return await userDetailsRepo.save({ ...detail, ...updateData });
  }

  static async getUserDetailsByUserId(userId) {
    return await userDetailsRepo.find({
      where: { user: { userId }, deletedAt: null },
    });
  }

  static async deleteSingleUserParameterDetailsByUserIdAndParameterId(
    userId,
    parameterId
  ) {
    const detail = await userDetailsRepo.findOne({
      where: { user: { userId }, parameterId },
    });
    if (!detail) throw new Error("User detail not found");
    return await userDetailsRepo.update(
      { id: detail.id },
      { deletedAt: new Date() }
    );
  }
}

module.exports = UserService;
