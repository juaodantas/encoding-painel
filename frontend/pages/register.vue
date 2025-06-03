<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Crie sua conta
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Ou
        <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
          faça login se já tiver uma conta
        </NuxtLink>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleRegister">
          <Input
            id="name"
            v-model="name"
            type="text"
            label="Nome completo"
            placeholder="Seu nome"
            required
            :error="errors.name"
          />

          <Input
            id="email"
            v-model="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            required
            :error="errors.email"
          />

          <Input
            id="password"
            v-model="password"
            type="password"
            label="Senha"
            placeholder="********"
            required
            :error="errors.password"
          />

          <Input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            label="Confirmar senha"
            placeholder="********"
            required
            :error="errors.confirmPassword"
          />

          <div class="flex items-center">
            <input
              id="terms"
              v-model="acceptTerms"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              Eu concordo com os
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Termos de Serviço</a>
              e
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Política de Privacidade</a>
            </label>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-green-800">
                  {{ successMessage }}
                </p>
              </div>
            </div>
          </div>

          <!-- General Error Message -->
          <div v-if="errors.general" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">
                  {{ errors.general }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Button type="submit" variant="primary" class="w-full" :loading="isLoading">
              {{ isLoading ? 'Criando conta...' : 'Criar conta' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import { api } from '~/services/api'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)
const errors = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: '',
  general: ''
})
const isLoading = ref(false)
const successMessage = ref('')

const handleRegister = async () => {
  // Reset messages
  errors.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
    general: ''
  }
  successMessage.value = ''
  isLoading.value = true

  // Basic validation
  if (!name.value) {
    errors.value.name = 'Nome é obrigatório'
  }
  if (!email.value) {
    errors.value.email = 'Email é obrigatório'
  }
  if (!password.value) {
    errors.value.password = 'Senha é obrigatória'
  } else if (password.value.length < 6) {
    errors.value.password = 'A senha deve ter pelo menos 6 caracteres'
  }
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Confirmação de senha é obrigatória'
  }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'As senhas não coincidem'
  }
  if (!acceptTerms.value) {
    errors.value.terms = 'Você precisa aceitar os termos de serviço'
    isLoading.value = false
    return
  }

  if (Object.values(errors.value).some(error => error)) {
    isLoading.value = false
    return
  }

  try {
    const response = await api.register(email.value, password.value);
    successMessage.value = 'Conta criada com sucesso! Redirecionando...'
    
    // Wait a moment to show the success message before redirecting
    setTimeout(() => {
      router.push('/')
    }, 1500)

  } catch (error: any) {
    console.error('Registration failed:', error);
    if (error.response?.data?.message) {
      errors.value.general = error.response.data.message
    } else {
      errors.value.general = 'Ocorreu um erro ao criar sua conta. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}
</script> 