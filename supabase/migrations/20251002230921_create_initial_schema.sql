/*
  # Sistema de Gestión de Proyectos para Desarrolladores - Schema Inicial

  ## Descripción General
  Este migration crea la estructura completa de la base de datos para una plataforma
  de gestión de proyectos colaborativa para desarrolladores.

  ## 1. Tablas Nuevas

  ### Gestión de Usuarios
  - `roles`: Define los roles del sistema (Desarrollador, Administrador)
  - `profiles`: Perfiles extendidos de usuarios con toda su información
  
  ### Gestión de Proyectos
  - `categoria_proyecto`: Categorías de proyectos
  - `proyectos`: Proyectos publicados por los usuarios
  - `archivo_multimedia`: Archivos multimedia asociados a proyectos
  - `integracion_repositorio`: Integración con GitHub/GitLab

  ### Valoración y Colaboración
  - `valoraciones`: Sistema de likes y valoraciones
  - `comentarios`: Comentarios en proyectos
  - `reporte_comentario`: Reportes de contenido ofensivo
  - `colaboraciones`: Colaboradores en proyectos
  - `recomendaciones`: Sistema de recomendaciones entre usuarios

  ### Interacción y Comunicación
  - `chats`: Conversaciones privadas y grupales
  - `chat_participantes`: Participantes en chats
  - `mensajes`: Mensajes en chats

  ### Otros
  - `ideas`: Ideas propuestas por usuarios
  - `notificaciones`: Sistema de notificaciones
  - `log_auditoria`: Registro de actividades para trazabilidad

  ## 2. Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas por defecto
  - Acceso basado en roles y propiedad
  - Los administradores tienen acceso completo a moderación

  ## 3. Índices
  - Índices optimizados para consultas frecuentes
  - Foreign keys indexadas
*/

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- GESTIÓN DE USUARIOS
-- ============================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  descripcion text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insertar roles predefinidos
INSERT INTO roles (nombre, descripcion) VALUES
  ('desarrollador', 'Desarrollador de software con acceso a gestión de proyectos'),
  ('administrador', 'Administrador de plataforma con permisos completos')
ON CONFLICT (nombre) DO NOTHING;

-- Tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  correo text UNIQUE NOT NULL,
  rol_id uuid REFERENCES roles(id),
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  foto_perfil text,
  habilidades text,
  intereses_tecnologicos text,
  enlaces_repositorios text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- GESTIÓN DE PROYECTOS
-- ============================================

-- Categorías de proyectos
CREATE TABLE IF NOT EXISTS categoria_proyecto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- Insertar categorías iniciales
INSERT INTO categoria_proyecto (nombre, descripcion) VALUES
  ('Web Development', 'Aplicaciones y sitios web'),
  ('Mobile Development', 'Aplicaciones móviles iOS/Android'),
  ('Machine Learning', 'Inteligencia artificial y ML'),
  ('DevOps', 'Infraestructura y automatización'),
  ('Data Science', 'Análisis de datos y visualización'),
  ('Game Development', 'Desarrollo de videojuegos'),
  ('IoT', 'Internet de las cosas'),
  ('Blockchain', 'Tecnologías blockchain y criptomonedas'),
  ('Desktop Apps', 'Aplicaciones de escritorio'),
  ('Other', 'Otros proyectos')
ON CONFLICT (nombre) DO NOTHING;

-- Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  categoria_id uuid REFERENCES categoria_proyecto(id),
  fecha_creacion timestamptz DEFAULT now(),
  estado text DEFAULT 'publicado' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Archivos multimedia
CREATE TABLE IF NOT EXISTS archivo_multimedia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('imagen', 'video', 'documento')),
  url text NOT NULL,
  es_representativo boolean DEFAULT false,
  tamano double precision,
  created_at timestamptz DEFAULT now()
);

-- Integración con repositorios
CREATE TABLE IF NOT EXISTS integracion_repositorio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('github', 'gitlab', 'bitbucket', 'other')),
  token_autenticacion text,
  url_repositorio text NOT NULL,
  ultima_sincronizacion timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- VALORACIÓN Y COLABORACIÓN
-- ============================================

-- Valoraciones
CREATE TABLE IF NOT EXISTS valoraciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('like', 'estrella', 'voto')),
  fecha timestamptz DEFAULT now(),
  UNIQUE(proyecto_id, usuario_id, tipo)
);

