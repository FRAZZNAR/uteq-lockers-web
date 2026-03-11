import useAuthStore from '../stores/authStore'

// Hook conveniente para acceder al estado de autenticación
const useAuth = () => useAuthStore()

export default useAuth
