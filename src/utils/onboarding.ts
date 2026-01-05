/**
 * Check if onboarding should be shown based on version.
 * Shows onboarding for:
 * - First-time users (no stored version)
 * - Users who haven't seen onboarding for current minor version (0.X.0)
 */
export const shouldShowOnboarding = (storedVersion: string | undefined, currentVersion: string): boolean => {
  // First time user
  if (!storedVersion) return true;

  // Parse versions to compare minor versions
  const parseMinorVersion = (version: string): string => {
    const parts = version.split('.');
    if (parts.length < 2) return '0.0';
    return `${parts[0]}.${parts[1]}`;
  };

  const storedMinor = parseMinorVersion(storedVersion);
  const currentMinor = parseMinorVersion(currentVersion);

  // Show if minor version changed (e.g., 0.12.x -> 0.13.x)
  return storedMinor !== currentMinor;
};

/**
 * Get current extension version from manifest
 */
export const getCurrentVersion = (): string => {
  return chrome.runtime.getManifest().version;
};
