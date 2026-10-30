import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  InjectionToken,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCircleAlert,
  LucideEye,
  LucideEyeOff,
  LucideHeart,
  LucideLoaderCircle,
  LucideLock,
  LucideMail,
  LucideShieldCheck,
} from '@lucide/angular';
import { Auth, InvalidCredentials, Offline } from '../../core/auth/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const LOGIN_REQUEST = new InjectionToken<(credentials: LoginCredentials) => Promise<void>>(
  'LOGIN_REQUEST',
  {
    factory: () => {
      const auth = inject(Auth);
      return ({ email, password }) => auth.signIn(email, password);
    },
  },
);

const EMAIL_FORMAT = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function emailError(email: string): string | null {
  if (!email) return 'Informe seu e-mail para continuar.';
  return EMAIL_FORMAT.test(email) ? null : 'Digite um e-mail válido, como nome@email.com.';
}

export function passwordError(password: string): string | null {
  return password ? null : 'Informe sua senha para continuar.';
}

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    LucideArrowLeft,
    LucideCircleAlert,
    LucideEye,
    LucideEyeOff,
    LucideHeart,
    LucideLoaderCircle,
    LucideLock,
    LucideMail,
    LucideShieldCheck,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly request = inject(LOGIN_REQUEST);
  private readonly router = inject(Router);
  private destroyed = false;
  private readonly emailInput = viewChild.required<ElementRef<HTMLInputElement>>('emailInput');
  private readonly passwordInput =
    viewChild.required<ElementRef<HTMLInputElement>>('passwordInput');

  protected readonly year = new Date().getFullYear();
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly pending = signal(false);
  protected readonly failure = signal<string | null>(null);
  protected readonly photoFailed = signal(false);
  private readonly emailTouched = signal(false);
  private readonly passwordTouched = signal(false);
  private readonly submitted = signal(false);

  protected readonly emailMessage = computed(() =>
    this.emailTouched() || this.submitted() ? emailError(this.email().trim()) : null,
  );
  protected readonly passwordMessage = computed(() =>
    this.passwordTouched() || this.submitted() ? passwordError(this.password()) : null,
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
  }

  protected setEmail(value: string): void {
    this.email.set(value);
  }

  protected setPassword(value: string): void {
    this.password.set(value);
  }

  protected touchEmail(): void {
    this.emailTouched.set(true);
  }

  protected touchPassword(): void {
    this.passwordTouched.set(true);
  }

  protected toggleVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.pending()) return;
    this.submitted.set(true);
    const email = this.email().trim();
    const password = this.password();
    if (emailError(email)) return this.emailInput().nativeElement.focus();
    if (passwordError(password)) return this.passwordInput().nativeElement.focus();

    this.failure.set(null);
    this.pending.set(true);
    try {
      await this.request({ email, password });
    } catch (error) {
      // Falha inesperada usa a mensagem de indisponibilidade, sem detalhes técnicos.
      if (this.destroyed) return;
      this.failure.set(
        error instanceof InvalidCredentials
          ? 'E-mail ou senha incorretos.'
          : error instanceof Offline
            ? 'Sem conexão com a internet. Verifique e tente de novo.'
            : 'Login indisponível no momento. Tente novamente mais tarde.',
      );
      this.resetAfterFailure();
      return;
    }
    // Fora do try: erro ao abrir o painel não deve parecer falha de login.
    if (!this.destroyed) await this.router.navigateByUrl('/admin/cardapio');
  }

  private resetAfterFailure(): void {
    this.pending.set(false);
    this.password.set('');
    this.showPassword.set(false);
    this.passwordTouched.set(false);
    this.submitted.set(false);
  }
}
