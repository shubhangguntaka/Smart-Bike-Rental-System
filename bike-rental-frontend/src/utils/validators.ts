import { REGEX } from "./constants";

/**
 * Validate Name
 */
export const validateName = (name: string): string => {

  if (!name.trim()) {
    return "Name is required.";
  }

  if (!REGEX.NAME.test(name)) {
    return "Enter a valid name.";
  }

  return "";
};

/**
 * Validate Email
 */
export const validateEmail = (email: string): string => {

  if (!email.trim()) {
    return "Email is required.";
  }

  if (!REGEX.EMAIL.test(email)) {
    return "Enter a valid email address.";
  }

  return "";
};

/**
 * Validate Phone Number
 */
export const validatePhone = (phone: string): string => {

  if (!phone.trim()) {
    return "Phone number is required.";
  }

  if (!REGEX.PHONE.test(phone)) {
    return "Enter a valid 10-digit mobile number.";
  }

  return "";
};

/**
 * Validate Password
 */
export const validatePassword = (password: string): string => {

  if (!password) {
    return "Password is required.";
  }

  if (!REGEX.PASSWORD.test(password)) {
    return "Password must contain uppercase, lowercase, number, special character and be at least 8 characters.";
  }

  return "";
};

/**
 * Validate OTP
 */
export const validateOTP = (otp: string): string => {

  if (!otp.trim()) {
    return "OTP is required.";
  }

  if (!REGEX.OTP.test(otp)) {
    return "OTP must be 6 digits.";
  }

  return "";
};

/**
 * Validate Aadhaar
 */
export const validateAadhaar = (aadhaar: string): string => {

  if (!aadhaar.trim()) {
    return "Aadhaar number is required.";
  }

  if (!REGEX.AADHAAR.test(aadhaar)) {
    return "Enter a valid Aadhaar number.";
  }

  return "";
};

/**
 * Validate Driving License
 */
export const validateDrivingLicense = (license: string): string => {

  if (!license.trim()) {
    return "Driving License is required.";
  }

  if (!REGEX.DRIVING_LICENSE.test(license)) {
    return "Enter a valid Driving License number.";
  }

  return "";
};

/**
 * Validate Vehicle Number
 */
export const validateVehicleNumber = (vehicleNumber: string): string => {

  if (!vehicleNumber.trim()) {
    return "Vehicle number is required.";
  }

  if (!REGEX.VEHICLE_NUMBER.test(vehicleNumber)) {
    return "Enter a valid vehicle registration number.";
  }

  return "";
};

/**
 * Validate Pincode
 */
export const validatePincode = (pincode: string): string => {

  if (!pincode.trim()) {
    return "Pincode is required.";
  }

  if (!REGEX.PINCODE.test(pincode)) {
    return "Enter a valid pincode.";
  }

  return "";
};

/**
 * Validate Required Field
 */
export const validateRequired = (
  value: string,
  fieldName: string
): string => {

  if (!value.trim()) {
    return `${fieldName} is required.`;
  }

  return "";
};

/**
 * Validate Positive Number
 */
export const validatePositiveNumber = (
  value: number,
  fieldName: string
): string => {

  if (value <= 0) {
    return `${fieldName} must be greater than zero.`;
  }

  return "";
};