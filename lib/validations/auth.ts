// Validações para formulários de autenticação
export interface ValidationError {
  field: string
  message: string
}

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "O e-mail é obrigatório"
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Digite um e-mail válido"
  }

  return null
}

export const validateUfbaEmail = (email: string): string | null => {
  const baseEmailError = validateEmail(email)
  if (baseEmailError) {
    return baseEmailError
  }

  if (!email.toLowerCase().endsWith("@ufba.br")) {
    return "Apenas e-mails institucionais @ufba.br são aceitos"
  }

  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "A senha é obrigatória"
  }

  if (password.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres"
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra maiúscula"
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra minúscula"
  }

  if (!/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos um número"
  }

  return null
}

export const validateName = (name: string): string | null => {
  if (!name) {
    return "O nome é obrigatório"
  }

  if (name.length < 3) {
    return "O nome deve ter no mínimo 3 caracteres"
  }

  if (name.length > 100) {
    return "O nome deve ter no máximo 100 caracteres"
  }

  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return "A confirmação de senha é obrigatória"
  }

  if (password !== confirmPassword) {
    return "As senhas não coincidem"
  }

  return null
}

export const validateLoginForm = (email: string, password: string): ValidationError[] => {
  const errors: ValidationError[] = []

  const emailError = validateEmail(email)
  if (emailError) {
    errors.push({ field: "email", message: emailError })
  }

  if (!password) {
    errors.push({ field: "password", message: "A senha é obrigatória" })
  }

  return errors
}

export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): ValidationError[] => {
  const errors: ValidationError[] = []

  const nameError = validateName(name)
  if (nameError) {
    errors.push({ field: "name", message: nameError })
  }

  const emailError = validateUfbaEmail(email)
  if (emailError) {
    errors.push({ field: "email", message: emailError })
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    errors.push({ field: "password", message: passwordError })
  }

  const confirmPasswordError = validateConfirmPassword(password, confirmPassword)
  if (confirmPasswordError) {
    errors.push({ field: "confirmPassword", message: confirmPasswordError })
  }

  return errors
}

export const validateForgotPasswordForm = (email: string): ValidationError[] => {
  const errors: ValidationError[] = []

  const emailError = validateEmail(email)
  if (emailError) {
    errors.push({ field: "email", message: emailError })
  }

  return errors
}
