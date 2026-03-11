<script setup>
const { data: user } = await useFetch('/api/users/me')
</script>

<template>
  <DefaultTemplate>
    <div class="admin">
      <AppHeading :level="1">Admin Panel</AppHeading>
      <AppText>Welcome, {{ user?.firstName }}. You have admin access.</AppText>
      <div class="admin-actions">
        <NuxtLink to="/dashboard" class="btn">Back to Dashboard</NuxtLink>
        <UserButton />
      </div>
    </div>
  </DefaultTemplate>
</template>

<style scoped>
.admin {
  padding: 2rem 0;
}

.admin-actions {
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
