<script setup>
const { data: user } = await useFetch('/api/users/me')
</script>

<template>
  <DefaultTemplate>
    <div class="dashboard">
      <AppHeading :level="1">Dashboard</AppHeading>
      <AppText>
        Welcome, {{ user?.firstName || 'User' }}! You are signed in as <strong>{{ user?.role }}</strong>.
      </AppText>
      <div class="dashboard-actions">
        <NuxtLink v-if="user?.role === 'admin'" to="/admin" class="btn">
          Admin Panel
        </NuxtLink>
        <UserButton />
      </div>
    </div>
  </DefaultTemplate>
</template>

<style scoped>
.dashboard {
  padding: 2rem 0;
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  background: #1a1a2e;
  color: white;
  font-size: 0.9375rem;
  cursor: pointer;
  text-decoration: none;
}
</style>
