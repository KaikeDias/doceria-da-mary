import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideCakeSlice,
  LucideExternalLink,
  LucideLogOut,
  LucideMenu,
  LucideSettings,
  LucideTags,
  LucideX,
} from '@lucide/angular';

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
  private readonly drawer = viewChild.required<ElementRef<HTMLDialogElement>>('drawer');

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
