/** Order flow configuration — keep values in sync with backend */
export const ORDER_CONFIG = {
  /** Fee for pickup by our delivery partner (in ₹) */
  PICKUP_FEE: 100,

  /** Number of days user has to send parcel after placing order */
  PARCEL_DEADLINE_DAYS: 7,

  /** Link to measurement guide (opens in new tab) */
  MEASUREMENT_GUIDE_URL: 'https://stitchup.in/guides/how-to-measure',

  /** Maximum audio recording duration in seconds */
  AUDIO_MAX_DURATION_SECONDS: 120,

  /** Supported audio mime types */
  AUDIO_MIME_TYPES: ['audio/webm', 'audio/mp4', 'audio/ogg'],
} as const;
