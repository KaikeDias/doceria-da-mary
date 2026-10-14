export interface PublicConfig {
  readonly contact: {
    readonly whatsapp: string | null;
    readonly instagram: string | null;
    readonly email: string | null;
    readonly address: string | null;
    readonly locationUrl: string | null;
    readonly businessHours: string | null;
  };
  readonly apiUrl: string | null;
}

export const publicConfig: PublicConfig = {
  contact: {
    whatsapp: null,
    instagram: null,
    email: null,
    address: null,
    locationUrl: null,
    businessHours: null,
  },
  apiUrl: null,
};
