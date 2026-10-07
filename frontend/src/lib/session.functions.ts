import { authService } from "../services/auth.service";
import { SessionUser, AppRole } from "../types/api";

export type { AppRole };

export type SessionInfo = SessionUser;

export async function getMySession(): Promise<SessionInfo | null> {
  return authService.getMe();
}

export async function loginUser({ data }: { data: { email: string; password: string } }) {
  const res = await authService.login(data);
  return {
    success: true,
    user: res.user,
    session: res.user,
    token: res.token,
  };
}

export async function ownerQuickLogin() {
  const res = await authService.ownerQuickLogin();
  return {
    success: true,
    user: res.user,
    session: res.user,
    token: res.token,
  };
}

export async function signupUser({ data }: {
  data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    title?: string;
    role?: AppRole;
  };
}) {
  const res = await authService.signup(data);
  return {
    success: true,
    user: res.user,
    session: res.user,
    token: res.token,
  };
}

export async function logoutUser() {
  return authService.logout();
}

export async function updateUserProfile({ data }: { data: { fullName?: string; title?: string; phone?: string } }) {
  const res = await authService.updateProfile(data);
  return {
    success: true,
    user: res.user,
    session: res.user,
    token: res.token,
  };
}


