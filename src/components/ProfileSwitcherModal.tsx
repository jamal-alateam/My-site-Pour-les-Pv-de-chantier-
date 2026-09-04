import React, { useState } from 'react';
import {
  User,
  UserPlus,
  Check,
  X,
  Edit2,
  Trash2,
  Shield,
  Briefcase,
  Mail,
  Phone,
  Building,
  Camera,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onAddProfile: (profile: Omit<UserProfile, 'id'>) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onDeleteProfile: (profileId: string) => void;
}

const PRESET_COLORS = [
  '#0B1F3A', '#C9A24B', '#10B981', '#6366F1', '#EC4899', '#F59E0B', '#3B82F6', '#8B5CF6'
];

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<UserProfile, 'id'>>({
    name: '',
    title: '',
    organization: '',
    email: '',
    phone: '',
    roleTag: 'Architecte',
    avatarUrl: '',
    color: '#0B1F3A'
  });

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      title: 'Conducteur de Travaux',
      organization: 'Cabinet / Entreprise',
      email: '',
      phone: '',
      roleTag: 'Conducteur de Travaux',
      avatarUrl: '',
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
    });
    setIsCreating(true);
  };

  const handleStartEdit = (p: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProfile(p);
    setFormData({
      name: p.name,
      title: p.title,
      organization: p.organization,
      email: p.email,
      phone: p.phone,
      roleTag: p.roleTag,
      avatarUrl: p.avatarUrl || '',
      color: p.color
    });
    setIsCreating(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 400, 0.8);
      setFormData(prev => ({ ...prev, avatarUrl: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProfile) {
      onUpdateProfile({
        ...editingProfile,
        ...formData
      });
    } else {
      onAddProfile(formData);
    }
    setIsCreating(false);
    setEditingProfile(null);
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b26] w-full max-w-lg rounded-xl shadow-2xl border border-[#e2ded2] dark:border-[#233144] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2ded2] dark:border-[#233144] flex items-center justify-between bg-[#f6f4ef] dark:bg-[#1a2433]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] text-[#C9A24B] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#0B1F3A] dark:text-[#93c5fd]">
                {isCreating
                  ? (editingProfile ? 'Modifier le Profil' : 'Nouveau Profil Utilisateur')
                  : 'Sélecteur de Profils & Équipe'}
              </h3>
              <p className="text-xs text-[#565048] dark:text-[#94a3b8]">
                {isCreating
                  ? 'Chaque intervenant possède son identité et ses coordonnées'
                  : 'Changer d\'utilisateur actif pour la rédaction des PVs'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isCreating) {
                setIsCreating(false);
              } else {
                onClose();
              }
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-white dark:hover:bg-[#202d40] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isCreating ? (
            <>
              {/* Profiles List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#565048] dark:text-[#94a3b8] font-bold uppercase tracking-wider mb-1">
                  <span>Membres & Profils Enregistrés ({profiles.length})</span>
                  <span>Statut</span>
                </div>

                {profiles.map(p => {
                  const isActive = p.id === activeProfileId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProfile(p.id);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer group ${
                        isActive
                          ? 'border-[#0B1F3A] bg-[#f0f4f8] dark:bg-[#1a2f4a] dark:border-[#3b82f6] shadow-2xs'
                          : 'border-[#e2ded2] dark:border-[#233144] hover:bg-[#f6f4ef] dark:hover:bg-[#1a2433]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        {p.avatarUrl ? (
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-11 h-11 rounded-full object-cover border-2 shadow-2xs"
                            style={{ borderColor: p.color || '#0B1F3A' }}
                          />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-full text-white font-bold text-sm flex items-center justify-center shadow-2xs shrink-0"
                            style={{ backgroundColor: p.color || '#0B1F3A' }}
                          >
                            {getInitials(p.name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#0B1F3A] dark:text-[#f1f5f9] truncate">
                              {p.name}
                            </span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                              style={{ backgroundColor: p.color || '#0B1F3A' }}
                            >
                              {p.roleTag}
                            </span>
                          </div>
                          <div className="text-xs text-[#565048] dark:text-[#94a3b8] truncate">
                            {p.title} • <span className="font-semibold">{p.organization}</span>
                          </div>
                          {p.email && (
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                              {p.email} {p.phone ? `• ${p.phone}` : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isActive && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-[11px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Actif
                          </span>
                        )}

                        <button
                          onClick={(e) => handleStartEdit(p, e)}
                          className="p-1.5 text-gray-400 hover:text-[#0B1F3A] dark:hover:text-[#93c5fd] hover:bg-white dark:hover:bg-[#202d40] rounded transition"
                          title="Modifier ce profil"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {profiles.length > 1 && !p.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Voulez-vous vraiment supprimer le profil de ${p.name} ?`)) {
                                onDeleteProfile(p.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950 transition"
                            title="Supprimer ce profil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Profile Button */}
              <button
                onClick={handleStartCreate}
                className="w-full py-3 px-4 border-2 border-dashed border-[#c9c3b1] dark:border-[#33455e] hover:border-[#0B1F3A] dark:hover:border-[#93c5fd] rounded-xl text-xs font-bold text-[#0B1F3A] dark:text-[#93c5fd] flex items-center justify-center gap-2 transition hover:bg-[#f6f4ef] dark:hover:bg-[#1a2433]"
              >
                <UserPlus className="w-4 h-4 text-[#C9A24B]" /> + Ajouter un nouveau profil d'intervenant
              </button>
            </>
          ) : (
            /* Create / Edit Profile Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload / Preview */}
              <div className="flex items-center gap-4 bg-[#f6f4ef] dark:bg-[#1a2433] p-4 rounded-xl border border-[#e2ded2] dark:border-[#233144]">
                <div className="relative shrink-0">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 shadow-sm"
                      style={{ borderColor: formData.color }}
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full text-white font-bold text-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: formData.color }}
                    >
                      {getInitials(formData.name || 'Nouveau')}
                    </div>
                  )}

                  <label className="absolute bottom-0 right-0 bg-[#0B1F3A] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#123356] transition shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-1">
                  <label className="block text-xs font-bold text-[#0B1F3A] dark:text-[#93c5fd]">
                    Photo de Profil / Avatar
                  </label>
                  <p className="text-[11px] text-[#565048] dark:text-[#94a3b8]">
                    Ajoutez une photo ou utilisez vos initiales de couleur personnalisée
                  </p>
                  
                  {/* Color Palette Selection */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                        className={`w-5 h-5 rounded-full transition transform ${
                          formData.color === c ? 'scale-125 ring-2 ring-offset-1 ring-black dark:ring-white' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#161514] dark:text-[#e2e8f0] mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Ing. Youssef El Amrani"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a2433] border border-[#c9c3b1] dark:border-[#33455e] rounded-lg text-xs font-medium focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161514] dark:text-[#e2e8f0] mb-1">
                    Fonction / Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="ex: Architecte Chef de Projet"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a2433] border border-[#c9c3b1] dark:border-[#33455e] rounded-lg text-xs font-medium focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>
              </div>

              {/* Organization & Role Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#161514] dark:text-[#e2e8f0] mb-1">
                    Organisme / Société
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={e => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder="ex: ARCHITEXPERT / BATI-MAROC"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a2433] border border-[#c9c3b1] dark:border-[#33455e] rounded-lg text-xs font-medium focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161514] dark:text-[#e2e8f0] mb-1">
                    Rôle de Chantier
                  </label>
                  <select
                    value={formData.roleTag}
                    onChange={e => setFormData(prev => ({ ...prev, roleTag: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a2433] border border-[#c9c3b1] dark:border-[#33455e] rounded-lg text-xs font-medium focus:outline-none focus:border-[#0B1F3A]"
                  >
                    <option value="Architecte">Architecte / Maître d'Œuvre</option>
                    <option value="Conducteur de Travaux">Conducteur de Travaux</option>
                    <option value="Ingénieur">Ingénieur / BET</option>
                    <option value="Maître d'Ouvrage">Maître d'Ouvrage / Client</option>
                    <option value="Inspecteur">Inspecteur / Contrôleur</option>
                    <option value="Autre">Autre Intervenant</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#161514] dark:text-[#e2e8f0] mb-1">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ex: v.nom@domaine.ma"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a2433] border border-[#c9c3b1] dark:border-[#33455e] rounded-lg text-xs font-medium focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161514] dark:text-[#e2e8f0] mb-1">
                    Téléphone Direct
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="ex: 06 61 00 00 00"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a2433] border border-[#c9c3b1] dark:border-[#33455e] rounded-lg text-xs font-medium focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2ded2] dark:border-[#233144]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold text-[#565048] hover:bg-gray-100 dark:hover:bg-[#1a2433] rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B1F3A] text-white text-xs font-bold rounded-lg hover:bg-[#123356] transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#C9A24B]" />
                  {editingProfile ? 'Enregistrer les modifications' : 'Créer le profil'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
