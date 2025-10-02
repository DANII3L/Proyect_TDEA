export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          nombre: string
          descripcion: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          nombres: string
          apellidos: string
          correo: string
          rol_id: string | null
          estado: string
          foto_perfil: string | null
          habilidades: string | null
          intereses_tecnologicos: string | null
          enlaces_repositorios: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nombres: string
          apellidos: string
          correo: string
          rol_id?: string | null
          estado?: string
          foto_perfil?: string | null
          habilidades?: string | null
          intereses_tecnologicos?: string | null
          enlaces_repositorios?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombres?: string
          apellidos?: string
          correo?: string
          rol_id?: string | null
          estado?: string
          foto_perfil?: string | null
          habilidades?: string | null
          intereses_tecnologicos?: string | null
          enlaces_repositorios?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categoria_proyecto: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          created_at?: string
        }
      }
      proyectos: {
        Row: {
          id: string
          usuario_id: string
          titulo: string
          descripcion: string
          categoria_id: string | null
          fecha_creacion: string
          estado: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          titulo: string
          descripcion: string
          categoria_id?: string | null
          fecha_creacion?: string
          estado?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          titulo?: string
          descripcion?: string
          categoria_id?: string | null
          fecha_creacion?: string
          estado?: string
          created_at?: string
          updated_at?: string
        }
      }
      valoraciones: {
        Row: {
          id: string
          proyecto_id: string
          usuario_id: string
          tipo: string
          fecha: string
        }
        Insert: {
          id?: string
          proyecto_id: string
          usuario_id: string
          tipo: string
          fecha?: string
        }
        Update: {
          id?: string
          proyecto_id?: string
          usuario_id?: string
          tipo?: string
          fecha?: string
        }
      }
      comentarios: {
        Row: {
          id: string
          proyecto_id: string
          usuario_id: string
          contenido: string
          fecha: string
          estado: string
        }
        Insert: {
          id?: string
          proyecto_id: string
          usuario_id: string
          contenido: string
          fecha?: string
          estado?: string
        }
        Update: {
          id?: string
          proyecto_id?: string
          usuario_id?: string
          contenido?: string
          fecha?: string
          estado?: string
        }
      }
      chats: {
        Row: {
          id: string
          tipo: string
          nombre: string | null
          fecha_creacion: string
        }
        Insert: {
          id?: string
          tipo: string
          nombre?: string | null
          fecha_creacion?: string
        }
        Update: {
          id?: string
          tipo?: string
          nombre?: string | null
          fecha_creacion?: string
        }
      }
      mensajes: {
        Row: {
          id: string
          chat_id: string
          usuario_id: string
          contenido: string
          fecha_envio: string
        }
        Insert: {
          id?: string
          chat_id: string
          usuario_id: string
          contenido: string
          fecha_envio?: string
        }
        Update: {
          id?: string
          chat_id?: string
          usuario_id?: string
          contenido?: string
          fecha_envio?: string
        }
      }
      notificaciones: {
        Row: {
          id: string
          usuario_id: string
          tipo: string
          contenido: string
          fecha_envio: string
          leido: boolean
        }
        Insert: {
          id?: string
          usuario_id: string
          tipo: string
          contenido: string
          fecha_envio?: string
          leido?: boolean
        }
        Update: {
          id?: string
          usuario_id?: string
          tipo?: string
          contenido?: string
          fecha_envio?: string
          leido?: boolean
        }
      }
    }
  }
}
