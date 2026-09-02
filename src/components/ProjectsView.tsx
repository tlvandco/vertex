import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus } from '../types';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { getRolePermissions } from '../utils/rbac';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    openProjectDrawer,
    setIsCreateProjectOpen,
    setEditingProjectData,
    deleteProject,
    currentUser
  } = useApp();

  const rolePermissions = getRolePermissions(currentUser.role);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const isClient = currentUser.role === 'CLIENT';

  const roleScopedProjects = isClient
    ? projects.filter(
        p =>
          p.clientId === currentUser.id ||
          p.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          currentUser.assignedProjectIds?.includes(p.id)
      )
    : projects;

  const filteredProjects = roleScopedProjects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'PLANNING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Planning</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">In Progress</span>;
      case 'ON_HOLD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">On Hold</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Completed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2C2416]">
            {isClient ? 'My Assigned Estate Project' : 'Project Portfolio'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isClient
              ? 'Private architectural deliverables, milestones, and site progress for your estate.'
              : 'Architectural projects, estate renovations, and commercial space developments.'}
          </p>
        </div>

        {rolePermissions.canCreateProject && (
          <button
            onClick={() => {
              setEditingProjectData(null);
              setIsCreateProjectOpen(true);
            }}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, client, location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {['ALL', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#2C2416] text-[#D4AF37]'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              {st === 'ALL' ? 'All Projects' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-12 h-12 bg-amber-50 text-[#8B7355] rounded-full flex items-center justify-center mx-auto mb-3">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No Projects Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {isClient
              ? 'No active estates are assigned to your client token yet.'
              : 'Try adjusting your search criteria or create a new project to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => {
            const spentPercentage = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;
            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Project Cover Image */}
                <div className="relative h-48 bg-gray-900 overflow-hidden">
                  <img
                    src={project.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-[#D4AF37] px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold tracking-wider border border-[#D4AF37]/30">
                      {project.code}
                    </span>
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Quick Actions (Edit/Delete strictly guarded by role permissions) */}
                  {(rolePermissions.canEditProject || rolePermissions.canDeleteProject) && (
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      {rolePermissions.canEditProject && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingProjectData(project);
                            setIsCreateProjectOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-[#D4AF37] hover:bg-black/80 transition-colors cursor-pointer"
                          title="Edit Project Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {rolePermissions.canDeleteProject && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete ${project.name}?`)) {
                              deleteProject(project.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:text-red-400 hover:bg-black/80 transition-colors cursor-pointer"
                          title="Delete Project (Admin Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bottom Image Overlay Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif font-bold text-lg leading-snug drop-shadow-xs">
                      {project.name}
                    </h3>
                    <p className="text-[11px] text-amber-200/90 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Description snippet */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Progress & Financials */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-500">Progress</span>
                        <span className="font-bold text-[#8B7355]">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase font-semibold block">Total Budget</span>
                        <span className="font-bold text-gray-900">${project.budget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase font-semibold block">Spent</span>
                        <span className="font-bold text-[#8B7355]">${project.spent.toLocaleString()} ({spentPercentage}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Client & Team Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Client</span>
                      <span className="text-xs font-semibold text-gray-800">{project.clientName}</span>
                    </div>

                    {/* Team Avatars */}
                    <div className="flex items-center -space-x-2">
                      {project.team.slice(0, 3).map((tm, idx) => (
                        <img
                          key={idx}
                          src={tm.memberAvatar}
                          alt={tm.memberName}
                          title={`${tm.memberName} (${tm.role})`}
                          className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                      ))}
                      {project.team.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-[#2C2416] text-[#D4AF37] text-[10px] font-bold flex items-center justify-center border-2 border-white">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manage Drawer Action CTA */}
                  <button
                    onClick={() => openProjectDrawer(project.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-[#2C2416] text-gray-800 hover:text-[#D4AF37] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:bg-[#2C2416] group-hover:text-[#D4AF37]"
                  >
                    <span>{isClient ? 'View Milestones & Details' : 'Manage Details & Milestones'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
