import { useState, useEffect } from 'react';
import { Users, Flag, FolderGit2, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'projects'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);

    if (activeTab === 'users') {
      const { data } = await supabase
        .from('profiles')
        .select('*, roles(nombre)')
        .order('created_at', { ascending: false });

      if (data) setUsers(data);
    } else if (activeTab === 'reports') {
      const { data } = await supabase
        .from('reporte_comentario')
        .select(`
          *,
          comentarios(contenido, proyectos(titulo)),
          profiles(nombres, apellidos)
        `)
        .order('fecha', { ascending: false });

      if (data) setReports(data);
    } else if (activeTab === 'projects') {
      const { data } = await supabase
        .from('proyectos')
        .select('*, profiles(nombres, apellidos), categoria_proyecto(nombre)')
        .order('created_at', { ascending: false });

      if (data) setProjects(data);
    }

    setLoading(false);
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    await supabase
      .from('profiles')
      .update({ estado: newStatus })
      .eq('id', userId);

    loadData();
  };

  const resolveReport = async (reportId: string) => {
    await supabase
      .from('reporte_comentario')
      .update({ estado: 'resuelto' })
      .eq('id', reportId);

    loadData();
  };

  const deleteComment = async (commentId: string) => {
    await supabase
      .from('comentarios')
      .update({ estado: 'eliminado' })
      .eq('id', commentId);

    loadData();
  };

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'reports', label: 'Reportes', icon: Flag },
    { id: 'projects', label: 'Proyectos', icon: FolderGit2 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Shield className="w-8 h-8 text-red-600" />
          <span>Panel de Administración</span>
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando datos...</p>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Gestión de Usuarios ({users.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Nombre
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Correo
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Rol
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.nombres} {user.apellidos}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {user.correo}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {(user as any).roles?.nombre || 'Sin rol'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.estado === 'activo'
                                    ? 'bg-green-100 text-green-800'
                                    : user.estado === 'suspendido'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {user.estado}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                {user.estado !== 'activo' && (
                                  <button
                                    onClick={() => updateUserStatus(user.id, 'activo')}
                                    className="text-green-600 hover:text-green-800"
                                    title="Activar"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                )}
                                {user.estado !== 'suspendido' && (
                                  <button
                                    onClick={() => updateUserStatus(user.id, 'suspendido')}
                                    className="text-red-600 hover:text-red-800"
                                    title="Suspender"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Reportes de Comentarios ({reports.length})
                  </h2>
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Flag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No hay reportes pendientes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                Reportado por: {report.profiles?.nombres}{' '}
                                {report.profiles?.apellidos}
                              </p>
                              <p className="text-sm text-gray-600">
                                Proyecto: {(report as any).comentarios?.proyectos?.titulo}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                report.estado === 'pendiente'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : report.estado === 'resuelto'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {report.estado}
                            </span>
                          </div>

                          <div className="bg-gray-50 rounded p-3 mb-3">
                            <p className="text-sm text-gray-700">
                              <strong>Comentario:</strong>{' '}
                              {(report as any).comentarios?.contenido}
                            </p>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-700">
                              <strong>Motivo:</strong> {report.motivo}
                            </p>
                          </div>

                          {report.estado === 'pendiente' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  deleteComment((report as any).comentarios?.id)
                                }
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                Eliminar Comentario
                              </button>
                              <button
                                onClick={() => resolveReport(report.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Marcar como Resuelto
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Todos los Proyectos ({projects.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {project.titulo}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.estado === 'publicado'
                                ? 'bg-green-100 text-green-800'
                                : project.estado === 'borrador'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {project.estado}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {project.descripcion}
                        </p>

                        <div className="text-xs text-gray-500">
                          <p>
                            Por: {project.profiles?.nombres}{' '}
                            {project.profiles?.apellidos}
                          </p>
                          <p>Categoría: {project.categoria_proyecto?.nombre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
