// src/services/authService.js
import api from '../lib/api'

export const authService = {
  async login(email :string, password:string) {
    const { data } = await api.post('/auth/login', { email, password })
    const { access_token, refresh_token, user } = data.data

    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('user', user);
    console.log("role",user.role)
    if (user.role === "CANDIDATE"){
      navigation.navigate('/home');
    }else{
      navigation.navigate('/dashboard')
    }
    return user  // { id, role: 'CANDIDATE' | 'RECRUITER' | 'ORG_OWNER' | 'ADMIN' }
  },
  async register(email: string, password: string, firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`;

  const  response  = await api.post('/auth/register', {
    name,
    email,
    password,
  });
  console.log("Response:",response)
  const { user, tokens } = response.data.data;

  localStorage.setItem('access_token', tokens.accessToken);
  localStorage.setItem('refresh_token', tokens.refreshToken);
  localStorage.setItem('user', user);
  return user;
},
  async forgot(email:string) {
    try {
      await api.post('/auth/password-reset/request',{ email })
    } finally {
      localStorage.clear()
      window.location.href = '/login'
    }
  },
  async resetpassword(token:string, newPassword:string) {
    try {
      await api.post('/auth/password-reset/confirm', { token, newPassword })
    } finally {
      localStorage.clear()
      window.location.href = '/login'
    }
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