const getDisplayName = (Component, fallback) => {
  if (!Component) {
    return fallback;
  }
  const { displayName, name } = Component;
  return displayName || name || fallback || Component;
};

export default getDisplayName;