-- Comentarios
CREATE TABLE IF NOT EXISTS comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contenido text NOT NULL,
  fecha timestamptz DEFAULT now(),
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'reportado', 'eliminado'))
);

-- Reportes de comentarios
CREATE TABLE IF NOT EXISTS reporte_comentario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comentario_id uuid REFERENCES comentarios(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  motivo text NOT NULL,
  fecha timestamptz DEFAULT now(),
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'revisado', 'resuelto'))
);

-- Colaboraciones
CREATE TABLE IF NOT EXISTS colaboraciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rol_colaborador text NOT NULL,
  fecha_union timestamptz DEFAULT now(),
  UNIQUE(proyecto_id, usuario_id)
);

-- Recomendaciones
CREATE TABLE IF NOT EXISTS recomendaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE NOT NULL,
  usuario_origen_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  usuario_destino_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  fecha timestamptz DEFAULT now(),
  UNIQUE(proyecto_id, usuario_origen_id, usuario_destino_id)
);

-- ============================================
-- INTERACCIÓN Y COMUNICACIÓN
-- ============================================

-- Chats
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('privado', 'grupal')),
  nombre text,
  fecha_creacion timestamptz DEFAULT now()
);

-- Participantes de chats
CREATE TABLE IF NOT EXISTS chat_participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  fecha_union timestamptz DEFAULT now(),
  UNIQUE(chat_id, usuario_id)
);

-- Mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contenido text NOT NULL,
  fecha_envio timestamptz DEFAULT now()
);

-- ============================================
-- IDEAS Y NOTIFICACIONES
-- ============================================

-- Ideas
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  fecha_creacion timestamptz DEFAULT now()
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL,
  contenido text NOT NULL,
  fecha_envio timestamptz DEFAULT now(),
  leido boolean DEFAULT false
);

