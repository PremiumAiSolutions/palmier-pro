// Port of Sources/PalmierPro/UI/AppTheme.swift. Same values, expressed for CSS.
// All UI styling MUST use these constants — never hardcode numbers (see AGENTS.md).

export const AppTheme = {
  Background: {
    base: "rgb(10, 10, 10)",
    surface: "rgb(22, 22, 22)",
    raised: "rgb(30, 30, 30)",
    prominent: "rgb(44, 44, 44)",
    placeholder: "rgb(30, 30, 30)",
    previewCanvas: "#000000",
  },
  Border: {
    primary: "rgba(255, 255, 255, 0.16)",
    subtle: "rgba(255, 255, 255, 0.12)",
    divider: "rgba(255, 255, 255, 0.44)",
  },
  BorderWidth: {
    hairline: 0.5,
    thin: 1,
    medium: 1.5,
    thick: 2,
  },
  Accent: {
    timecode: "rgb(242, 153, 51)", // 0.95, 0.6, 0.2
    primary: "rgb(245, 239, 228)", // warm off-white 0.961, 0.937, 0.894
    spotlight: "rgb(255, 69, 69)",
  },
  Status: {
    error: "rgb(229, 79, 79)", // E54F4F
    success: "rgb(79, 184, 95)", // 4FB85F
  },
  Text: {
    primary: "rgba(255, 255, 255, 1.0)",
    secondary: "rgba(255, 255, 255, 0.80)",
    tertiary: "rgba(255, 255, 255, 0.62)",
    muted: "rgba(255, 255, 255, 0.34)",
  },
  Opacity: {
    opaque: 1,
    subtle: 0.04,
    hint: 0.06,
    faint: 0.08,
    soft: 0.1,
    muted: 0.15,
    moderate: 0.25,
    medium: 0.35,
    strong: 0.55,
    prominent: 0.8,
  },
  TrackColor: {
    video: "rgb(0, 145, 194)", // 0091C2
    audio: "rgb(88, 168, 34)", // 58A822
    image: "rgb(183, 45, 210)", // B72DD2
    text: "rgb(183, 45, 210)",
    lottie: "rgb(224, 168, 0)", // E0A800
  },
  Radius: {
    xs: 3,
    xsSm: 4,
    sm: 6,
    md: 10,
    mdLg: 12,
    lg: 14,
    xl: 20,
  },
  Spacing: {
    xxs: 2,
    xs: 4,
    sm: 6,
    smMd: 8,
    md: 10,
    mdLg: 12,
    lg: 14,
    lgXl: 16,
    xl: 20,
    xlXxl: 24,
    xxl: 28,
  },
  FontSize: {
    micro: 8,
    xxs: 9,
    xs: 10,
    sm: 11,
    smMd: 12,
    md: 13,
    mdLg: 14,
    lg: 15,
    xl: 18,
    title1: 22,
    title2: 28,
    display: 36,
  },
  FontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  IconSize: {
    xxs: 12,
    xs: 14,
    sm: 18,
    smMd: 20,
    md: 22,
    mdLg: 24,
    lg: 26,
    lgXl: 28,
    xl: 30,
  },
  Window: {
    projectDefaultWidth: 1600,
    projectDefaultHeight: 1000,
    projectMinWidth: 960,
    projectMinHeight: 600,
  },
  Anim: {
    hover: 0.15,
    transition: 0.2,
  },
} as const;

export const fontStack =
  '-apple-system, "Inter", "Segoe UI", system-ui, sans-serif';
export const monoFontStack = '"GeistMono", "Cascadia Code", ui-monospace, monospace';

export function px(n: number): string {
  return `${n}px`;
}
