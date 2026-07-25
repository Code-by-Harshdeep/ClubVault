import React from "react";
import "./PageLoader.css";

/**
 * Thin animated bar pinned to the top of the viewport, shown during
 * route transitions so navigation never flashes to blank white/black.
 *
 * USAGE (React Router v6 data routers):
 *   <Suspense fallback={<PageLoader />}>
 *     <Outlet />
 *   </Suspense>
 *
 * USAGE (manual, e.g. non-data router):
 *   const navigation = useNavigation(); // or your own isNavigating state
 *   {navigation.state === "loading" && <PageLoader />}
 */
export default function PageLoader() {
  return (
    <div className="cv-page-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="cv-page-loader-bar" />
    </div>
  );
}
