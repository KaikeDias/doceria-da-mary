import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';
import { Supabase } from '../supabase/supabase';

export class InvalidCredentials extends Error {}
export class Offline extends Error {}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly supabase = inject(Supabase);
  // Usuário já confirmado em administradores nesta sessão do app.
  private adminId: string | null = null;

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    // status 0 = sem resposta (rede); 5xx também é "retryable", mas é indisponibilidade.
    if (isAuthRetryableFetchError(error) && error.status === 0) throw new Offline();
    if (isAuthApiError(error) && error.status === 400) throw new InvalidCredentials();
    if (error) throw error;
    const admin = await this.isAdmin().catch(async (failure) => {
      await this.signOut();
      throw failure;
    });
    if (!admin) {
      await this.signOut();
      throw new InvalidCredentials();
    }
  }

  async isAdmin(): Promise<boolean> {
    const db = this.supabase.client;
    const { data } = await db.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return false;
    if (userId === this.adminId) return true;
    const { data: row, error } = await db
      .from('administradores')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    this.adminId = row ? userId : null;
    return !!row;
  }

  async signOut(): Promise<void> {
    this.adminId = null;
    const auth = this.supabase.client.auth;
    // Sem rede o signOut global falha e mantém a sessão; o local só descarta o token salvo.
    const { error } = await auth.signOut();
    if (error) await auth.signOut({ scope: 'local' });
  }
}

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(Auth)
    .isAdmin()
    .catch(() => false)
    .then((admin) => admin || router.createUrlTree(['/login']));
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(Auth)
    .isAdmin()
    .catch(() => false)
    .then((admin) => !admin || router.createUrlTree(['/admin/cardapio']));
};
