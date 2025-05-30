const ctaConfig: Record<QuickGamePhase, Omit<IKPButton, "onClick">> = {
  select: {
    title: "Next",
    icon: "arrow",
    iconPosition: "right",
    disabled: false,
    loading: false,
  },
  searching: {
    title: "Cancel",
    variant: "tertiary",
    disabled: false,
    loading: false,
  },
  found: {
    title: "Next",
    icon: "arrow",
    iconPosition: "right",
    disabled: false,
    loading: false,
  },
};

export { ctaConfig };
