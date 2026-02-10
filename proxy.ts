import {
  clerkClient, // Tool to talk to Clerk's database (get user details)
  clerkMiddleware, // The main wrapper for Next.js middleware
  createRouteMatcher, // A helper to group URLs together
} from "@clerk/nextjs/server"
import { NextResponse } from "next/server" // Standard Next.js tool for redirects

// ----------- Defining the "Rooms" (Route Matchers) -----------
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)", // Matches /dashboard, /dashboard/settings, etc.
  "/saved(.*)",
  "/profile(.*)",
])

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"])

const isAgentRoute = createRouteMatcher(["/dashboard(.*)"]) // Specific for Agents

const isPublicRoute = createRouteMatcher([
  "/",
  "/properties(.*)",
  "/pricing(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/studio(.*)", // Usually for Sanity CMS
])

// ----------- The Guard Logic (The main function)

export default clerkMiddleware(async (auth, req) => {
  // userId: Is the user logged in?
  // has: A helper to check for specific "Plans" or "Roles"
  const { userId, has } = await auth()

  // --------- ACCESS RULES: PUBLIC ---------
  // RULE 1: If it's a public route, don't do anything. Just let them in.
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // --------- ACCESS RULES: PROTECTED ---------
  // RULE 2: If they are trying to go to a private room but aren't logged in...
  if ((isProtectedRoute(req) || isOnboardingRoute(req)) && !userId) {
    // 1. Create the destination URL.
    // We provide "/sign-in" as the path.
    // We provide req.url as the 'Base' so the computer knows our domain (localhost or nestwell.com).
    const signInUrl = new URL("/sign-in", req.url)

    // 2. Add the "Return Ticket" (Search Parameter).
    // 'redirect_url' is the name Clerk expects to see.
    // We set its VALUE to req.url (the exact page the user was just trying to see).
    // This ensures that after they log in, they don't just land on the home page,
    // but they go back to exactly where they were.
    signInUrl.searchParams.set("redirect_url", req.url)
    // Example: https://nestwell.com/dashboard/settings
    // becomes if not logged in -> https://nestwell.com/sign-in?redirect_url=https%3A%2F%2Fnestwell.com%2Fdashboard%2Fsettings
    // and after login, they get sent to the "redirect_url" which is https://nestwell.com/dashboard/settings

    // 3. Execute the redirect
    return NextResponse.redirect(signInUrl)
  }

  // --------- Handling Onboarding (Checking the "ID Tag") LOGIC: PRIVATE ---------
  // If logged in and on a protected route, check if they finished the "Welcome" setup
  if (userId && isProtectedRoute(req)) {
    const clerk = await clerkClient() // Connect to Clerk's DB
    const user = await clerk.users.getUser(userId) // Fetch user info

    // publicMetadata is like a "sticker" Clerk puts on a user's ID
    const onboardingComplete = user.publicMetadata?.onboardingComplete

    if (!onboardingComplete) {
      // Force them to finish onboarding before they see the dashboard
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }
  }

  // If they are ALREADY done with onboarding, don't let them go back to the onboarding page
  if (userId && isOnboardingRoute(req)) {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const onboardingComplete = user.publicMetadata?.onboardingComplete
    if (onboardingComplete) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // --------- Role-Based Access (The "Agent" VIP Room) SUBSCRIPTION CHECKS ---------
  if (isAgentRoute(req) && userId) {
    // has({ plan: "agent" }) checks if the user has a specific subscription label
    const hasAgentPlan = has({ plan: "agent" })

    if (!hasAgentPlan) {
      // If they aren't a paid agent, send them to the pricing page to upgrade
      return NextResponse.redirect(new URL("/pricing", req.url))
    }

    // Even if they paid, have they filled out their Agent Profile?
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const agentOnboardingComplete = user.publicMetadata?.agentOnboardingComplete

    if (
      !agentOnboardingComplete &&
      !req.nextUrl.pathname.startsWith("/dashboard/onboarding")
    ) {
      return NextResponse.redirect(new URL("/dashboard/onboarding", req.url))
    }
  }

  return NextResponse.next() // If they pass all tests, let them through!
})

export const config = {
  matcher: [
    // This Regex tells Next.js: "Run this middleware for EVERYTHING..."
    // "...EXCEPT images, CSS, JS, and internal Next.js files."
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // "AND always run for API routes."
    "/(api|trpc)(.*)",
  ],
}
