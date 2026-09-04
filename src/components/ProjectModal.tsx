import React, { useState } from 'react';
import { X, Plus, Trash2, Building, User, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Project, LotCompany, ProjectStatus } from '../types';

interface ProjectModalProps {
  project?: Project | null;
  onClose: () => void;
  onSave: (projectData: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave }) => {
  const [name, setName] = useState(project?.name || '');
  const [code, setCode] = useState(project?.code || `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 90 + 10)}`);
  const [client, setClient] = useState(project?.client || '');
  const [address, setAddress] = useState(project?.address || '');
  const [city, setCity] = useState(project?.city || 'Casablanca');
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'En cours');
  const [progress, setProgress] = useState<number>(project?.progress || 10);
  const [startDate, setStartDate] = useState(project?.startDate || new Date().toISOString().split('T')[0]);
  const [estimatedEndDate, setEstimatedEndDate] = useState(project?.estimatedEndDate || '');
  const [notes, setNotes] = useState(project?.notes || '');

  const [lots, setLots] = useState<LotCompany[]>(project?.lots || [
    { id: '1', lotName: 'Gros Œuvre', companyName: '', contactName: '', phone: '' },
    { id: '2', lotName: 'Étanchéité', companyName: '', contactName: '', phone: '' },
    { id: '3', lotName: 'Électricité', companyName: '', contactName: '', phone: '' },
    { id: '4', lotName: 'Plomberie', companyName: '', contactName: '', phone: '' }
  ]);

  const addLot = () => {
    setLots([
      ...lots,
      { id: Date.now().toString(), lotName: '', companyName: '', contactName: '', phone: '' }
    ]);
  };

  const updateLot = (index: number, field: keyof LotCompany, value: string) => {
    const updated = [...lots];
    updated[index] = { ...updated[index], [field]: value };
    setLots(updated);
  };

  const removeLot = (index: number) => {
    setLots(lots.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedProject: Project = {
      id: project?.id || `prj_${Date.now()}`,
      code,
      name,
      client,
      address,
      city,
      status,
      progress,
      startDate,
      estimatedEndDate,
      lots: lots.filter(l => l.lotName.trim() !== ''),
      notes
    };

    onSave(savedProject);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-md border border-[#e2ded2] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2ded2] flex justify-between items-center bg-[#f6f4ef]">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#0B1F3A]" />
            <h3 className="font-serif font-bold text-lg text-[#161514]">
              {project ? 'Éditer le Chantier' : 'Nouveau Chantier'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#565048] hover:text-[#161514] p-1 rounded hover:bg-[#efece4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Nom du Chantier *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ex: Résidence Anfa Sky - Villa 12"
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Code / Ref
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded font-mono text-xs focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Maître d'Ouvrage (Client)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  placeholder="ex: M. Omar Kettani / Somagec"
                  className="w-full pl-9 pr-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Ville
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="ex: Casablanca, Rabat, Marrakech..."
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Adresse du Chantier
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="ex: Lotissement Anfa Superior, Rue 12"
                className="w-full pl-9 pr-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A]"
              >
                <option value="En cours">En cours</option>
                <option value="En réception">En réception</option>
                <option value="Achevé">Achevé / Réceptionné</option>
                <option value="Archivé">Archivé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Avancement (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          {/* Lots & Corps d'état */}
          <div className="border-t border-[#e2ded2] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif font-bold text-sm text-[#161514] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#0B1F3A]" />
                Lots & Entreprises Intervenantes
              </h4>
              <button
                type="button"
                onClick={addLot}
                className="text-xs font-semibold text-[#0B1F3A] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un lot
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {lots.map((lot, idx) => (
                <div key={lot.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 bg-[#f6f4ef] rounded border border-[#e2ded2] items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Lot (ex: Gros Œuvre)"
                      value={lot.lotName}
                      onChange={e => updateLot(idx, 'lotName', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#c9c3b1] rounded bg-white"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Entreprise (ex: BATI-MAROC)"
                      value={lot.companyName}
                      onChange={e => updateLot(idx, 'companyName', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#c9c3b1] rounded bg-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Contact / Tél"
                      value={lot.contactName || lot.phone || ''}
                      onChange={e => updateLot(idx, 'contactName', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#c9c3b1] rounded bg-white"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeLot(idx)}
                      className="text-[#a8481f] hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Remarques Générales du Chantier
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Consignes particulières, contraintes d'accès, etc."
              className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#e2ded2] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c9c3b1] text-[#161514] font-medium text-xs rounded hover:bg-[#efece4] transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0B1F3A] text-white font-semibold text-xs rounded hover:bg-[#123356] transition shadow-sm"
            >
              {project ? 'Enregistrer les modifications' : 'Créer le chantier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
