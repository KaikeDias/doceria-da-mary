// Painel com dados em memória (os mesmos do banco) para os testes unitários.
import { Auth } from '../../core/auth/auth';
import { publicUrl } from '../../core/supabase/supabase';
import {
  AdminCategory,
  AdminMenuRepository,
  MenuItem,
  ProductInput,
} from './admin-menu-repository';

export const adminCategories: readonly AdminCategory[] = [
  { id: 'c-bolos', name: 'Bolos', visible: true, productCount: 2 },
  { id: 'c-docinhos', name: 'Docinhos', visible: true, productCount: 1 },
  { id: 'c-sobremesas', name: 'Sobremesas', visible: true, productCount: 2 },
  { id: 'c-kits', name: 'Kits e presentes', visible: true, productCount: 1 },
  { id: 'c-datas', name: 'Datas especiais', visible: false, productCount: 0 },
];

const photo = (file: string) => [publicUrl('produtos', `seed/${file}.webp`)];

export const menuItems: readonly MenuItem[] = [
  {
    id: 'bolo-chocolate',
    name: 'Bolo de Chocolate',
    categoryId: 'c-bolos',
    description: 'Massa fofinha com recheio cremoso e cobertura generosa de chocolate.',
    price: { kind: 'starting-at', amountInCents: 8500 },
    images: photo('chocolate-cake'),
    published: true,
  },
  {
    id: 'brigadeiros',
    name: 'Brigadeiros Gourmet',
    categoryId: 'c-docinhos',
    description: 'Pequenos clássicos, feitos à mão e finalizados com muito carinho.',
    price: { kind: 'starting-at', amountInCents: 3600 },
    images: photo('brigadeiros'),
    published: true,
  },
  {
    id: 'brownie',
    name: 'Brownie Recheado',
    categoryId: 'c-sobremesas',
    description: 'Casquinha delicada, interior úmido e uma surpresa a cada mordida.',
    price: { kind: 'fixed', amountInCents: 1800 },
    images: photo('brownie'),
    published: true,
  },
  {
    id: 'bolo-morango',
    name: 'Bolo de Morango',
    categoryId: 'c-bolos',
    description: 'Camadas leves, creme suave e morangos frescos para celebrar.',
    price: { kind: 'starting-at', amountInCents: 9200 },
    images: photo('strawberry-cake'),
    published: true,
  },
  {
    id: 'copo-felicidade',
    name: 'Copo da Felicidade',
    categoryId: 'c-sobremesas',
    description: 'Cremes, pedacinhos de bolo e muito sabor em cada colherada.',
    price: { kind: 'fixed', amountInCents: 2200 },
    images: photo('dessert-cup'),
    published: true,
  },
  {
    id: 'caixa-docinhos',
    name: 'Caixa de Docinhos',
    categoryId: 'c-kits',
    description: 'Uma seleção delicada para presentear ou compartilhar bons momentos.',
    price: { kind: 'starting-at', amountInCents: 4800 },
    images: photo('sweet-box'),
    published: false,
  },
];

// Grava em memória, como o banco faria; os testes espiam ou trocam os métodos.
export class FakeAdminMenuRepository implements AdminMenuRepository {
  items = [...menuItems];
  categories = [...adminCategories];

  async listProducts(): Promise<MenuItem[]> {
    return [...this.items];
  }
  async listCategories(): Promise<AdminCategory[]> {
    return [...this.categories];
  }
  async setPublished(id: string, published: boolean): Promise<void> {
    this.items = this.items.map((item) => (item.id === id ? { ...item, published } : item));
  }
  async setCategoryVisible(id: string, visible: boolean): Promise<void> {
    this.categories = this.categories.map((item) => (item.id === id ? { ...item, visible } : item));
  }
  async deleteProduct(item: MenuItem): Promise<void> {
    this.items = this.items.filter((other) => other.id !== item.id);
  }
  async saveProduct(input: ProductInput, existing?: MenuItem) {
    const id = existing?.id ?? `novo-${this.items.length}`;
    const saved: MenuItem = {
      id,
      name: input.name,
      categoryId: input.categoryId,
      description: input.description,
      price: input.price,
      images: input.images.map((image) => (typeof image === 'string' ? image : image.name)),
      published: existing?.published ?? true,
    };
    this.items = existing
      ? this.items.map((item) => (item.id === id ? saved : item))
      : [...this.items, saved];
    return { id, failedUploads: 0 };
  }
}

export function provideAdmin(repository = new FakeAdminMenuRepository(), admin = true) {
  return [
    { provide: AdminMenuRepository, useValue: repository },
    { provide: Auth, useValue: { isAdmin: async () => admin, signOut: async () => {} } },
  ];
}