-- Log de auditoría
CREATE TABLE IF NOT EXISTS log_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  accion text NOT NULL,
  fecha timestamptz DEFAULT now(),
  detalles jsonb
);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_rol ON profiles(rol_id);
CREATE INDEX IF NOT EXISTS idx_profiles_correo ON profiles(correo);
CREATE INDEX IF NOT EXISTS idx_proyectos_usuario ON proyectos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_categoria ON proyectos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_archivo_multimedia_proyecto ON archivo_multimedia(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_valoraciones_proyecto ON valoraciones(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_proyecto ON comentarios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_chat ON mensajes(chat_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leido ON notificaciones(leido);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivo_multimedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracion_repositorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE valoraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporte_comentario ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_auditoria ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.rol_id = r.id
    WHERE p.id = user_id AND r.nombre = 'administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proyectos_updated_at ON proyectos;
CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para asignar rol por defecto
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rol_id IS NULL THEN
    NEW.rol_id := (SELECT id FROM roles WHERE nombre = 'desarrollador' LIMIT 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_default_role ON profiles;
CREATE TRIGGER set_default_role BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION assign_default_role();

-- ============================================
-- POLÍTICAS RLS - ROLES
-- ============================================

CREATE POLICY "Roles visible para todos los usuarios autenticados"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- POLÍTICAS RLS - PROFILES
-- ============================================

CREATE POLICY "Los usuarios pueden ver todos los perfiles públicos"
  ON profiles FOR SELECT
  TO authenticated
  USING (estado = 'activo');

CREATE POLICY "Los usuarios pueden crear su propio perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los administradores pueden gestionar todos los perfiles"
  ON profiles FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- POLÍTICAS RLS - CATEGORÍAS
-- ============================================

CREATE POLICY "Todos pueden ver categorías"
  ON categoria_proyecto FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden gestionar categorías"
  ON categoria_proyecto FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- POLÍTICAS RLS - PROYECTOS
-- ============================================

CREATE POLICY "Todos pueden ver proyectos publicados"
  ON proyectos FOR SELECT
  TO authenticated
  USING (estado = 'publicado' OR usuario_id = auth.uid());

CREATE POLICY "Los usuarios pueden crear proyectos"
  ON proyectos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios proyectos"
  ON proyectos FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios proyectos"
  ON proyectos FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los administradores pueden gestionar todos los proyectos"
  ON proyectos FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- POLÍTICAS RLS - ARCHIVOS MULTIMEDIA
-- ============================================

CREATE POLICY "Todos pueden ver archivos de proyectos publicados"
  ON archivo_multimedia FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = proyecto_id AND (p.estado = 'publicado' OR p.usuario_id = auth.uid())
    )
  );

CREATE POLICY "Los propietarios pueden gestionar archivos de sus proyectos"
  ON archivo_multimedia FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = proyecto_id AND p.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = proyecto_id AND p.usuario_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS - INTEGRACIONES
-- ============================================

CREATE POLICY "Los propietarios pueden ver integraciones de sus proyectos"
  ON integracion_repositorio FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = proyecto_id AND p.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los propietarios pueden gestionar integraciones"
  ON integracion_repositorio FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = proyecto_id AND p.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = proyecto_id AND p.usuario_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS - VALORACIONES
-- ============================================

CREATE POLICY "Todos pueden ver valoraciones"
  ON valoraciones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los usuarios pueden crear valoraciones"
  ON valoraciones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus valoraciones"
  ON valoraciones FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

-- ============================================
-- POLÍTICAS RLS - COMENTARIOS
-- ============================================

CREATE POLICY "Todos pueden ver comentarios activos"
  ON comentarios FOR SELECT
  TO authenticated
  USING (estado = 'activo' OR usuario_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Los usuarios pueden crear comentarios"
  ON comentarios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus comentarios"
  ON comentarios FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus comentarios"
  ON comentarios FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los administradores pueden moderar comentarios"
  ON comentarios FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- POLÍTICAS RLS - REPORTES
-- ============================================

CREATE POLICY "Los usuarios pueden ver sus reportes"
  ON reporte_comentario FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Los usuarios pueden crear reportes"
  ON reporte_comentario FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los administradores pueden gestionar reportes"
  ON reporte_comentario FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- POLÍTICAS RLS - COLABORACIONES
-- ============================================

CREATE POLICY "Todos pueden ver colaboraciones"
  ON colaboraciones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los propietarios pueden gestionar colaboradores"
  ON colaboraciones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = proyecto_id AND p.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = proyecto_id AND p.usuario_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS - RECOMENDACIONES
-- ============================================

CREATE POLICY "Los usuarios pueden ver recomendaciones dirigidas a ellos"
  ON recomendaciones FOR SELECT
  TO authenticated
  USING (usuario_destino_id = auth.uid() OR usuario_origen_id = auth.uid());

CREATE POLICY "Los usuarios pueden crear recomendaciones"
  ON recomendaciones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_origen_id);

-- ============================================
-- POLÍTICAS RLS - CHATS
-- ============================================

CREATE POLICY "Los participantes pueden ver sus chats"
  ON chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participantes cp
      WHERE cp.chat_id = id AND cp.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden crear chats"
  ON chats FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- POLÍTICAS RLS - PARTICIPANTES DE CHAT
-- ============================================

CREATE POLICY "Los participantes pueden ver otros participantes"
  ON chat_participantes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participantes cp
      WHERE cp.chat_id = chat_id AND cp.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden unirse a chats"
  ON chat_participantes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- ============================================
-- POLÍTICAS RLS - MENSAJES
-- ============================================

CREATE POLICY "Los participantes pueden ver mensajes de sus chats"
  ON mensajes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participantes cp
      WHERE cp.chat_id = chat_id AND cp.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los participantes pueden enviar mensajes"
  ON mensajes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = usuario_id AND
    EXISTS (
      SELECT 1 FROM chat_participantes cp
      WHERE cp.chat_id = chat_id AND cp.usuario_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS - IDEAS
-- ============================================

CREATE POLICY "Todos pueden ver ideas"
  ON ideas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los usuarios pueden crear ideas"
  ON ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus ideas"
  ON ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- ============================================
-- POLÍTICAS RLS - NOTIFICACIONES
-- ============================================

CREATE POLICY "Los usuarios pueden ver sus notificaciones"
  ON notificaciones FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "El sistema puede crear notificaciones"
  ON notificaciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Los usuarios pueden actualizar sus notificaciones"
  ON notificaciones FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- ============================================
-- POLÍTICAS RLS - LOG AUDITORÍA
-- ============================================

CREATE POLICY "Los administradores pueden ver logs"
  ON log_auditoria FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "El sistema puede crear logs"
  ON log_auditoria FOR INSERT
  TO authenticated
  WITH CHECK (true);