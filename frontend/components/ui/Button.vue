<template>
  <button
    :class="[
      'font-bold py-2 px-4 rounded transition-colors duration-200',
      variant === 'primary' ? 'bg-blue-500 hover:bg-blue-700 text-white' :
      variant === 'secondary' ? 'bg-gray-500 hover:bg-gray-700 text-white' :
      variant === 'danger' ? 'bg-red-500 hover:bg-red-700 text-white' :
      'bg-gray-200 hover:bg-gray-300 text-gray-800'
    ]"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot name="default"></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger', 'default'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script> 