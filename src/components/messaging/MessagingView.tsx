import { useState, useEffect } from 'react';
import { MessageSquare, Send, Plus, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Chat {
  id: string;
  tipo: string;
  nombre: string | null;
  fecha_creacion: string;
}

interface Message {
  id: string;
  contenido: string;
  fecha_envio: string;
  usuario_id: string;
  profiles: {
    nombres: string;
    apellidos: string;
  };
}

export function MessagingView() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);

      const subscription = supabase
        .channel(`messages:${selectedChat.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensajes',
            filter: `chat_id=eq.${selectedChat.id}`,
          },
          () => {
            loadMessages(selectedChat.id);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedChat]);

  const loadChats = async () => {
    const { data } = await supabase
      .from('chat_participantes')
      .select('chat_id, chats(*)')
      .eq('usuario_id', user?.id);

    if (data) {
      const chatList = data.map((item: any) => item.chats).filter(Boolean);
      setChats(chatList);
    }
  };

  const loadMessages = async (chatId: string) => {
    const { data } = await supabase
      .from('mensajes')
      .select('*, profiles(nombres, apellidos)')
      .eq('chat_id', chatId)
      .order('fecha_envio', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setLoading(true);

    await supabase.from('mensajes').insert({
      chat_id: selectedChat.id,
      usuario_id: user?.id,
      contenido: newMessage,
    });

    setNewMessage('');
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-4 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Mensajes</h2>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nueva Conversación</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes conversaciones aún</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {chat.tipo === 'grupal' ? (
                            <Users className="w-5 h-5 text-gray-600" />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {chat.nombre || 'Chat Privado'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {chat.tipo === 'grupal' ? 'Chat grupal' : 'Conversación privada'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-8 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedChat.tipo === 'grupal' ? (
                        <Users className="w-5 h-5 text-gray-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedChat.nombre || 'Chat Privado'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedChat.tipo === 'grupal' ? 'Chat grupal' : 'Conversación privada'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.usuario_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                          {!isOwn && (
                            <p className="text-xs text-gray-600 mb-1 px-3">
                              {message.profiles?.nombres} {message.profiles?.apellidos}
                            </p>
                          )}
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{message.contenido}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-3">
                            {new Date(message.fecha_envio).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Selecciona una conversación para comenzar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
