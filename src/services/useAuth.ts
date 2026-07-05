import { useMutation } from '@tanstack/react-query';
import { api, setAuthToken, clearAuthToken } from './apiClient';
import type { LoginDto, RequestCodeDto, ResetPasswordDto } from '@/api';

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const res = await api.AuthController_login(data);
      return res.data;
    },
    onSuccess: (data: any) => {
      if (data?.access_token) {
        setAuthToken(data.access_token);
      }
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.AuthController_logout();
      return res.data;
    },
    onSuccess: () => {
      clearAuthToken();
    },
  });
}

export function useRequestCode() {
  return useMutation({
    mutationFn: async (data: RequestCodeDto) => {
      const res = await api.AuthController_requestCode(data);
      return res.data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordDto) => {
      const res = await api.AuthController_resetPassword(data);
      return res.data;
    },
  });
}
