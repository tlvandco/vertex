import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  MessageSquare,
  Hash,
  User,
  Users,
  Search,
  Reply,
  Trash2,
  Plus,
  Lock,
  Check,
  Building2,
  Palette,
  HardHat,
  ShieldCheck
} from 'lucide-react';
import { ChatChannel, User as UserType } from '../types';

export const ChatDrawer: React.FC = () => {
  const {
    chatOpen,
    setChatOpen,
    channels,
    activeChannelId,
    setActiveChannelId,
    messages,
    sendMessage,
    deleteMessage,
    createChatChannel,
    currentUser,
    users,
    projects
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; snippet: string } | null>(null);
  const [searchChannel, setSearchChannel] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Chat Modal Form State
  const [channelType, setChannelType] = useState<'PROJECT' | 'DIRECT' | 'GENERAL'>('PROJECT');
  const [channelCategory, setChannelCategory] = useState<
    'PROJECT_ROOM' | 'DIRECT_MESSAGE' | 'DESIGN_CRITIQUE' | 'CLIENT_SUPPORT' | 'SITE_COORDINATION' | 'GENERAL'
  >('PROJECT_ROOM');
  const [channelName, setChannelName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [initialMessageText, setInitialMessageText] = useState('');

  useEffect(() => {
    if (!chatOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCreateModalOpen) {
        setChatOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatOpen, isCreateModalOpen, setChatOpen]);

  if (!chatOpen) return null;

  const isClient = currentUser.role === 'CLIENT';
  const assignedProjects = isClient
    ? projects.filter(p => p.clientId === currentUser.id || (currentUser.assignedProjectIds && currentUser.assignedProjectIds.includes(p.id)))
    : projects;

  // Helper: Get user-friendly name for a channel
  const getChannelDisplayName = (c: ChatChannel, user: UserType): string => {
    const isDirect = c.type === 'DIRECT' || c.category === 'DIRECT_MESSAGE' || c.category === 'CLIENT_SUPPORT';
    if (isDirect) {
      const otherMembers = c.members?.filter(m => m.toLowerCase() !== user.name.toLowerCase() && m !== user.id);
      if (otherMembers && otherMembers.length > 0) {
        return otherMembers.join(', ');
      }
      return c.name || 'Direct Conversation';
    }
    return c.name;
  };

  // Helper: Find counterpart user object for direct channels
  const getDirectChatCounterpart = (c: ChatChannel, user: UserType): UserType | undefined => {
    const isDirect = c.type === 'DIRECT' || c.category === 'DIRECT_MESSAGE' || c.category === 'CLIENT_SUPPORT';
    if (!isDirect) return undefined;
    const otherMemberName = c.members?.find(m => m.toLowerCase() !== user.name.toLowerCase() && m !== user.id);
    if (!otherMemberName) return undefined;
    return users.find(u => u.name.toLowerCase() === otherMemberName.toLowerCase() || u.id === otherMemberName);
  };

  // Helper: Strictly evaluate visibility
  const isUserAuthorizedForChannel = (c: ChatChannel, user: UserType): boolean => {
    const userNameLower = user.name.toLowerCase();
    const userId = user.id;

    const isMember = Boolean(
      c.members &&
      c.members.some(m => m.toLowerCase() === userNameLower || m === userId)
    );
    const isCreator = Boolean(
      c.createdBy &&
      (c.createdBy.toLowerCase() === userNameLower || c.createdBy === userId)
    );

    const isDirect = c.type === 'DIRECT' || c.category === 'DIRECT_MESSAGE' || c.category === 'CLIENT_SUPPORT';

    // 1-to-1 Private Direct Messages: STRICTLY participants only
    if (isDirect) {
      return isMember || isCreator;
    }

    // Group / Project / General rooms with member list: STRICTLY members only
    if (c.members && c.members.length > 0) {
      return isMember || isCreator;
    }

    // Project rooms with unspecified members: Assigned project team/client only
    if (c.projectId) {
      return assignedProjects.some(p => p.id === c.projectId);
    }

    // General channels without explicit members
    return !isClient;
  };

  // Filter channels based on strict membership and search query
  const visibleChannels = channels.filter(c => {
    if (!isUserAuthorizedForChannel(c, currentUser)) {
      return false;
    }

    // Search matching
    const displayName = getChannelDisplayName(c, currentUser);
    const query = searchChannel.toLowerCase().trim();
    if (!query) return true;

    return (
      c.name.toLowerCase().includes(query) ||
      displayName.toLowerCase().includes(query) ||
      (c.subtext && c.subtext.toLowerCase().includes(query)) ||
      (c.members && c.members.some(m => m.toLowerCase().includes(query)))
    );
  });

  // Group into Direct Messages and Group Channels
  const directChannels = visibleChannels.filter(
    c => c.type === 'DIRECT' || c.category === 'DIRECT_MESSAGE' || c.category === 'CLIENT_SUPPORT'
  );
  const groupChannels = visibleChannels.filter(
    c => c.type !== 'DIRECT' && c.category !== 'DIRECT_MESSAGE' && c.category !== 'CLIENT_SUPPORT'
  );

  const currentChannel =
    visibleChannels.find(c => c.id === activeChannelId) ||
    visibleChannels[0] ||
    null;

  const activeMessages = currentChannel ? (messages[currentChannel.id] || []) : [];
  const counterpartUser = currentChannel ? getDirectChatCounterpart(currentChannel, currentUser) : undefined;
  const currentDisplayName = currentChannel ? getChannelDisplayName(currentChannel, currentUser) : '';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentChannel) return;

    sendMessage(
      currentChannel.id,
      inputMessage,
      replyingTo?.id,
      replyingTo?.snippet
    );

    setInputMessage('');
    setReplyingTo(null);
  };

  const handleOpenCreateModal = () => {
    if (isClient) {
      setChannelType('DIRECT');
      setChannelCategory('CLIENT_SUPPORT');
      setChannelName('');
      const defaultProj = assignedProjects[0]?.id || '';
      setSelectedProjectId(defaultProj);
      // Preselect PM or Admin
      const teamLead = users.find(u => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN');
      setSelectedMembers(teamLead ? [teamLead.name] : []);
    } else {
      setChannelType('PROJECT');
      setChannelCategory('PROJECT_ROOM');
      setChannelName('');
      setSelectedProjectId(projects[0]?.id || '');
      setSelectedMembers([]);
    }
    setInitialMessageText('');
    setIsCreateModalOpen(true);
  };

  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalName = channelName.trim();
    if (!finalName) {
      if (channelType === 'DIRECT' && selectedMembers.length > 0) {
        finalName = selectedMembers.join(', ');
      } else if (selectedProjectId) {
        const proj = projects.find(p => p.id === selectedProjectId);
        finalName = proj ? `${proj.name} - ${channelCategory.replace('_', ' ')}` : 'New Discussion Room';
      } else {
        finalName = 'New Collaboration Room';
      }
    }

    createChatChannel({
      name: finalName,
      type: channelType,
      projectId: selectedProjectId || undefined,
      category: channelCategory,
      members: selectedMembers,
      subtext: channelCategory === 'DIRECT_MESSAGE' ? 'Direct 1-on-1 Message' : `${channelCategory.replace('_', ' ')} Room`,
      initialMessage: initialMessageText.trim() || undefined
    });

    setIsCreateModalOpen(false);
  };

  const toggleMemberSelection = (memberName: string) => {
    if (channelType === 'DIRECT') {
      // Direct message is strictly 1-to-1 with one selected user
      setSelectedMembers([memberName]);
    } else {
      setSelectedMembers(prev =>
        prev.includes(memberName) ? prev.filter(m => m !== memberName) : [...prev, memberName]
      );
    }
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) {
          setChatOpen(false);
        }
      }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col sm:flex-row animate-in slide-in-from-right duration-300">
        {/* Left Channels Sidebar */}
        <div className="w-full sm:w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-1/3 sm:h-full">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-gray-900 text-sm">VERTEX Direct</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.5 rounded font-mono font-bold flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  Private
                </span>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1 text-[11px] font-bold bg-[#D4AF37] hover:bg-[#B8860B] text-black px-2.5 py-1 rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Create New Chat Channel"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchChannel}
                onChange={e => setSearchChannel(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 border border-gray-200 rounded-lg outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {visibleChannels.length === 0 ? (
              <div className="text-center py-8 px-3 text-xs text-gray-400">
                <Lock className="w-6 h-6 mx-auto text-gray-300 mb-2" />
                <p className="font-medium text-gray-600">No conversations accessible</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  You only see private 1-to-1 chats and group channels you are a member of.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-3 inline-flex items-center gap-1 text-[#8B7355] hover:text-[#2C2416] font-bold text-xs bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Start New Conversation</span>
                </button>
              </div>
            ) : (
              <>
                {/* 1-on-1 Direct Messages Section */}
                {directChannels.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-0.5">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        Direct Messages
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 font-semibold">{directChannels.length}</span>
                    </div>

                    {directChannels.map(ch => {
                      const isSelected = ch.id === currentChannel?.id;
                      const title = getChannelDisplayName(ch, currentUser);
                      const counterpart = getDirectChatCounterpart(ch, currentUser);

                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChannelId(ch.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
                              : 'hover:bg-gray-200/60 text-gray-700'
                          }`}
                        >
                          <div className="relative mt-0.5 shrink-0">
                            {counterpart?.avatar ? (
                              <img
                                src={counterpart.avatar}
                                alt={title}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-300"
                              />
                            ) : (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isSelected ? 'bg-[#D4AF37] text-black' : 'bg-gray-200 text-gray-700'
                              }`}>
                                @
                              </div>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold truncate">{title}</p>
                              <span className={`text-[10px] ${isSelected ? 'text-amber-200/80' : 'text-gray-400'}`}>
                                {ch.lastMessageTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                                isSelected ? 'bg-white/10 text-amber-200' : 'bg-gray-100 text-gray-500'
                              }`}>
                                1-on-1
                              </span>
                              <p className={`text-[11px] truncate flex-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                {ch.lastMessagePreview || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Group & Project Rooms Section */}
                {groupChannels.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between px-2 py-0.5">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                        <Users className="w-2.5 h-2.5 text-gray-500" />
                        {isClient ? 'My Project Discussions' : 'Group & Project Rooms'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 font-semibold">{groupChannels.length}</span>
                    </div>

                    {groupChannels.map(ch => {
                      const isSelected = ch.id === currentChannel?.id;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChannelId(ch.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
                              : 'hover:bg-gray-200/60 text-gray-700'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {ch.type === 'PROJECT' ? (
                              <Hash className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                            ) : (
                              <Users className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold truncate">{ch.name}</p>
                              <span className={`text-[10px] ${isSelected ? 'text-amber-200/80' : 'text-gray-400'}`}>
                                {ch.lastMessageTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                                isSelected ? 'bg-white/10 text-amber-200' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {ch.members?.length || 0} members
                              </span>
                              <p className={`text-[11px] truncate flex-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                {ch.lastMessagePreview || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Active Message Stream */}
        <div className="flex-1 flex flex-col h-2/3 sm:h-full bg-white">
          {/* Channel Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
            {currentChannel ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2C2416] text-[#D4AF37] flex items-center justify-center font-bold text-xs shrink-0">
                  {currentChannel.type === 'DIRECT' || currentChannel.category === 'DIRECT_MESSAGE' || currentChannel.category === 'CLIENT_SUPPORT' ? (
                    counterpartUser?.avatar ? (
                      <img
                        src={counterpartUser.avatar}
                        alt={currentDisplayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      '@'
                    )
                  ) : (
                    '#'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif font-bold text-gray-900 text-sm">{currentDisplayName}</h4>
                    {currentChannel.category && (
                      <span className="text-[9px] bg-amber-50 text-[#8B7355] border border-amber-200/80 px-1.5 py-0.5 rounded font-bold uppercase">
                        {currentChannel.category.replace('_', ' ')}
                      </span>
                    )}
                    <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                      {currentChannel.type === 'DIRECT' || currentChannel.category === 'DIRECT_MESSAGE' || currentChannel.category === 'CLIENT_SUPPORT'
                        ? '1-on-1 Private'
                        : `${currentChannel.members?.length || 0} Authorized Members`}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate max-w-sm mt-0.5">
                    Participants: {currentChannel.members?.join(', ') || 'Authorized team'}
                  </p>
                </div>
              </div>
            ) : (
              <h4 className="font-serif font-bold text-gray-900 text-sm">Select or Create a Chat</h4>
            )}

            <button
              onClick={() => setChatOpen(false)}
              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {!currentChannel ? (
              <div className="text-center py-20 text-xs text-gray-400">
                <Lock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-gray-700 text-sm">No Active Channel Selected</p>
                <p className="mt-1">Select a private conversation or create a new room to collaborate.</p>
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="text-center py-16 text-xs text-gray-400 italic">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p>This room is quiet. Start the architectural collaboration!</p>
                <p className="text-[10px] text-gray-400 not-italic mt-1">
                  🔒 Only members of this channel can see these messages.
                </p>
              </div>
            ) : (
              activeMessages.map(msg => {
                const isMine = msg.senderId === currentUser.id || msg.senderName.toLowerCase() === currentUser.name.toLowerCase();
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {!isMine && (
                        <img
                          src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={msg.senderName}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      )}
                      <span className="text-[11px] font-bold text-gray-700">{msg.senderName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500 font-mono">
                        {msg.senderRole}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{msg.timestamp}</span>
                    </div>

                    {msg.replySnippet && (
                      <div className="mb-1 p-1.5 bg-gray-100 rounded-lg text-[10px] text-gray-500 border-l-2 border-[#D4AF37] max-w-xs truncate">
                        Replying: {msg.replySnippet}
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {/* Message Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed max-w-xs sm:max-w-md shadow-xs ${
                          isMine
                            ? 'bg-[#2C2416] text-[#D4AF37] rounded-tr-xs'
                            : 'bg-white text-gray-800 border border-gray-200/80 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Quick Action buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <button
                          onClick={() => setReplyingTo({ id: msg.id, snippet: msg.text.substring(0, 40) })}
                          className="p-1 text-gray-400 hover:text-black rounded cursor-pointer"
                          title="Reply to message"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                        {isMine && (
                          <button
                            onClick={() => deleteMessage(currentChannel.id, msg.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Context Banner */}
          {replyingTo && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs text-[#8B7355]">
              <span className="truncate">Replying to: <strong>"{replyingTo.snippet}..."</strong></span>
              <button onClick={() => setReplyingTo(null)} className="font-bold text-gray-400 hover:text-black cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#D4AF37] focus-within:bg-white transition-all">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={currentChannel ? `Message ${currentDisplayName}...` : 'Type a message...'}
                disabled={!currentChannel}
                className="flex-1 px-3 py-1.5 text-xs bg-transparent outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !currentChannel}
                className="p-2 bg-[#D4AF37] hover:bg-[#B8860B] disabled:opacity-40 text-black font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Role-Aware Create New Chat Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">Create New Conversation</h3>
                <p className="text-xs text-gray-500">
                  Role-scoped channel creation for <strong className="text-[#8B7355]">{currentUser.role}</strong> ({currentUser.name})
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-black p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4 text-xs">
              {/* Category Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5">
                  Conversation Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChannelType('DIRECT');
                      setChannelCategory('DIRECT_MESSAGE');
                      if (selectedMembers.length > 1) {
                        setSelectedMembers([selectedMembers[0]]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      channelCategory === 'DIRECT_MESSAGE'
                        ? 'border-[#D4AF37] bg-amber-50/50 text-[#2C2416]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#8B7355] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">1-on-1 Direct Message</p>
                      <p className="text-[10px] text-gray-500">Private between you & 1 member</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChannelType('DIRECT');
                      setChannelCategory('CLIENT_SUPPORT');
                      if (selectedMembers.length > 1) {
                        setSelectedMembers([selectedMembers[0]]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      channelCategory === 'CLIENT_SUPPORT'
                        ? 'border-[#D4AF37] bg-amber-50/50 text-[#2C2416]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#8B7355] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{isClient ? 'Architect Inquiry' : 'Client Advisory'}</p>
                      <p className="text-[10px] text-gray-500">Dedicated client consulting</p>
                    </div>
                  </button>

                  {!isClient && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setChannelType('PROJECT');
                          setChannelCategory('PROJECT_ROOM');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                          channelCategory === 'PROJECT_ROOM'
                            ? 'border-[#D4AF37] bg-amber-50/50 text-[#2C2416]'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-[#8B7355] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Project Group Room</p>
                          <p className="text-[10px] text-gray-500">Milestone thread for invited members</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setChannelType('PROJECT');
                          setChannelCategory('DESIGN_CRITIQUE');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                          channelCategory === 'DESIGN_CRITIQUE'
                            ? 'border-[#D4AF37] bg-amber-50/50 text-[#2C2416]'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Palette className="w-4 h-4 text-[#8B7355] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Design Critique Group</p>
                          <p className="text-[10px] text-gray-500">Aesthetic moodboards & FF&E</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setChannelType('PROJECT');
                          setChannelCategory('SITE_COORDINATION');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer col-span-2 ${
                          channelCategory === 'SITE_COORDINATION'
                            ? 'border-[#D4AF37] bg-amber-50/50 text-[#2C2416]'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <HardHat className="w-4 h-4 text-[#8B7355] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Site Coordination Group</p>
                          <p className="text-[10px] text-gray-500">Structural, HVAC & trades crew</p>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Privacy Notice Banner */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-[#8B7355] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8B7355] shrink-0" />
                <span>
                  {channelType === 'DIRECT'
                    ? '🔒 1-on-1 Privacy: Only you and the chosen participant will see this chat.'
                    : '🔒 Group Privacy: Only selected members will have visibility into this group channel.'}
                </span>
              </div>

              {/* Project Link (Optional / Required depending on category) */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  Associate Project (Optional)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white text-xs"
                >
                  <option value="">-- No specific project (General) --</option>
                  {assignedProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Channel / Topic Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  {channelType === 'DIRECT' ? 'Conversation Title (Optional)' : 'Channel / Topic Name *'}
                </label>
                <input
                  type="text"
                  required={channelType !== 'DIRECT'}
                  placeholder={
                    channelType === 'DIRECT'
                      ? 'Defaults to participant name (e.g. Marcus Vance)'
                      : 'e.g. Penthouse Marble Procurement Sync'
                  }
                  value={channelName}
                  onChange={e => setChannelName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white text-xs"
                />
              </div>

              {/* Select Members to Invite */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  {channelType === 'DIRECT'
                    ? 'Select Recipient (1 member)'
                    : `Select Group Members (${selectedMembers.length} selected)`}
                </label>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1 bg-gray-50/50">
                  {users
                    .filter(u => u.id !== currentUser.id && u.name.toLowerCase() !== currentUser.name.toLowerCase())
                    .map(u => {
                      const isSelected = selectedMembers.includes(u.name);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleMemberSelection(u.name)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-100 text-[#2C2416]' : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <div>
                              <span className="font-bold text-xs">{u.name}</span>
                              <span className="text-[10px] text-gray-500 ml-1.5">({u.role})</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#8B7355]" />}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Initial Message (Optional) */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  Opening Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={initialMessageText}
                  onChange={e => setInitialMessageText(e.target.value)}
                  placeholder="Share the project objective or initial topic..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white resize-none text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedMembers.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B8860B] disabled:opacity-50 text-black font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Create Channel & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
