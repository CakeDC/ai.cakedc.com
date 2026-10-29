<template>
  <Layout>
    <template #nav-bar-content-before>
      <SidebarToggle />
    </template>
    <template #nav-bar-content-after>
      <DynamicGitHubLink />
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme-without-fonts'
import DynamicGitHubLink from './components/DynamicGitHubLink.vue'
import SidebarToggle from './components/SidebarToggle.vue'

const { Layout } = DefaultTheme
</script>
