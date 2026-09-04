import React from 'react';
import {
  Building,
  FileCheck,
  AlertCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Project, SitePV, ViewType } from '../types';

interface DashboardViewProps {
  projects: Project[];
  pvs: SitePV[];
  onNavigate: (view: ViewType, params?: Record<string, any>) => void;
  onOpenNewProject: () => void;
  onLoadDemoData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  pvs,
  onNavigate,
  onOpenNewProject,
  onLoadDemoData
}) => {
  // Stats
  const totalProjects = projects.length;
  const totalPvs = pvs.length;

  const allObservations = pvs.flatMap(pv => pv.observations);
  const aFaireObs = allObservations.filter(o => o.status === 'À faire' || o.status === 'Ouvert').length;
  const inProgressObs = allObservations.filter(o => o.status === 'En cours').length;
  const urgentObs = allObservations.filter(o => o.status === 'Urgent').length;
  const acheveObs = allObservations.filter(o => o.status === 'Achevé' || o.status === 'Terminé').length;

  const resolutionRate = allObservations.length > 0
    ? Math.round((acheveObs / allObservations.length) * 100)
    : 100;

  const latestPv = pvs[0];
  const latestProject = projects.find(p => p.id === latestPv?.projectId) || projects[0];
  const nextMeetingPv = pvs.find(p => p.nextMeetingDate);

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="bg-[#f6f4ef] p-5 rounded-lg border border-[#e2ded2] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#0B1F3A]">
            Tableau de Bord Chantier
          </h2>
          <p className="text-xs text-[#565048] mt-0.5">
            Aperçu bento synthétique des chantiers, visites et levées de réserves
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2 border border-[#0B1F3A] bg-transparent text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white font-semibold text-xs rounded transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nouveau Chantier
          </button>

          <button
            onClick={() => onNavigate('new_pv')}
            className="px-5 py-2 bg-[#0B1F3A] text-white hover:bg-[#123356] font-bold text-xs rounded shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#C9A24B]" /> Nouveau PV
          </button>

          {totalProjects === 0 && (
            <button
              onClick={onLoadDemoData}
              className="px-4 py-2 bg-[#C9A24B] text-[#0B1F3A] font-bold text-xs rounded hover:bg-[#b08b3a] transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> Charger la Démo
            </button>
          )}
        </div>
      </div>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-5">
        {/* Bento Box 1: Projets Actifs */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-[#e2ded2] rounded-lg p-6 flex flex-col justify-between shadow-2xs hover:border-[#0B1F3A] transition">
          <p className="text-[11px] font-bold text-[#565048] tracking-wider uppercase">Projets Actifs</p>
          <div className="flex items-end justify-between mt-4">
            <span className="text-5xl font-bold font-serif text-[#0B1F3A]">{totalProjects}</span>
            <span className="text-green-700 text-xs font-bold bg-[#e1efe6] px-2 py-1 rounded">Chantiers</span>
          </div>
        </div>

        {/* Bento Box 2: Actions à Faire */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-[#e2ded2] rounded-lg p-6 flex flex-col justify-between shadow-2xs hover:border-[#a8481f] transition">
          <p className="text-[11px] font-bold text-[#565048] tracking-wider uppercase">Actions À Faire</p>
          <div className="flex items-end justify-between mt-4">
            <span className="text-5xl font-bold font-serif text-[#a8481f]">{aFaireObs + inProgressObs}</span>
            <span className="text-[#a8481f] text-[10px] uppercase font-bold bg-[#f5e4da] px-2 py-1 rounded">
              {urgentObs > 0 ? `${urgentObs} Urgence(s)` : 'En Suivi'}
            </span>
          </div>
        </div>

        {/* Bento Box 3: Total PVs */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-[#e2ded2] rounded-lg p-6 flex flex-col justify-between shadow-2xs hover:border-[#0B1F3A] transition">
          <p className="text-[11px] font-bold text-[#565048] tracking-wider uppercase">Procès-Verbaux Émis</p>
          <div className="flex items-end justify-between mt-4">
            <span className="text-5xl font-bold font-serif text-[#0B1F3A]">{totalPvs}</span>
            <span className="text-[#0B1F3A] text-xs font-bold bg-[#e9edf3] px-2 py-1 rounded">Registre</span>
          </div>
        </div>

        {/* Bento Box 4: Conformité / Résolution */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-[#e2ded2] rounded-lg p-6 flex items-center justify-between shadow-2xs hover:border-[#2c6b4d] transition">
          <div>
            <p className="text-[11px] font-bold text-[#565048] tracking-wider uppercase">Réserves Achevées</p>
            <span className="text-4xl font-bold font-serif text-[#2c6b4d] mt-1 block">{acheveObs} ({resolutionRate}%)</span>
          </div>
          <div className="p-3 bg-[#e1efe6] rounded-full text-[#2c6b4d]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        {/* Featured Hero Bento Box 5: Dernière Visite Highlight (Dark Navy) */}
        <div className="col-span-12 lg:col-span-6 bg-[#0B1F3A] text-white rounded-lg p-6 lg:p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] bg-[#C9A24B] text-[#0B1F3A] px-2.5 py-0.5 rounded font-bold uppercase mb-2 inline-block">
                Dernière Visite de Chantier
              </span>
              <h3 className="text-2xl font-bold font-serif tracking-tight text-white mt-1">
                {latestProject?.name || 'Aucun chantier récent'}
              </h3>
              <p className="text-blue-200 text-xs italic mt-0.5">
                {latestPv ? `${latestPv.number} — Le ${new Date(latestPv.date).toLocaleDateString('fr-FR')}` : 'Aucun PV émis'}
              </p>
            </div>
            {latestProject && (
              <div className="text-right">
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">Avancement</p>
                <p className="text-xl font-bold font-mono text-[#C9A24B]">{latestProject.progress}%</p>
              </div>
            )}
          </div>

          <div className="flex-1 bg-white/5 rounded-md p-4 border border-white/10 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">
              Dernières Observations
            </p>
            {latestPv && latestPv.observations.length > 0 ? (
              <ul className="space-y-2.5">
                {latestPv.observations.slice(0, 3).map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-200">
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                      obs.status === 'Urgent'
                        ? 'bg-red-400'
                        : obs.status === 'En cours'
                        ? 'bg-amber-400'
                        : obs.status === 'Achevé' || obs.status === 'Terminé'
                        ? 'bg-emerald-400'
                        : 'bg-orange-300'
                    }`} />
                    <div className="line-clamp-2">
                      <strong className="text-white">{obs.lot} ({obs.location}) :</strong> {obs.text}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-blue-200 italic">Aucune observation sur le dernier PV.</p>
            )}
          </div>

          {latestPv && (
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-blue-200">
              <span>{latestPv.observations.length} points de contrôle enregistrés</span>
              <button
                onClick={() => onNavigate('pv_detail', { pvId: latestPv.id })}
                className="text-[#C9A24B] hover:underline font-bold flex items-center gap-1"
              >
                Consulter ce PV <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bento Box 6: Historique Récent des PV */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-[#e2ded2] rounded-lg p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e2ded2]">
              <h3 className="font-serif font-bold text-lg text-[#0B1F3A]">
                Historique des Procès-Verbaux
              </h3>
              <button
                onClick={() => onNavigate('pvs')}
                className="text-xs text-[#0B1F3A] font-bold uppercase hover:underline"
              >
                Voir Tout ({pvs.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {pvs.slice(0, 4).map(pv => {
                const proj = projects.find(p => p.id === pv.projectId);
                return (
                  <div
                    key={pv.id}
                    onClick={() => onNavigate('pv_detail', { pvId: pv.id })}
                    className="flex items-center justify-between p-3 rounded border border-[#e2ded2] hover:bg-[#f6f4ef] transition cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0B1F3A]">
                        {pv.number} — {proj?.name || 'Chantier'}
                      </p>
                      <p className="text-[11px] text-[#565048]">
                        Le {new Date(pv.date).toLocaleDateString('fr-FR')} • {pv.observations.length} observations
                      </p>
                    </div>
                    <span className="text-[10px] font-bold border border-green-200 text-green-700 bg-green-50 px-2 py-0.5 rounded uppercase">
                      Imprimable
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e2ded2] text-right">
            <button
              onClick={() => onNavigate('new_pv')}
              className="text-xs font-bold text-[#0B1F3A] hover:underline inline-flex items-center gap-1"
            >
              + Créer un nouveau procès-verbal
            </button>
          </div>
        </div>

        {/* Bento Box 7: Prochaine Réunion */}
        <div className="col-span-12 lg:col-span-6 bg-[#f6f4ef] border border-[#c9c3b1] rounded-lg p-6 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-bold text-[#565048] uppercase tracking-wider mb-2">
            Prochaine Réunion Convoquée
          </p>
          {nextMeetingPv ? (
            <div>
              <p className="text-xl font-bold font-serif text-[#0B1F3A] leading-tight">
                {new Date(nextMeetingPv.nextMeetingDate!).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
                {nextMeetingPv.nextMeetingTime && <><br />à {nextMeetingPv.nextMeetingTime}</>}
              </p>
              <p className="text-xs text-[#0B1F3A] mt-2 font-semibold">
                Projet : {projects.find(p => p.id === nextMeetingPv.projectId)?.name || 'Chantier'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#565048] italic">
              Aucune prochaine date de réunion programmée.
            </p>
          )}
        </div>

        {/* Bento Box 8: Liste Rapide Chantiers */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-[#e2ded2] rounded-lg p-6">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#e2ded2]">
            <h4 className="font-serif font-bold text-sm text-[#0B1F3A] uppercase tracking-wider">
              Chantiers & Avancement
            </h4>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-[#0B1F3A] font-bold hover:underline"
            >
              Gérer les chantiers
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 3).map(p => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#161514]">
                  <span>{p.name} ({p.city})</span>
                  <span className="font-mono text-[#0B1F3A]">{p.progress}%</span>
                </div>
                <div className="w-full bg-[#e2ded2] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0B1F3A] h-full transition-all duration-300"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
