const protectedRoutes = createRouteMatcher(['/dashboard(.*)', '/billing(.*)', '/facturering(.*)'])
const adminRoutes = createRouteMatcher(['/admin(.*)'])

export default defineNuxtRouteMiddleware(async (to) => {
  const { isSignedIn } = useAuth()

  if (!isSignedIn.value && (protectedRoutes(to) || adminRoutes(to))) {
    return navigateTo('/sign-in')
  }

  if (isSignedIn.value && adminRoutes(to)) {
    try {
      const { data } = await useFetch('/api/users/me')
      if (data.value?.role !== 'admin') {
        return navigateTo('/dashboard')
      }
    } catch {
      return navigateTo('/dashboard')
    }
  }
})
