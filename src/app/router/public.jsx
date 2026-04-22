const publicRoutes = {
  id: "public",
  children: [
    {
      // Public route – accessible without authentication
      path: "whatsmirror",
      lazy: async () => ({
        Component: (await import("app/pages/WhatsMirror")).default,
      }),
    },
  ],
};
 
export { publicRoutes };
