// routes/index.tsx
/**
 * OPTION 1: Use centralized AppRoutes (Recommended)
 */
import appRoutes from "./AppRoutes";
export const routeConfig = appRoutes;

/**
 * OPTION 2: Use separate route files (Old approach - can be removed)
 */
// import AuthRouters from "./AuthRouter";
// import CommonRouter from "./CommonRouter";
// import AuthenticatedRouter from "./AuthenticatedRouter";
// import RecruiterRouter from "./RecruiterRouter";
// import MainRouter from "./MainRouter";
// import ManagementRouter from "./ManagementRouter";
// export const routeConfig = [
//   ...AuthRouters,
//   ...CommonRouter,
//   ...AuthenticatedRouter,
//   ...RecruiterRouter,
//   ...MainRouter,
//   ...ManagementRouter,
// ];
