import { UserData } from '../../features/auth/models/auth.model';

/**
 * Safely parses the user data from localStorage
 */
export function getUserData(): UserData | null {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr) as UserData;
  } catch {
    return null;
  }
}

/**
 * Returns the user ID as string or null
 * Checks dedicated userId key first, falls back to user object
 */
export function getUserId(): string | null {
  try {
    // First try to get from dedicated userId key
    const userId = localStorage.getItem('userId');
    if (userId) return userId;

    // Fallback to user object if userId key doesn't exist
    const userData = getUserData();
    return userData?.id?.toString() ?? null;
  } catch {
    return null;
  }
}
/**
 * Returns the user role or null
 */
export function getUserRole(): string {
  return getUserData()?.role ?? 'manager';
}

/**
 * Returns the user location as string or null
 */
export function getUserLocation(): string | null {
  try {
    const location = localStorage.getItem('location');
    return location && location !== '' ? location : null;
  } catch {
    return null;
  }
}

/**
 * Returns the full name (first + last) or null
 */
export function getUserFullName(): string | null {
  const user = getUserData();
  if (!user) return null;
  return `${user.firstName} ${user.lastName}`.trim();
}

/**
 * Returns the JWT token or null
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

/**
 * Returns the user email or null
 */
export function getUserEmail(): string | null {
  return getUserData()?.email ?? null;
}

/**
 * Returns the user's image URL or null
 */
export function getUserImage(): string | null {
  return getUserData()?.image ?? null;
}
