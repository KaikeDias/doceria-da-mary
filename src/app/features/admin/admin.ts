import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideCakeSlice,
  LucideExternalLink,
  LucideLogOut,
  LucideMenu,
  LucideSettings,
  LucideTags,
  LucideX,
} from '@lucide/angular';
import { Auth } from '../../core/auth/auth';

@Component({
  selector: 'app-admin',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LucideCakeSlice,
    LucideExternalLink,
    LucideLogOut,
    LucideMenu,
    LucideSettings,
    LucideTags,
    LucideX,
  ],
  templateUrl: './admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Admin {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly drawer = viewChild.required<ElementRef<HTMLDialogElement>>('drawer');

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }

  protected openDrawer(): void {
    this.drawer().nativeElement.showModal();
  }

  protected closeDrawer(): void {
    this.drawer().nativeElement.close();
  }

  // Fecha ao clicar no fundo escurecido (o próprio <dialog>) ou em qualquer link do menu.
  protected drawerClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target === this.drawer().nativeElement || target.closest('a[href]')) this.closeDrawer();
  }
}
