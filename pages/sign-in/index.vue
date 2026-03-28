<script setup>
const route = useRoute()
const returnUrl = route.query.return ? String(route.query.return) : '/dashboard'
</script>

<template>
  <DefaultTemplate>
    <div class="sign-in-page">
      <SignIn :force-redirect-url="returnUrl" />
    </div>
  </DefaultTemplate>
</template>

<style scoped>
.sign-in-page {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}
</style>
