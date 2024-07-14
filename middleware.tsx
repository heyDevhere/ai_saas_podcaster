import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/'])
//(.*)=> to catch all the routes which start with sign-in

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
//   this aut h is provided by the clerk , so  when someone clicks on a protected route, then i say auth protect me !
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};