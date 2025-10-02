import { useState, useEffect } from 'react';
import { X, Heart, Star, MessageCircle, ExternalLink, Send, Flag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectDetailModalProps {
  project: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProjectDetailModal({ project, onClose, onUpdate }: ProjectDetailModalProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);

  useEffect(() => {
    loadInteractions();
    loadRepository();
  }, [project.id]);

  const loadRepository = async () => {
    const { data } = await supabase
      .from('integracion_repositorio')
      .select('url_repositorio')
      .eq('proyecto_id', project.id)
      .maybeSingle();

    if (data) {
      setRepositoryUrl(data.url_repositorio);
    }
  };

  const loadInteractions = async () => {
    const { data: likesData } = await supabase
      .from('valoraciones')
      .select('*')
      .eq('proyecto_id', project.id)
      .eq('tipo', 'like');

    if (likesData) {
      setLikesCount(likesData.length);
      setLiked(likesData.some((like) => like.usuario_id === user?.id));
    }

    const { data: commentsData } = await supabase
      .from('comentarios')
      .select('*, profiles(nombres, apellidos)')
      .eq('proyecto_id', project.id)
      .eq('estado', 'activo')
      .order('fecha', { ascending: false });

    if (commentsData) {
      setComments(commentsData);
    }
  };

  const toggleLike = async () => {
    if (liked) {
      await supabase
        .from('valoraciones')
        .delete()
        .eq('proyecto_id', project.id)
        .eq('usuario_id', user?.id)
        .eq('tipo', 'like');

      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      await supabase.from('valoraciones').insert({
        proyecto_id: project.id,
        usuario_id: user?.id,
        tipo: 'like',
      });

      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);

    const { error } = await supabase.from('comentarios').insert({
      proyecto_id: project.id,
      usuario_id: user?.id,
      contenido: newComment,
    });

    if (!error) {
      setNewComment('');
      await loadInteractions();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">{project.titulo}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg mb-6 flex items-center justify-center">
            <Star className="w-24 h-24 text-white opacity-50" />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  liked
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>

              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length}</span>
              </div>
            </div>

            {repositoryUrl && (
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver Repositorio</span>
              </a>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{project.descripcion}</p>
          </div>

          <div className="mb-6 flex items-center justify-between text-sm text-gray-600">
            <span>
              Creado por {project.profiles?.nombres} {project.profiles?.apellidos}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              {project.categoria_proyecto?.nombre || 'Sin categoría'}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comentarios ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay comentarios aún. Sé el primero en comentar.
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {comment.profiles?.nombres} {comment.profiles?.apellidos}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.fecha).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Reportar comentario"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-700">{comment.contenido}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
