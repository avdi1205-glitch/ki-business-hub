// Professional conversion-optimized color system
export const colorSystem = {
  // Brand Colors
  primary: "#2563eb", // Trust Blue
  secondary: "#10b981", // Success Green
  accent: "#f59e0b", // Optimism Gold
  danger: "#ef4444", // Urgency Red
  premium: "#8b5cf6", // Premium Purple

  // Gradients (für Premium-Feel)
  gradientPrimary: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
  gradientSuccess: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  gradientPremium: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  gradientHot: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  gradientGold: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",

  // Text Colors
  textPrimary: "#1f2937", // Dark Gray (high contrast)
  textSecondary: "#6b7280", // Medium Gray
  textTertiary: "#9ca3af", // Light Gray
  textInverse: "#ffffff", // White on dark

  // Background Colors
  bgLight: "#f9fafb", // Near white
  bgWhite: "#ffffff", // Pure white
  bgDark: "#1f2937", // Dark (premium)
  bgDarkest: "#0f172a", // Very dark

  // Social Proof Colors
  socialPositive: "#10b981", // Green
  socialNeutral: "#6b7280", // Gray
  socialAlert: "#ef4444", // Red (urgency)

  // Semantic Colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};

// Tailwind CSS Theme
export const tailwindTheme = {
  colors: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      500: "#2563eb",
      600: "#1d4ed8",
      700: "#1e40af",
      900: "#1e3a8a",
    },
    success: {
      50: "#f0fdf4",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
    },
    premium: {
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
    },
    danger: {
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
    },
  },
};

// Component-specific color palettes
export const componentColors = {
  // CTA Button (Maximum Conversion)
  ctaPrimary: {
    bg: "#10b981", // Success Green (converts best)
    bgHover: "#059669",
    text: "#ffffff",
    shadow: "0 10px 15px rgba(16, 185, 129, 0.3)",
  },

  // Danger/Urgent Button
  ctaDanger: {
    bg: "#ef4444", // Red (urgency)
    bgHover: "#dc2626",
    text: "#ffffff",
    shadow: "0 10px 15px rgba(239, 68, 68, 0.3)",
  },

  // Premium/Exclusive Badge
  premiumBadge: {
    bg: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    text: "#ffffff",
    border: "#8b5cf6",
  },

  // Social Proof
  socialProof: {
    bg: "#f0fdf4", // Light green
    border: "#10b981",
    text: "#10b981",
  },

  // Testimonial Card
  testimonial: {
    bg: "#ffffff",
    border: "#e5e7eb",
    rating: "#fbbf24", // Gold stars
  },

  // Success Message
  success: {
    bg: "#ecfdf5",
    border: "#10b981",
    text: "#10b981",
    icon: "✅",
  },

  // Warning/Urgency
  urgency: {
    bg: "#fef2f2",
    border: "#ef4444",
    text: "#ef4444",
    icon: "⚠️",
  },
};

// Typography hierarchy for conversion
export const typography = {
  hero: {
    size: "48px",
    weight: "700",
    color: "#1f2937",
    lineHeight: "1.2",
  },
  heading1: {
    size: "36px",
    weight: "700",
    color: "#1f2937",
  },
  heading2: {
    size: "24px",
    weight: "700",
    color: "#2563eb", // Primary blue for attention
  },
  subheading: {
    size: "18px",
    weight: "600",
    color: "#10b981", // Success green for emphasis
  },
  body: {
    size: "16px",
    weight: "400",
    color: "#1f2937",
    lineHeight: "1.6",
  },
  bodySmall: {
    size: "14px",
    weight: "400",
    color: "#6b7280",
  },
  cta: {
    size: "16px",
    weight: "600",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};

// Spacing for psychological comfort
export const spacing = {
  tight: "8px",
  compact: "12px",
  base: "16px",
  comfortable: "24px",
  spacious: "32px",
  huge: "48px",
};

// Border radius for modern feel
export const borderRadius = {
  sharp: "2px",
  subtle: "4px",
  normal: "8px",
  smooth: "12px",
  rounded: "16px",
  circle: "50%",
};

// Shadow system (depth creates premium feel)
export const shadows = {
  none: "none",
  subtle: "0 1px 2px rgba(0, 0, 0, 0.05)",
  light: "0 4px 6px rgba(0, 0, 0, 0.1)",
  medium: "0 10px 15px rgba(0, 0, 0, 0.1)",
  strong: "0 20px 25px rgba(0, 0, 0, 0.15)",
  premium: "0 25px 50px rgba(0, 0, 0, 0.25)",
};
