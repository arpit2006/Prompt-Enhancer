/**
 * Root loading UI — shown by Next.js App Router whenever a page
 * is loading (refresh, navigation, Suspense boundary).
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="loader" />
    </div>
  );
}
