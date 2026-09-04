import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  MapPin,
  User,
  Calendar,
  Briefcase,
  FileText,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Project, SitePV, ProjectStatus, ViewType } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  pvs: SitePV[];
  onNavigate: (view: ViewType, params?: Record<string, any>) => void;
  onOpenNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  pvs,
  onNavigate,
  onOpenNewProject,
  onEditProject,
  onDeleteProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Tous' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-md border border-[#e2ded2] shadow-sm">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-[#0B1F3A]" />
          <div>
            <h2 className="font-serif font-bold text-lg text-[#161514]">
              Mes Chantiers & Projets ({projects.length})
            </h2>
            <p className="text-xs text-[#565048]">
              Suivi technique et fiches d'entreprises par projet
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewProject}
          className="px-4 py-2 bg-[#0B1F3A] text-white font-bold text-xs rounded hover:bg-[#123356] transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#C9A24B]" /> Créer un Chantier
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom de chantier, client, ville, ref..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#c9c3b1] rounded text-xs focus:outline-none focus:border-[#0B1F3A]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#c9c3b1] rounded text-xs font-medium focus:outline-none focus:border-[#0B1F3A]"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="En réception">En réception</option>
            <option value="Achevé">Achevé</option>
            <option value="Archivé">Archivé</option>
          </select>
        </div>
      </div>

      {/* Projects List Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-md border border-[#e2ded2]">
          <Building className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-sm text-[#161514]">Aucun chantier trouvé</h3>
          <p className="text-xs text-[#565048] mt-1">
            Ajustez vos filtres de recherche ou créez votre premier projet.
          </p>
          <button
            onClick={onOpenNewProject}
            className="mt-4 px-4 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded hover:bg-[#123356]"
          >
            + Créer un chantier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map(project => {
            const projectPvs = pvs.filter(pv => pv.projectId === project.id);
            const openReserves = projectPvs
              .flatMap(pv => pv.observations)
              .filter(o => o.status === 'Ouvert' || o.status === 'À faire' || o.status === 'Urgent').length;

            return (
              <div
                key={project.id}
                className="bg-white rounded-md border border-[#e2ded2] hover:border-[#0B1F3A] transition shadow-sm p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] font-bold bg-[#e9edf3] text-[#0B1F3A] px-2 py-0.5 rounded">
                        {project.code}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#161514] mt-1">
                        {project.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        project.status === 'En cours'
                          ? 'bg-[#e9edf3] text-[#0B1F3A]'
                          : project.status === 'En réception'
                          ? 'bg-[#f4ecd6] text-[#9c7a2e]'
                          : project.status === 'Achevé'
                          ? 'bg-[#e1efe6] text-[#2c6b4d]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="text-xs text-[#565048] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0B1F3A]" />
                      <span>Maître d'Ouvrage: <strong className="text-[#161514]">{project.client}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#a8481f]" />
                      <span>{project.address}, {project.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Début: {new Date(project.startDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-[#565048] font-medium">
                      <span>Avancement général</span>
                      <span className="font-mono font-bold text-[#0B1F3A]">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-[#e2ded2] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0B1F3A] h-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Lots Tag Chips */}
                  {project.lots && project.lots.length > 0 && (
                    <div className="pt-2 border-t border-[#e2ded2]/60">
                      <div className="text-[10px] uppercase font-bold text-[#565048] mb-1.5 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Lots & Entreprises ({project.lots.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.lots.map(lot => (
                          <span
                            key={lot.id}
                            className="text-[10px] bg-[#f6f4ef] text-[#161514] border border-[#c9c3b1] px-2 py-0.5 rounded"
                          >
                            {lot.lotName}: {lot.companyName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-[#e2ded2] flex items-center justify-between">
                  <div className="text-[11px] text-[#565048] font-mono">
                    <span className="font-bold text-[#0B1F3A]">{projectPvs.length}</span> PVs
                    {openReserves > 0 && (
                      <span className="ml-2 text-[#a8481f] font-bold">({openReserves} réserves)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditProject(project)}
                      className="p-1.5 text-gray-600 hover:text-[#0B1F3A] hover:bg-[#f6f4ef] rounded"
                      title="Éditer le projet"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Supprimer le projet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onNavigate('pvs', { projectId: project.id })}
                      className="px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-semibold rounded hover:bg-[#123356] transition flex items-center gap-1"
                    >
                      Voir les PV <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
