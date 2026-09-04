import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock3,
  UserCheck,
  Building,
  Save,
  X,
  FileText,
  Camera
} from 'lucide-react';
import { SitePV, Project, Observation, Participant, WeatherType, ObservationStatus, PVPhoto, UserProfile, PhotoArrowAnnotation } from '../types';
import { SignaturePad } from './SignaturePad';
import { PhotoWithAnnotations } from './PhotoWithAnnotations';
import { PhotoAnnotatorModal } from './PhotoAnnotatorModal';

import { compressImage } from '../utils/imageCompressor';

interface PVFormWizardProps {
  initialPv?: SitePV | null;
  projects: Project[];
  activeProfile?: UserProfile;
  onSave: (pv: SitePV) => void;
  onCancel: () => void;
}

export const PVFormWizard: React.FC<PVFormWizardProps> = ({
  initialPv,
  projects,
  activeProfile,
  onSave,
  onCancel
}) => {
  const [projectId, setProjectId] = useState<string>(
    initialPv?.projectId || (projects[0]?.id || '')
  );

  const selectedProject = projects.find(p => p.id === projectId);

  const [number, setNumber] = useState<string>(
    initialPv?.number || `PV-${String(Math.floor(Math.random() * 900 + 100))}`
  );
  const [date, setDate] = useState<string>(
    initialPv?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState<string>(initialPv?.time || '10:00');
  const [weather, setWeather] = useState<WeatherType>(initialPv?.weather || 'Ensoleillé');
  const [overallProgress, setOverallProgress] = useState<number>(
    initialPv?.overallProgress || selectedProject?.progress || 50
  );
  const [nextMeetingDate, setNextMeetingDate] = useState<string>(
    initialPv?.nextMeetingDate || ''
  );
  const [nextMeetingTime, setNextMeetingTime] = useState<string>(
    initialPv?.nextMeetingTime || '10:00'
  );
  const [generalNotes, setGeneralNotes] = useState<string>(
    initialPv?.generalNotes || ''
  );

  // Initial Participants
  const defaultParticipants: Participant[] = selectedProject?.lots.map((lot, idx) => ({
    id: `p_${idx}_${Date.now()}`,
    name: lot.contactName || lot.companyName,
    role: `Entreprise (${lot.lotName})`,
    organization: lot.companyName,
    status: 'Présent' as const,
    phone: lot.phone
  })) || [];

  const [participants, setParticipants] = useState<Participant[]>(
    initialPv?.participants && initialPv.participants.length > 0
      ? initialPv.participants
      : [
          {
            id: 'p_arch',
            name: activeProfile?.name || 'Abdelali Miman',
            role: activeProfile?.title || 'Dessinateur-Projeteur',
            organization: activeProfile?.organization || 'ARCHITEXPERT',
            status: 'Présent',
            email: activeProfile?.email,
            phone: activeProfile?.phone
          },
          {
            id: 'p_client',
            name: selectedProject?.client || '',
            role: "Maître d'Ouvrage",
            organization: 'Client',
            status: 'Présent'
          },
          ...defaultParticipants
        ]
  );

  // Observations
  const [observations, setObservations] = useState<Observation[]>(
    initialPv?.observations || []
  );

  // Gallery Photos (16:9 Format)
  const [galleryPhotos, setGalleryPhotos] = useState<PVPhoto[]>(
    initialPv?.galleryPhotos || []
  );
  const [annotatorModalOpen, setAnnotatorModalOpen] = useState<boolean>(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const handleOpenAnnotator = (index: number) => {
    setSelectedPhotoIndex(index);
    setAnnotatorModalOpen(true);
  };

  const handleUpdatePhotoAnnotations = (photoIndex: number, annotations: PhotoArrowAnnotation[]) => {
    const updated = [...galleryPhotos];
    if (updated[photoIndex]) {
      updated[photoIndex] = {
        ...updated[photoIndex],
        annotations
      };
      setGalleryPhotos(updated);
    }
  };

  // Signatures
  const [signatures, setSignatures] = useState<Record<string, { roleName: string; signerName: string; dataUrl?: string; date?: string }>>(
    initialPv?.signatures || {
      architect: {
        roleName: `${activeProfile?.roleTag || "L'Architecte"} / Rédacteur`,
        signerName: activeProfile?.name || 'Abdelali Miman',
        date: date
      },
      client: {
        roleName: "Le Maître d'Ouvrage",
        signerName: selectedProject?.client || '',
        date: date
      },
      contractor: {
        roleName: "L'Entrepreneur Principal",
        signerName: selectedProject?.lots[0]?.companyName || '',
        date: date
      }
    }
  );

  // Switch project handler
  const handleProjectChange = (newProjId: string) => {
    setProjectId(newProjId);
    const p = projects.find(proj => proj.id === newProjId);
    if (p) {
      setOverallProgress(p.progress);
      // set default participants from project lots
      const lotsParticipants: Participant[] = p.lots.map((lot, idx) => ({
        id: `p_${idx}_${Date.now()}`,
        name: lot.contactName || lot.companyName,
        role: `Entreprise (${lot.lotName})`,
        organization: lot.companyName,
        status: 'Présent'
      }));

      setParticipants([
        {
          id: 'p_arch',
          name: 'Abdelali Miman',
          role: 'Dessinateur-Projeteur',
          organization: 'ARCHITEXPERT',
          status: 'Présent'
        },
        {
          id: 'p_client',
          name: p.client,
          role: "Maître d'Ouvrage",
          organization: 'Client',
          status: 'Présent'
        },
        ...lotsParticipants
      ]);
    }
  };

  // Participant helpers
  const addParticipant = () => {
    setParticipants([
      ...participants,
      {
        id: `p_${Date.now()}`,
        name: '',
        role: 'Intervenant',
        organization: '',
        status: 'Présent'
      }
    ]);
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value } as Participant;
    setParticipants(updated);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  // Observation helpers
  const addObservation = () => {
    const nextNum = observations.length + 1;
    setObservations([
      ...observations,
      {
        id: `obs_${Date.now()}`,
        number: nextNum,
        lot: selectedProject?.lots[0]?.lotName || 'Gros Œuvre',
        location: '',
        text: '',
        assignedTo: selectedProject?.lots[0]?.companyName || '',
        status: 'À faire',
        dueDate: date
      }
    ]);
  };

  const updateObservation = (index: number, field: keyof Observation, value: any) => {
    const updated = [...observations];
    updated[index] = { ...updated[index], [field]: value };
    setObservations(updated);
  };

  const removeObservation = (index: number) => {
    const updated = observations
      .filter((_, i) => i !== index)
      .map((obs, i) => ({ ...obs, number: i + 1 }));
    setObservations(updated);
  };

  // Image Upload handler for observation
  const handlePhotoUpload = async (index: number, file: File) => {
    if (!file) return;
    try {
      const compressedUrl = await compressImage(file, 1280, 720, 0.75);
      updateObservation(index, 'photoUrl', compressedUrl);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateObservation(index, 'photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gallery Photos (16:9) Handlers
  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    for (let fIdx = 0; fIdx < filesArray.length; fIdx++) {
      const file = filesArray[fIdx];
      let imgUrl = '';
      try {
        imgUrl = await compressImage(file, 1280, 720, 0.75);
      } catch {
        imgUrl = await new Promise((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      setGalleryPhotos(prev => [
        ...prev,
        {
          id: `photo_${Date.now()}_${fIdx}_${Math.random().toString(36).substring(2, 6)}`,
          url: imgUrl,
          caption: '',
          lot: selectedProject?.lots[0]?.lotName || 'Chantier',
          date: date
        }
      ]);
    }
  };

  const updateGalleryPhoto = (index: number, field: keyof PVPhoto, value: string) => {
    const updated = [...galleryPhotos];
    updated[index] = { ...updated[index], [field]: value };
    setGalleryPhotos(updated);
  };

  const removeGalleryPhoto = (index: number) => {
    setGalleryPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Signature updates
  const handleSignatureSave = (key: string, dataUrl: string, signerName?: string, roleName?: string) => {
    setSignatures(prev => ({
      ...prev,
      [key]: {
        signerName: signerName || prev[key]?.signerName || '',
        roleName: roleName || prev[key]?.roleName || '',
        dataUrl,
        date: date
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPv: SitePV = {
      id: initialPv?.id || `pv_${Date.now()}`,
      number,
      projectId,
      date,
      time,
      weather,
      overallProgress,
      nextMeetingDate,
      nextMeetingTime,
      generalNotes,
      participants: participants.filter(p => p.name.trim() !== ''),
      observations: observations.map((o, idx) => ({ ...o, number: idx + 1 })),
      galleryPhotos,
      signatures,
      authorId: initialPv?.authorId || activeProfile?.id,
      authorName: initialPv?.authorName || activeProfile?.name,
      authorTitle: initialPv?.authorTitle || activeProfile?.title,
      authorAvatar: initialPv?.authorAvatar || activeProfile?.avatarUrl,
      createdAt: initialPv?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newPv);
  };

  return (
    <div className="bg-white rounded-md border border-[#e2ded2] shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#0B1F3A] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#C9A24B]" />
          <div>
            <h2 className="font-serif text-lg font-bold">
              {initialPv ? `Édition du PV ${initialPv.number}` : 'Nouveau Procès-Verbal de Chantier'}
            </h2>
            <p className="text-xs text-[#e9edf3] opacity-80">
              {selectedProject ? selectedProject.name : 'Sélectionnez un projet'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-white/30 hover:bg-white/10 text-white text-xs font-medium rounded transition"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-[#C9A24B] hover:bg-[#b08b3a] text-[#0B1F3A] font-bold text-xs rounded shadow transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Enregistrer le PV
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* SECTION 1: INFORMATIONS GÉNÉRALES */}
        <div className="bg-[#f6f4ef] p-5 rounded-md border border-[#e2ded2] space-y-4">
          <h3 className="font-serif font-bold text-base text-[#0B1F3A] border-b border-[#e2ded2] pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#C9A24B]" />
            1. Références du Chantier & Réunion
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Sélection du Chantier *
              </label>
              <select
                value={projectId}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded bg-white font-medium text-xs focus:outline-none focus:border-[#0B1F3A]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.client})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Numéro de PV *
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="ex: PV-001"
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded font-mono font-bold text-xs bg-white focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Avancement Chantier (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overallProgress}
                  onChange={e => setOverallProgress(Number(e.target.value))}
                  className="flex-1 accent-[#0B1F3A]"
                />
                <span className="font-mono font-bold text-xs bg-[#0B1F3A] text-white px-2 py-1 rounded">
                  {overallProgress}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Date de la visite *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded bg-white text-xs focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Heure de réunion
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded bg-white text-xs focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Météo / Conditions
              </label>
              <select
                value={weather}
                onChange={e => setWeather(e.target.value as WeatherType)}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded bg-white text-xs focus:outline-none focus:border-[#0B1F3A]"
              >
                <option value="Ensoleillé">☀️ Ensoleillé</option>
                <option value="Nuageux">⛅ Nuageux</option>
                <option value="Pluvieux">🌧️ Pluvieux</option>
                <option value="Venteux">💨 Venteux</option>
                <option value="Brouillard">🌫️ Brouillard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
                Prochaine Réunion
              </label>
              <input
                type="date"
                value={nextMeetingDate}
                onChange={e => setNextMeetingDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#c9c3b1] rounded bg-white text-xs focus:outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Remarque Globale / Ordre du Jour
            </label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              placeholder="ex: Réunion de contrôle d'avancement du coulage dalle et pose des menuiseries..."
              className="w-full px-3 py-2 border border-[#c9c3b1] rounded bg-white text-xs focus:outline-none focus:border-[#0B1F3A]"
            />
          </div>
        </div>

        {/* SECTION 2: LISTE DES PARTICIPANTS */}
        <div className="bg-white p-5 rounded-md border border-[#e2ded2] space-y-4">
          <div className="flex justify-between items-center border-b border-[#e2ded2] pb-2">
            <h3 className="font-serif font-bold text-base text-[#0B1F3A] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#C9A24B]" />
              2. Feuillets de Présence ({participants.length} Personnes)
            </h3>
            <button
              type="button"
              onClick={addParticipant}
              className="text-xs font-bold text-[#0B1F3A] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter un participant
            </button>
          </div>

          <div className="space-y-3">
            {participants.map((p, idx) => (
              <div
                key={p.id || idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-[#f6f4ef] rounded border border-[#e2ded2] items-center text-xs"
              >
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={p.name}
                    onChange={e => updateParticipant(idx, 'name', e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#c9c3b1] rounded bg-white font-medium"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Organisme / Entreprise"
                    value={p.organization}
                    onChange={e => updateParticipant(idx, 'organization', e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#c9c3b1] rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Rôle (ex: Architecte, Client)"
                    value={p.role}
                    onChange={e => updateParticipant(idx, 'role', e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#c9c3b1] rounded bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={p.status}
                    onChange={e => updateParticipant(idx, 'status', e.target.value)}
                    className={`w-full px-2 py-1.5 border rounded font-bold ${
                      p.status === 'Présent'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : p.status === 'Excusé'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <option value="Présent">✓ Présent</option>
                    <option value="Excusé">⏱ Excusé</option>
                    <option value="Absent">✗ Absent</option>
                  </select>
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeParticipant(idx)}
                    className="text-[#a8481f] hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: OBSERVATIONS ET REMARQUES */}
        <div className="bg-white p-5 rounded-md border border-[#e2ded2] space-y-4">
          <div className="flex justify-between items-center border-b border-[#e2ded2] pb-2">
            <h3 className="font-serif font-bold text-base text-[#0B1F3A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C9A24B]" />
              3. Observations & Demandes de Corrections ({observations.length})
            </h3>
            <button
              type="button"
              onClick={addObservation}
              className="px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-bold rounded hover:bg-[#123356] transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvelle Observation
            </button>
          </div>

          {observations.length === 0 ? (
            <div className="text-center py-8 bg-[#f6f4ef] rounded border border-dashed border-[#c9c3b1]">
              <p className="text-xs text-[#565048] mb-2">Aucune observation enregistrée pour le moment.</p>
              <button
                type="button"
                onClick={addObservation}
                className="px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-semibold rounded hover:bg-[#123356]"
              >
                + Ajouter la première observation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {observations.map((obs, idx) => (
                <div
                  key={obs.id || idx}
                  className="border border-[#c9c3b1] rounded-md p-4 bg-[#f6f4ef] space-y-3 relative"
                >
                  <div className="flex items-center justify-between border-b border-[#e2ded2] pb-2">
                    <span className="font-mono font-bold text-xs text-[#0B1F3A] bg-[#e9edf3] px-2 py-0.5 rounded">
                      Obs. N°{idx + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <select
                        value={obs.status}
                        onChange={e => updateObservation(idx, 'status', e.target.value as ObservationStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded border ${
                          obs.status === 'Urgent'
                            ? 'bg-red-100 text-red-800 border-red-600 animate-pulse'
                            : obs.status === 'En cours'
                            ? 'bg-[#f4ecd6] text-[#9c7a2e] border-[#9c7a2e]'
                            : obs.status === 'Achevé' || obs.status === 'Terminé'
                            ? 'bg-[#e1efe6] text-[#2c6b4d] border-[#2c6b4d]'
                            : 'bg-[#f5e4da] text-[#a8481f] border-[#a8481f]'
                        }`}
                      >
                        <option value="À faire">🟡 À faire</option>
                        <option value="En cours">🟠 En cours</option>
                        <option value="Urgent">🚨 Urgent</option>
                        <option value="Achevé">🟢 Achevé / Levé</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => removeObservation(idx)}
                        className="text-[#a8481f] hover:text-red-700 p-1"
                        title="Supprimer cette observation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#565048] mb-1">
                        Lot / Corps d'état
                      </label>
                      <input
                        type="text"
                        value={obs.lot}
                        onChange={e => updateObservation(idx, 'lot', e.target.value)}
                        placeholder="ex: Gros Œuvre, Plomberie..."
                        className="w-full px-2.5 py-1.5 border border-[#c9c3b1] rounded bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#565048] mb-1">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={obs.location}
                        onChange={e => updateObservation(idx, 'location', e.target.value)}
                        placeholder="ex: 1er Étage - Balcon"
                        className="w-full px-2.5 py-1.5 border border-[#c9c3b1] rounded bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#565048] mb-1">
                        Entreprise Responsable
                      </label>
                      <input
                        type="text"
                        value={obs.assignedTo}
                        onChange={e => updateObservation(idx, 'assignedTo', e.target.value)}
                        placeholder="ex: BATI-MAROC"
                        className="w-full px-2.5 py-1.5 border border-[#c9c3b1] rounded bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#565048] mb-1">
                      Description de la réserve / consigne *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={obs.text}
                      onChange={e => updateObservation(idx, 'text', e.target.value)}
                      placeholder="Constat détaillé et action requise..."
                      className="w-full px-2.5 py-1.5 border border-[#c9c3b1] rounded bg-white text-xs focus:outline-none focus:border-[#0B1F3A]"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#e2ded2]/60 text-xs">
                    <span className="text-[#565048] font-bold uppercase text-[10px]">Délai de levée :</span>
                    <input
                      type="date"
                      value={obs.dueDate || ''}
                      onChange={e => updateObservation(idx, 'dueDate', e.target.value)}
                      className="px-2 py-1 border border-[#c9c3b1] rounded bg-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: GALERIE PHOTOS DU CHANTIER (16:9) */}
        <div className="bg-white p-5 rounded-md border border-[#e2ded2] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#e2ded2] pb-3 gap-2">
            <div>
              <h3 className="font-serif font-bold text-base text-[#0B1F3A] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#C9A24B]" />
                4. Galerie Photos du Chantier (Format 16:9)
              </h3>
              <p className="text-xs text-[#565048] mt-0.5">
                Ajoutez des vues d'ensemble et photos d'avancement cadrées en 16:9 pour illustrer le rapport.
              </p>
            </div>

            <label className="cursor-pointer bg-[#0B1F3A] hover:bg-[#123356] text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 shadow-xs">
              <Camera className="w-4 h-4 text-[#C9A24B]" />
              Ajouter des photos (16:9)
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleGalleryUpload(e.target.files)}
              />
            </label>
          </div>

          {galleryPhotos.length === 0 ? (
            <div className="border-2 border-dashed border-[#c9c3b1] rounded-lg p-6 text-center bg-[#f6f4ef]">
              <ImageIcon className="w-8 h-8 text-[#0B1F3A]/40 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#0B1F3A]">
                Aucune photo ajoutée à la galerie générale
              </p>
              <p className="text-[11px] text-[#565048] mt-1">
                Cliquez sur le bouton ci-dessus pour importer vos clichés du chantier. Toutes les images seront adaptées au format 16:9 sur le PV imprimable.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryPhotos.map((photo, pIdx) => (
                <div
                  key={photo.id || pIdx}
                  className="border border-[#c9c3b1] rounded-md bg-[#f6f4ef] p-3 flex flex-col justify-between space-y-2.5 relative group"
                >
                  {/* Photo Preview with Annotations */}
                  <div
                    onClick={() => handleOpenAnnotator(pIdx)}
                    className="relative cursor-pointer group rounded overflow-hidden"
                  >
                    <PhotoWithAnnotations
                      photo={photo}
                      className="aspect-video w-full rounded border border-[#c9c3b1] group-hover:border-[#0B1F3A] transition"
                      showCommentBadges={true}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGalleryPhoto(pIdx);
                      }}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md transition z-20 cursor-pointer"
                      title="Supprimer la photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold z-20">
                      16:9 — Photo N°{pIdx + 1}
                    </span>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none z-10">
                      <span className="bg-[#0B1F3A] text-white text-[11px] font-bold px-3 py-1 rounded shadow-md border border-[#C9A24B]">
                        🎯 Cliquer pour annoter avec flèches
                      </span>
                    </div>
                  </div>

                  {/* Button to open arrow comment tool */}
                  <button
                    type="button"
                    onClick={() => handleOpenAnnotator(pIdx)}
                    className="w-full py-1.5 px-2 bg-[#0B1F3A] hover:bg-[#123356] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer border border-[#C9A24B]/30"
                  >
                    <span className="text-[#C9A24B]">🎯</span>
                    <span>Flèches & Commentaires ({photo.annotations?.length || 0})</span>
                  </button>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#565048] mb-0.5">
                        Légende / Descriptif
                      </label>
                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={e => updateGalleryPhoto(pIdx, 'caption', e.target.value)}
                        placeholder="ex: Vue générale de la façade Est / Avancement du coulage"
                        className="w-full px-2 py-1 border border-[#c9c3b1] rounded bg-white text-xs focus:outline-none focus:border-[#0B1F3A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#565048] mb-0.5">
                          Zone / Corps d'état
                        </label>
                        <input
                          type="text"
                          value={photo.lot || ''}
                          onChange={e => updateGalleryPhoto(pIdx, 'lot', e.target.value)}
                          placeholder="ex: Gros Œuvre"
                          className="w-full px-2 py-1 border border-[#c9c3b1] rounded bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#565048] mb-0.5">
                          Date de prise
                        </label>
                        <input
                          type="date"
                          value={photo.date || date}
                          onChange={e => updateGalleryPhoto(pIdx, 'date', e.target.value)}
                          className="w-full px-2 py-1 border border-[#c9c3b1] rounded bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: SIGNATURES NUMÉRIQUES */}
        <div className="bg-white p-5 rounded-md border border-[#e2ded2] space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#e2ded2] pb-2 gap-1">
            <h3 className="font-serif font-bold text-base text-[#0B1F3A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C9A24B]" />
              5. Émargement & Signatures Numériques ({participants.length} participant{participants.length > 1 ? 's' : ''})
            </h3>
            <span className="text-xs text-[#565048] font-medium">
              Chaque participant dispose d'un espace dédié pour signer sur pad
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((p, idx) => {
              const sigKey = p.id || `p_${idx}`;
              const sig = signatures[sigKey] || signatures[p.name] || (idx === 0 ? signatures.architect : idx === 1 ? signatures.client : idx === 2 ? signatures.contractor : undefined);
              return (
                <SignaturePad
                  key={sigKey}
                  title={`${p.role || 'Participant'} (${p.organization || 'Entreprise'})`}
                  signerName={p.name || `Signataire ${idx + 1}`}
                  initialValue={sig?.dataUrl}
                  onSave={url => handleSignatureSave(sigKey, url, p.name, `${p.role} (${p.organization})`)}
                />
              );
            })}
          </div>
        </div>

        {/* Form Footer */}
        <div className="pt-4 border-t border-[#e2ded2] flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-[#c9c3b1] text-[#161514] font-medium text-xs rounded hover:bg-[#efece4] transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0B1F3A] text-white font-bold text-xs rounded hover:bg-[#123356] transition shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Enregistrer le Procès-Verbal
          </button>
        </div>
      </form>

      {/* Interactive Photo Lightbox with Arrow Annotation & Navigation */}
      {galleryPhotos.length > 0 && (
        <PhotoAnnotatorModal
          photos={galleryPhotos}
          initialIndex={selectedPhotoIndex}
          isOpen={annotatorModalOpen}
          onClose={() => setAnnotatorModalOpen(false)}
          onUpdatePhotoAnnotations={handleUpdatePhotoAnnotations}
        />
      )}
    </div>
  );
};
