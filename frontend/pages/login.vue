<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Entre na sua conta
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Ou
        <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">
          crie uma nova conta
        </NuxtLink>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
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

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Lembrar-me
              </label>
            </div>
          </div>

          <div>
            <Button type="submit" variant="primary" class="w-full" :loading="isLoading">
              <template #default>
                Entrar
              </template>
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
import { useAuthStore } from '~/stores/auth'
import { api } from '~/services/api'
import { socketService } from '~/services/socket'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errors = ref({
  email: '',
  password: ''
})
const isLoading = ref(false)

const handleLogin = async () => {
  try {
    errors.value = {
      email: '',
      password: ''
    }

    if (!email.value) {
      errors.value.email = 'Email é obrigatório'
    }
    if (!password.value) {
      errors.value.password = 'Senha é obrigatória'
    }

    if (errors.value.email || errors.value.password) {
      return
    }

    isLoading.value = true
    const { token } = await api.login(email.value, password.value)
    
    // Desconecta o socket se estiver conectado
    socketService.disconnect()
    
    // Atualiza o token e inicia a conexão do socket
    authStore.setToken(token)
    socketService.connect()
    
    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true')
    } else {
      localStorage.removeItem('rememberMe')
    }

    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
    errors.value.email = 'Credenciais inválidas'
  } finally {
    isLoading.value = false
  }
}
</script> 