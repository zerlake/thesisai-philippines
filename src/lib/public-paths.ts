export const publicPaths = [
  "/",
  "/login",
  "/register",
  "/explore",
  "/features",
  "/for-advisors",
  "/for-critics",
  "/pricing",
  "/faq",
  "/university-guides",
  "/user-guide",
  "/atr-style-guide",
];

export const isPublicPage = (pathname: string): boolean => {
  // Exact match for root, prefix for others, and special case for /share/*
  return publicPaths.some(p => pathname === p || (p !== '/' && pathname.startsWith(p))) || pathname.startsWith("/share/");
};
