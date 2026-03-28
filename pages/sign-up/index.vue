<script setup>
const route = useRoute()
const returnParam = route.query.return ? String(route.query.return) : ''
const nameParam = route.query.name ? String(route.query.name) : ''
// After sign-up, go to /welcome with the return URL and name
const welcomeUrl = returnParam
  ? `/welcome?return=${encodeURIComponent(returnParam)}&name=${encodeURIComponent(nameParam)}`
  : '/welcome'
</script>

<template>
  <DefaultTemplate>
    <div class="sign-up-page">
      <SignUp :force-redirect-url="welcomeUrl" />
    </div>
  </DefaultTemplate>
</template>

<style scoped>
.sign-up-page {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}
</style>
