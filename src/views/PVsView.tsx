import React, { useState } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Building,
  Eye,
  Edit,
  Trash2,
  Copy,
  Printer,
  ChevronRight,
  X,
  RotateCcw,
  User
} from 'lucide-react';
import { SitePV, Project, ViewType, UserProfile } from '../types';

interface PVsViewProps {
  pvs: SitePV[];
  projects: Project[];
  profiles?: UserProfile[];
  selectedProjectId?: string;
  onNavigate: (view: ViewType, params?: Record<string, any>) => void;
  onDeletePV: (pvId: string) => void;
  onDuplicatePV: (pv: SitePV) => void;
}

export const PVsView: React.FC<PVsViewProps> = ({
  pvs,
  projects,
  profiles = [],
  selectedProjectId,
  onNavigate,
  onDeletePV,
  onDuplicatePV
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId || 'Tous');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterAuthor, setFilterAuthor] = useState<string>('Tous');

  const filteredPvs = pvs.filter(pv => {
    const proj = projects.find(p => p.id === pv.projectId);

    const rawDate = pv.date || '';
    const formattedFrDate = rawDate ? new Date(rawDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : '';
    const longFrDate = rawDate ? new Date(rawDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : '';

    const term = searchTerm.trim().toLowerCase();

    const matchesSearch = !term || (
      pv.number.toLowerCase().includes(term) ||
      (proj?.name || '').toLowerCase().includes(term) ||
      (proj?.client || '').toLowerCase().includes(term) ||
      (proj?.city || '').toLowerCase().includes(term) ||
      (pv.generalNotes || '').toLowerCase().includes(term) ||
      rawDate.toLowerCase().includes(term) ||
      formattedFrDate.toLowerCase().includes(term) ||
      longFrDate.toLowerCase().includes(term) ||
      pv.observations.some(obs =>
        (obs.title || '').toLowerCase().includes(term) ||
        (obs.description || '').toLowerCase().includes(term) ||
        (obs.lotName || '').toLowerCase().includes(term)
      )
    );

    const matchesProject = filterProject === 'Tous' || pv.projectId === filterProject;
    const matchesDate = !filterDate || rawDate.startsWith(filterDate);
    const matchesAuthor = filterAuthor === 'Tous' || pv.authorId === filterAuthor || pv.authorName === filterAuthor;

    return matchesSearch && matchesProject && matchesDate && matchesAuthor;
  });

  const hasActiveFilters = searchTerm !== '' || filterProject !== 'Tous' || filterDate !== '' || filterAuthor !== 'Tous';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterProject('Tous');
    setFilterDate('');
    setFilterAuthor('Tous');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-md border border-[#e2ded2] shadow-sm">
        <div className="flex items-center gap-3">
          <FileCheck className="w-6 h-6 text-[#0B1F3A]" />
          <div>
            <h2 className="font-serif font-bold text-lg text-[#161514]">
              Procès-Verbaux de Chantier ({filteredPvs.length} / {pvs.length})
            </h2>
            <p className="text-xs text-[#565048]">
              Rapports officiels de visites de chantier, comptes-rendus et levées de réserves
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('new_pv')}
          className="px-5 py-2 bg-[#0B1F3A] text-white font-bold text-xs rounded hover:bg-[#123356] transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#C9A24B]" /> Rédiger un PV
        </button>
      </div>

      {/* Barre de Recherche & Filtres Avancés */}
      <div className="bg-white p-4 rounded-md border border-[#e2ded2] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#C9A24B]" /> Recherche & Filtres Rapides
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Barre de Recherche Principale */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre, N° (PV-001) ou mot-clé..."
              className="w-full pl-9 pr-8 py-2 bg-[#f6f4ef] focus:bg-white border border-[#c9c3b1] rounded text-xs font-medium focus:outline-none focus:border-[#0B1F3A] transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtre par Date */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#f6f4ef] focus:bg-white border border-[#c9c3b1] rounded text-xs font-medium focus:outline-none focus:border-[#0B1F3A] transition text-gray-700"
              title="Filtrer par date"
            />
          </div>

          {/* Filtre par Chantier */}
          <div>
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="w-full px-3 py-2 bg-[#f6f4ef] focus:bg-white border border-[#c9c3b1] rounded text-xs font-medium focus:outline-none focus:border-[#0B1F3A] transition"
            >
              <option value="Tous">Tous les chantiers ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par Auteur / Profil */}
          <div>
            <select
              value={filterAuthor}
              onChange={e => setFilterAuthor(e.target.value)}
              className="w-full px-3 py-2 bg-[#f6f4ef] focus:bg-white border border-[#c9c3b1] rounded text-xs font-medium focus:outline-none focus:border-[#0B1F3A] transition"
            >
              <option value="Tous">Tous les auteurs</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.roleTag})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PVs List Table */}
      {filteredPvs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-md border border-[#e2ded2]">
          <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-sm text-[#161514]">Aucun PV de chantier trouvé</h3>
          <p className="text-xs text-[#565048] mt-1">
            Créez votre premier procès-verbal de chantier ou réinitialisez votre recherche.
          </p>
          <button
            onClick={() => onNavigate('new_pv')}
            className="mt-4 px-4 py-2 bg-[#0B1F3A] text-white text-xs font-semibold rounded hover:bg-[#123356]"
          >
            + Rédiger un PV
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-[#e2ded2] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f6f4ef] border-b border-[#e2ded2] text-[#565048] font-bold uppercase text-[10px]">
                  <th className="p-3 border-r border-[#e2ded2]">Numéro PV</th>
                  <th className="p-3 border-r border-[#e2ded2]">Chantier & Client</th>
                  <th className="p-3 border-r border-[#e2ded2]">Auteur / Rédacteur</th>
                  <th className="p-3 border-r border-[#e2ded2]">Date Visite</th>
                  <th className="p-3 border-r border-[#e2ded2] text-center">Avancement</th>
                  <th className="p-3 border-r border-[#e2ded2] text-center">Réserves</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPvs.map(pv => {
                  const proj = projects.find(p => p.id === pv.projectId);
                  const openCount = pv.observations.filter(o => o.status === 'À faire' || o.status === 'Ouvert').length;
                  const inProgressCount = pv.observations.filter(o => o.status === 'En cours').length;
                  const urgentCount = pv.observations.filter(o => o.status === 'Urgent').length;
                  const acheveCount = pv.observations.filter(o => o.status === 'Achevé' || o.status === 'Terminé').length;
                  const totalObs = pv.observations.length;
                  const author = profiles.find(p => p.id === pv.authorId) || profiles.find(p => p.name === pv.authorName);
                  const displayAuthorName = pv.authorName || author?.name || 'Abdelali Miman';
                  const displayAuthorTitle = pv.authorTitle || author?.title || 'Architecte';

                  return (
                    <tr
                      key={pv.id}
                      className="border-b border-[#e2ded2] hover:bg-[#f6f4ef]/60 transition"
                    >
                      <td className="p-3 border-r border-[#e2ded2]">
                        <span className="font-mono font-bold text-sm text-[#0B1F3A]">
                          {pv.number}
                        </span>
                      </td>

                      <td className="p-3 border-r border-[#e2ded2]">
                        <div className="font-serif font-bold text-sm text-[#161514]">
                          {proj?.name || 'Chantier Inconnu'}
                        </div>
                        <div className="text-[11px] text-[#565048]">
                          {proj?.client} • {proj?.city}
                        </div>
                      </td>

                      <td className="p-3 border-r border-[#e2ded2]">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                            style={{ backgroundColor: author?.color || '#0B1F3A' }}
                          >
                            {displayAuthorName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#0B1F3A] dark:text-[#f1f5f9]">
                              {displayAuthorName}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {displayAuthorTitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 border-r border-[#e2ded2]">
                        <div className="font-medium text-[#161514]">
                          {new Date(pv.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-[10px] text-[#565048]">
                          {pv.weather}
                        </div>
                      </td>

                      <td className="p-3 border-r border-[#e2ded2] text-center">
                        <span className="font-mono font-bold text-xs bg-[#e9edf3] text-[#0B1F3A] px-2 py-0.5 rounded">
                          {pv.overallProgress}%
                        </span>
                      </td>

                      <td className="p-3 border-r border-[#e2ded2] text-center">
                        <div className="font-semibold text-[#161514]">
                          {totalObs} obs.
                        </div>
                        {urgentCount > 0 ? (
                          <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-1 rounded block">
                            {urgentCount} URGENT
                          </span>
                        ) : openCount > 0 ? (
                          <span className="text-[10px] font-bold text-[#a8481f] block">
                            {openCount} à faire
                          </span>
                        ) : inProgressCount > 0 ? (
                          <span className="text-[10px] font-bold text-[#9c7a2e] bg-[#f4ecd6] px-1 rounded block">
                            {inProgressCount} en cours
                          </span>
                        ) : acheveCount > 0 ? (
                          <span className="text-[10px] font-bold text-[#2c6b4d] bg-[#e1efe6] px-1 rounded block">
                            ✓ {acheveCount} Achevé{acheveCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#2c6b4d] block">
                            Toutes levées
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => onNavigate('pv_detail', { pvId: pv.id })}
                          className="px-2.5 py-1 bg-[#0B1F3A] text-white text-xs font-semibold rounded hover:bg-[#123356] inline-flex items-center gap-1"
                          title="Consulter et imprimer PDF"
                        >
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </button>

                        <button
                          onClick={() => onNavigate('edit_pv', { pvId: pv.id })}
                          className="p-1 text-gray-600 hover:text-[#0B1F3A] rounded hover:bg-[#f6f4ef]"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDuplicatePV(pv)}
                          className="p-1 text-gray-600 hover:text-[#0B1F3A] rounded hover:bg-[#f6f4ef]"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeletePV(pv.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
