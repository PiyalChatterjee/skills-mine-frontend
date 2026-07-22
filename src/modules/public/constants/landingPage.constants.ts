export const heroContent = {
  findJob: {
    badge: "AI-Powered Matching",
    titleStrong: "Your perfect role,",
    titleLight: "matched to you.",
    copy: [
      "Upload your CV once.",
      "Get matched with bespoke opportunities.",
      "Our AI optimises your profile and connects you with roles where you'll thrive.",
    ],
    primaryCta: "Sign up and Browse Jobs",
  },
  startHiring: {
    badge: "AI-Powered Matching",
    titleStrong: "Find the perfect candidate.",
    copy: [
      "Create a mandate.",
      "Send your mandate to suitable candidates or with a larger audience.",
      "Obtain valuable insights on your posted mandates.",
    ],
    primaryCta: "Find Candidates on The Skills Mine",
    secondaryCta: "Post a Job",
  },
} as const;

export type HeroMode = keyof typeof heroContent;
