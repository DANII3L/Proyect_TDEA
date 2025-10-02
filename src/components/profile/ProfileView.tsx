import { useState, useEffect } from 'react';
import { User, Mail, Code, Github, CreditCard as Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function ProfileView() {
  const { user, profile, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    habilidades: '',
    intereses_tecnologicos: '',
    enlaces_repositorios: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nombres: profile.nombres || '',
        apellidos: profile.apellidos || '',
        habilidades: profile.habilidades || '',
        intereses_tecnologicos: profile.intereses_tecnologicos || '',
        enlaces_repositorios: profile.enlaces_repositorios || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user?.id);

    setLoading(false);

    if (error) {
      setError('Error al actualizar el perfil');
    } else {
      setSuccess('Perfil actualizado correctamente');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>

        <div className="px-8 pb-8">
          <div className="flex items-start justify-between -mt-16 mb-6">
            <div className="flex items-end space-x-4">
              <div className="w-32 h-32 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.nombres} {profile.apellidos}
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile.correo}
                </p>
                {isAdmin && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Administrador
                  </span>
                )}
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar Perfil</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Code className="inline w-4 h-4 mr-1" />
                  Habilidades Técnicas
                </label>
                <textarea
                  value={formData.habilidades}
                  onChange={(e) => setFormData({ ...formData, habilidades: e.target.value })}
                  rows={3}
                  placeholder="Ej: React, Node.js, Python, Docker..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intereses Tecnológicos
                </label>
                <textarea
                  value={formData.intereses_tecnologicos}
                  onChange={(e) => setFormData({ ...formData, intereses_tecnologicos: e.target.value })}
                  rows={3}
                  placeholder="Ej: Machine Learning, Web Development, Cloud Computing..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Github className="inline w-4 h-4 mr-1" />
                  Enlaces a Repositorios
                </label>
                <textarea
                  value={formData.enlaces_repositorios}
                  onChange={(e) => setFormData({ ...formData, enlaces_repositorios: e.target.value })}
                  rows={2}
                  placeholder="Ej: https://github.com/usuario, https://gitlab.com/usuario..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {profile.habilidades && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Habilidades Técnicas
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{profile.habilidades}</p>
                </div>
              )}

              {profile.intereses_tecnologicos && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Intereses Tecnológicos
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{profile.intereses_tecnologicos}</p>
                </div>
              )}

              {profile.enlaces_repositorios && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    Enlaces a Repositorios
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap break-all">{profile.enlaces_repositorios}</p>
                </div>
              )}

              {!profile.habilidades && !profile.intereses_tecnologicos && !profile.enlaces_repositorios && (
                <div className="text-center py-8 text-gray-500">
                  <p>Completa tu perfil para que otros desarrolladores puedan conocerte mejor</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
