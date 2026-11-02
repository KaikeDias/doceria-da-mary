export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      administradores: {
        Row: {
          created_at: string
          nome: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          nome?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          nome?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          created_at: string
          id: string
          imagem_url: string | null
          nome: string
          ordem: number
          rotulo: string
          slug: string
          updated_at: string
          visivel: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          nome: string
          ordem?: number
          rotulo: string
          slug: string
          updated_at?: string
          visivel?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          nome?: string
          ordem?: number
          rotulo?: string
          slug?: string
          updated_at?: string
          visivel?: boolean
        }
        Relationships: []
      }
      configuracoes_site: {
        Row: {
          cta_encomendas_titulo: string | null
          descricao: string | null
          email_contato: string | null
          endereco: string | null
          hero_imagem_path: string | null
          hero_subtitulo: string | null
          hero_titulo: string
          horario_atendimento: string | null
          id: number
          instagram: string | null
          logo_path: string | null
          mensagem_whatsapp: string | null
          nome_doceria: string
          regiao_atendida: string | null
          sobre_texto: string | null
          texto_apresentacao: string | null
          texto_encomendas: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          cta_encomendas_titulo?: string | null
          descricao?: string | null
          email_contato?: string | null
          endereco?: string | null
          hero_imagem_path?: string | null
          hero_subtitulo?: string | null
          hero_titulo?: string
          horario_atendimento?: string | null
          id?: number
          instagram?: string | null
          logo_path?: string | null
          mensagem_whatsapp?: string | null
          nome_doceria?: string
          regiao_atendida?: string | null
          sobre_texto?: string | null
          texto_apresentacao?: string | null
          texto_encomendas?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          cta_encomendas_titulo?: string | null
          descricao?: string | null
          email_contato?: string | null
          endereco?: string | null
          hero_imagem_path?: string | null
          hero_subtitulo?: string | null
          hero_titulo?: string
          horario_atendimento?: string | null
          id?: number
          instagram?: string | null
          logo_path?: string | null
          mensagem_whatsapp?: string | null
          nome_doceria?: string
          regiao_atendida?: string | null
          sobre_texto?: string | null
          texto_apresentacao?: string | null
          texto_encomendas?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      produto_imagens: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          posicao: number
          produto_id: string
          storage_path: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          posicao?: number
          produto_id: string
          storage_path: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          posicao?: number
          produto_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_imagens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "cardapio_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_imagens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria_id: string | null
          created_at: string
          descricao: string | null
          detalhes: string | null
          id: string
          informacoes: Json
          nome: string
          observacao_preco: string | null
          ordem: number
          preco: number | null
          preco_a_partir: boolean
          publicado: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          detalhes?: string | null
          id?: string
          informacoes?: Json
          nome: string
          observacao_preco?: string | null
          ordem?: number
          preco?: number | null
          preco_a_partir?: boolean
          publicado?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          detalhes?: string | null
          id?: string
          informacoes?: Json
          nome?: string
          observacao_preco?: string | null
          ordem?: number
          preco?: number | null
          preco_a_partir?: boolean
          publicado?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "cardapio_publico"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_com_contagem"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cardapio_publico: {
        Row: {
          categoria_id: string | null
          categoria_nome: string | null
          categoria_rotulo: string | null
          categoria_slug: string | null
          descricao: string | null
          detalhes: string | null
          id: string | null
          imagem_principal: string | null
          informacoes: Json | null
          nome: string | null
          observacao_preco: string | null
          ordem: number | null
          preco: number | null
          preco_a_partir: boolean | null
          slug: string | null
        }
        Relationships: []
      }
      categorias_com_contagem: {
        Row: {
          created_at: string | null
          id: string | null
          imagem_url: string | null
          nome: string | null
          ordem: number | null
          rotulo: string | null
          slug: string | null
          total_produtos: number | null
          updated_at: string | null
          visivel: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      salvar_produto: {
        Args: { p_id: string; p_campos: Json; p_novo: boolean; p_slug: string; p_imagens: string[] | null }
        Returns: string
      }
      informacoes_validas: { Args: { dados: Json }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
