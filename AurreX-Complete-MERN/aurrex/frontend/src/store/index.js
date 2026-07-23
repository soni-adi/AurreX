import { create } from 'zustand'
import { persist } from 'zustand/middleware'
export const useAuthStore = create(persist((set)=>({user:null,setUser:(user)=>set({user}),clearUser:()=>set({user:null})}),{name:'aurrex-auth'}))
export const useThemeStore = create(persist((set,get)=>({dark:false,toggle:()=>{const n=!get().dark;set({dark:n});document.documentElement.classList.toggle('dark',n)},init:()=>{if(get().dark)document.documentElement.classList.add('dark')}}),{name:'aurrex-theme'}))
export const useModeStore = create(persist((set)=>({appMode:'leader',setMode:(m)=>set({appMode:m})}),{name:'aurrex-mode'}))