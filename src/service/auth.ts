import api from '../lib/api'

export interface AuthUser {
  name: string
  email: string
  role: 'CANDIDATE' | 'RECRUITER' | 'ORG_OWNER' | 'ADMIN'
}

const USER_STORAGE_KEY = 'user'

const saveUser = (user: AuthUser) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

const getTokenPair = (payload: any) => {
  const tokenSource = payload?.tokens ?? payload

  return {
    accessToken: tokenSource?.accessToken ?? tokenSource?.access_token ?? null,
    refreshToken: tokenSource?.refreshToken ?? tokenSource?.refresh_token ?? null,
  }
}

const getStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await api.post('/auth/login', { email, password })
    const { user } = data.data
    const { accessToken, refreshToken } = getTokenPair(data.data)

    if (!accessToken || !refreshToken) {
      throw new Error('Login response did not include tokens.')
    }

    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    saveUser(user)

    return user
  },
  async register(firstName: string, lastName: string, email: string, password: string, phone?: string): Promise<AuthUser> {
  const name = `${firstName} ${lastName}`;

  const  response  = await api.post('/auth/register', {
    name,
    email,
    password,
    ...(phone ? { phoneNumber: phone } : {}),
  });
  console.log("Response:",response)
  const { user } = response.data.data;
  const { accessToken, refreshToken } = getTokenPair(response.data.data)

  if (!accessToken || !refreshToken) {
    throw new Error('Registration response did not include tokens.');
  }

  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  saveUser(user);
  return user;
},
  async forgot(email:string) {
    await api.post('/auth/password-reset/request',{ email })
  },
  async resetpassword(token:string, newPassword:string) {
    await api.post('/auth/password-reset/confirm', { token, newPassword })
  },
  
  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.clear()
      window.location.href = '/login'
    }
  },
  async getProfile(){
    try{
      const response = await api.get('/auth/me');
      if(!response){
        this.logout();
      }
      const user = response.data;
      return user;
    }catch(err){
      throw err;
    }
  },

  getStoredUser() {
    return getStoredUser()
  },


  getRole() {
    // Decode role from JWT payload (no library needed)
    const token = localStorage.getItem('access_token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role  // 'CANDIDATE' | 'RECRUITER' | 'ORG_OWNER' | 'ADMIN'
  },


  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  }
   

  }
