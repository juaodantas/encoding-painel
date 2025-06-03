<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block text-gray-700 text-sm font-bold mb-2">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      :placeholder="placeholder"
      :required="required"
      :class="{ 'border-red-500': error }"
    />
    <p v-if="error" class="text-red-500 text-xs italic mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  label?: string;
  type?: string;
  modelValue: string | number;
  placeholder?: string;
  required?: boolean;
  error?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script> 