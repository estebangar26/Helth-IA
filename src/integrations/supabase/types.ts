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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      accesos_medicos: {
        Row: {
          aceptado_en: string | null
          actualizado_en: string
          creado_en: string
          doctor_email: string
          doctor_id: string | null
          estado: string
          id: string
          paciente_id: string
          revocado_en: string | null
        }
        Insert: {
          aceptado_en?: string | null
          actualizado_en?: string
          creado_en?: string
          doctor_email: string
          doctor_id?: string | null
          estado?: string
          id?: string
          paciente_id: string
          revocado_en?: string | null
        }
        Update: {
          aceptado_en?: string | null
          actualizado_en?: string
          creado_en?: string
          doctor_email?: string
          doctor_id?: string | null
          estado?: string
          id?: string
          paciente_id?: string
          revocado_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accesos_medicos_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accesos_medicos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_medicas: {
        Row: {
          creado_en: string
          detalle: string
          doctor_email: string
          estado_envio: string
          examen_id: string | null
          id: string
          motivo_envio: string | null
          nivel: string
          paciente_id: string
          titular: string
        }
        Insert: {
          creado_en?: string
          detalle: string
          doctor_email: string
          estado_envio?: string
          examen_id?: string | null
          id?: string
          motivo_envio?: string | null
          nivel?: string
          paciente_id: string
          titular: string
        }
        Update: {
          creado_en?: string
          detalle?: string
          doctor_email?: string
          estado_envio?: string
          examen_id?: string | null
          id?: string
          motivo_envio?: string | null
          nivel?: string
          paciente_id?: string
          titular?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_medicas_examen_id_fkey"
            columns: ["examen_id"]
            isOneToOne: false
            referencedRelation: "examenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_medicas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      especialistas: {
        Row: {
          ciudad: string
          contacto: string
          creado_en: string
          enfermedad_que_atiende: string
          especialidad: string
          id: string
          nombre: string
        }
        Insert: {
          ciudad: string
          contacto: string
          creado_en?: string
          enfermedad_que_atiende: string
          especialidad: string
          id?: string
          nombre: string
        }
        Update: {
          ciudad?: string
          contacto?: string
          creado_en?: string
          enfermedad_que_atiende?: string
          especialidad?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      examenes: {
        Row: {
          afp: number | null
          anticuerpos_gad: number | null
          ca125: number | null
          ca19_9: number | null
          cea: number | null
          created_at: string
          creatinina: number | null
          densidad_urinaria: number | null
          fecha: string
          glucemia_ayunas: number | null
          glucemia_posprandial: number | null
          hba1c: number | null
          id: string
          insulina: number | null
          laboratorio: string | null
          notas: string | null
          osmolaridad_plasmatica: number | null
          osmolaridad_urinaria: number | null
          peptido_c: number | null
          presion_diastolica: number | null
          presion_sistolica: number | null
          psa: number | null
          recomendaciones: string[] | null
          sodio: number | null
          testosterona_libre: number | null
          testosterona_total: number | null
          tipo_examen: string
          titulo: string
          updated_at: string
          user_id: string
          validado_en: string | null
        }
        Insert: {
          afp?: number | null
          anticuerpos_gad?: number | null
          ca125?: number | null
          ca19_9?: number | null
          cea?: number | null
          created_at?: string
          creatinina?: number | null
          densidad_urinaria?: number | null
          fecha: string
          glucemia_ayunas?: number | null
          glucemia_posprandial?: number | null
          hba1c?: number | null
          id?: string
          insulina?: number | null
          laboratorio?: string | null
          notas?: string | null
          osmolaridad_plasmatica?: number | null
          osmolaridad_urinaria?: number | null
          peptido_c?: number | null
          presion_diastolica?: number | null
          presion_sistolica?: number | null
          psa?: number | null
          recomendaciones?: string[] | null
          sodio?: number | null
          testosterona_libre?: number | null
          testosterona_total?: number | null
          tipo_examen?: string
          titulo: string
          updated_at?: string
          user_id: string
          validado_en?: string | null
        }
        Update: {
          afp?: number | null
          anticuerpos_gad?: number | null
          ca125?: number | null
          ca19_9?: number | null
          cea?: number | null
          created_at?: string
          creatinina?: number | null
          densidad_urinaria?: number | null
          fecha?: string
          glucemia_ayunas?: number | null
          glucemia_posprandial?: number | null
          hba1c?: number | null
          id?: string
          insulina?: number | null
          laboratorio?: string | null
          notas?: string | null
          osmolaridad_plasmatica?: number | null
          osmolaridad_urinaria?: number | null
          peptido_c?: number | null
          presion_diastolica?: number | null
          presion_sistolica?: number | null
          psa?: number | null
          recomendaciones?: string[] | null
          sodio?: number | null
          testosterona_libre?: number | null
          testosterona_total?: number | null
          tipo_examen?: string
          titulo?: string
          updated_at?: string
          user_id?: string
          validado_en?: string | null
        }
        Relationships: []
      }
      medicaciones: {
        Row: {
          creado_en: string
          dosis: string | null
          frecuencia: string | null
          id: string
          nombre: string
          notas: string | null
          user_id: string
        }
        Insert: {
          creado_en?: string
          dosis?: string | null
          frecuencia?: string | null
          id?: string
          nombre: string
          notas?: string | null
          user_id: string
        }
        Update: {
          creado_en?: string
          dosis?: string | null
          frecuencia?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          user_id?: string
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          created_at: string
          documento: string | null
          documento_validado_en: string | null
          edad: number | null
          eps_nombre: string | null
          id: string
          medico_familia: string | null
          medico_tratante: string | null
          nombre: string
          tipo_atencion: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          documento?: string | null
          documento_validado_en?: string | null
          edad?: number | null
          eps_nombre?: string | null
          id: string
          medico_familia?: string | null
          medico_tratante?: string | null
          nombre?: string
          tipo_atencion?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          documento?: string | null
          documento_validado_en?: string | null
          edad?: number | null
          eps_nombre?: string | null
          id?: string
          medico_familia?: string | null
          medico_tratante?: string | null
          nombre?: string
          tipo_atencion?: string
          updated_at?: string
        }
        Relationships: []
      }
      resultados_biomarcador: {
        Row: {
          categoria: string
          codigo: string
          created_at: string
          examen_id: string
          id: string
          nombre: string
          referencia_texto: string | null
          unidad: string | null
          valor: number
        }
        Insert: {
          categoria: string
          codigo: string
          created_at?: string
          examen_id: string
          id?: string
          nombre: string
          referencia_texto?: string | null
          unidad?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string
          examen_id?: string
          id?: string
          nombre?: string
          referencia_texto?: string | null
          unidad?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "resultados_biomarcador_examen_id_fkey"
            columns: ["examen_id"]
            isOneToOne: false
            referencedRelation: "examenes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "paciente" | "medico" | "admin"
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
  public: {
    Enums: {
      app_role: ["paciente", "medico", "admin"],
    },
  },
} as const
