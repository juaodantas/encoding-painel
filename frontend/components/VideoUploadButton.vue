<template>
  <div
    class="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
    :class="{ 
      'border-blue-500 bg-blue-50': isDragging,
      'border-green-500 bg-green-50': selectedFile
    }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept="video/*"
      @change="handleFileSelect"
    />
    
    <div v-if="!selectedFile" class="text-center">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div class="mt-4 flex text-sm text-gray-600">
        <label
          for="file-upload"
          class="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
        >
          <span>Clique para fazer upload</span>
          <input
            id="file-upload"
            type="file"
            class="sr-only"
            accept="video/*"
            @change="handleFileSelect"
          />
        </label>
        <p class="pl-1">ou arraste e solte</p>
      </div>
      <p class="text-xs text-gray-500">MP4, WebM ou MOV até 100MB</p>
    </div>

    <div v-else class="text-center">
      <svg
        class="mx-auto h-12 w-12 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div class="mt-4">
        <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
        <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
      </div>
      <div class="mt-4 flex flex-col space-y-2">
        <button
          @click="removeFile"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Remover arquivo
        </button>
        <button
          @click="handleSubmit"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Enviar vídeo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['file-selected', 'file-removed', 'submit'])
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)

const resetState = () => {
  selectedFile.value = null
  isSubmitting.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

defineExpose({
  resetState
})

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    if (validateFile(file)) {
      selectedFile.value = file
      emit('file-selected', file)
    }
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (validateFile(file)) {
      selectedFile.value = file
      emit('file-selected', file)
    }
  }
}

const removeFile = () => {
  selectedFile.value = null
  emit('file-removed')
}

const handleSubmit = () => {
  if (selectedFile.value) {
    isSubmitting.value = true
    emit('submit', selectedFile.value)
  }
}

const validateFile = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  const maxSize = 100 * 1024 * 1024 // 100MB

  if (!validTypes.includes(file.type)) {
    alert('Por favor, selecione um arquivo de vídeo válido (MP4, WebM ou MOV)')
    return false
  }

  if (file.size > maxSize) {
    alert('O arquivo deve ter no máximo 100MB')
    return false
  }

  return true
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script> 