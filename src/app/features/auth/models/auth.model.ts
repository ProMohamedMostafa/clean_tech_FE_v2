// ==========================
// Authentication Models
// ==========================

/**
 * Interface representing the login request payload.
 */
export interface LoginData {
  /** User's email or username used for login */
  emailOrUserName: string;
  /** User's password */
  password: string;
}

/**
 * Interface representing the response returned from a login API call.
 */
export interface LoginResponse {
  /** HTTP status code of the response */
  statusCode: number;
  /** Additional metadata, if any (usually null) */
  meta: any | null;
  /** Indicates whether the login was successful */
  succeeded: boolean;
  /** Message describing the result */
  message: string;
  /** Error details if login failed, otherwise null */
  error: any | null;
  /** Business-specific error code, if applicable */
  businessErrorCode: any | null;
  /** The user data object returned on successful login */
  data: UserData;
}

/**
 * Interface representing the user data returned upon successful login.
 */
export interface UserData {
  /** Unique identifier of the user */
  id: number;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** Role assigned to the user (e.g., Admin, User) */
  role: string;
  /** URL or path to the user's profile image, if any */
  image: string | null;
  /** User's location info, if available */
  location: string | null;
  /** User-specific settings or preferences */
  settings: any | null;
  /** JWT token issued on login */
  token: string;
  /** Expiration time of the token in ISO string format */
  tokenExpires: string;
}

/**
 * Interface representing the request payload for changing a user's password.
 */
export interface ChangePasswordRequest {
  /** Current password of the user */
  currentPassword: string;
  /** New password the user wants to set */
  newPassword: string;
  /** Confirmation of the new password */
  newPasswordConfirmation: string;
}

// ==========================
// User Profile Models
// ==========================

/**
 * Interface representing the detailed profile information of a user.
 */
export interface UserProfile {
  /** Unique identifier of the user */
  id: number;
  /** Username or login name */
  userName: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** URL or path to the profile image, if available */
  image: string | null;
  /** User's gender (could be string, enum or number depending on backend) */
  gender: string;
  /** Name of the user's country */
  countryName: string;
  /** User's nationality */
  nationalityName: string;
  /** User's email address */
  email: string;
  /** User's phone number */
  phoneNumber: string;
  /** User's birthdate as a string */
  birthdate: string;
  /** National ID number or similar identification */
  idNumber: string;
  /** Name of the provider if any */
  providerName: string | null;
  /** Name of the user's manager */
  managerName: string;
  /** Role assigned to the user */
  role: string;
  /** Numeric ID for the user's role */
  roleId: number;
  /** Provider ID if any */
  providerId: number | null;
  /** Whether the user is currently working */
  isWorking: boolean;
}

/**
 * Interface representing the API response wrapper for user profile requests.
 */
export interface ProfileResponse {
  /** HTTP status code of the response */
  statusCode: number;
  /** Additional metadata (usually null) */
  meta: any | null;
  /** Indicates if the request succeeded */
  succeeded: boolean;
  /** Message describing the result */
  message: string;
  /** Error message if the request failed, otherwise null */
  error: string | null;
  /** Business error code if any */
  businessErrorCode: number | null;
  /** Detailed user profile data */
  data: UserProfile;
}

// ==========================
// Password Reset Models
// ==========================

/**
 * Interface representing the payload to reset a user's password.
 */
export interface PasswordResetPayload {
  /** Email address of the user requesting password reset */
  email: string;
  /** Token received for password reset validation */
  token: string;
  /** New password to be set */
  newPassword: string;
  /** Confirmation of the new password */
  newPasswordConfirmation: string;
}

export interface Role {
  id: number;
  name: string;
}
