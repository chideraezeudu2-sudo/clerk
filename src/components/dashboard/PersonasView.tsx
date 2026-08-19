import React, { useState } from 'react';
import { Persona } from '../../types';

interface PersonasViewProps {
  personas: Persona[];
  onAddPersona: (newPersona: Omit<Persona, 'id' | 'activeCampaignsCount'>) => void;
  onEditPersona: (id: string, updated: Partial<Persona>) => void;
  onDeletePersona: (id: string) => void;
}

export const PersonasView: React.FC<PersonasViewProps> = ({
  personas,
  onAddPersona,
  onEditPersona,
  onDeletePersona,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const totalCampaignsLinked = personas.reduce((acc, p) => acc + p.activeCampaignsCount, 0);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormCompany('');
    setFormDescription('');
    setFormUrl('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Persona) => {
    setEditingPersona(p);
    setFormName(p.name);
    setFormCompany(p.companyName);
    setFormDescription(p.description);
    setFormUrl(p.websiteUrl);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    onAddPersona({
      name: formName,
      companyName: formCompany || formName,
      description: formDescription,
      websiteUrl: formUrl,
    });
    setShowAddModal(false);
    triggerToast('New persona created and ready for campaigns.');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPersona) return;

    onEditPersona(editingPersona.id, {
      name: formName,
      companyName: formCompany,
      description: formDescription,
      websiteUrl: formUrl,
    });
    setEditingPersona(null);
    triggerToast('Persona updated.');
  };

  return (
    <div id="dashboard-personas-view" className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a2414] text-[#ffffff] px-4 py-2.5 rounded-[10px] text-[13px] border border-[#17b267]/30 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[#0a2414]">
            Personas & Product Identities
          </h1>
          <p className="text-[13.5px] text-[#607166]">
            One login, every product you're building. Run separate outreach voices from the same inbox pool.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13.5px] font-semibold tracking-tight transition-all self-start sm:self-auto flex items-center space-x-2"
        >
          <span>+ New persona</span>
        </button>
      </div>

      {/* Personas Metrics Strip - Flat white with 1px hairline borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="text-[12px] text-[#607166] font-medium mb-1">Active Personas</div>
          <div className="text-[24px] font-semibold text-[#0a2414]">{personas.length} Profiles</div>
          <div className="text-[11.5px] text-[#17b267] mt-1 font-medium">Distinct brand voices configured</div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="text-[12px] text-[#607166] font-medium mb-1">Assigned Campaigns</div>
          <div className="text-[24px] font-semibold text-[#0a2414]">{totalCampaignsLinked} Connected</div>
          <div className="text-[11.5px] text-[#607166] mt-1">Autonomous draft generation active</div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="text-[12px] text-[#607166] font-medium mb-1">AI Voice Grounding</div>
          <div className="text-[24px] font-semibold text-[#17b267]">Peer-to-Peer</div>
          <div className="text-[11.5px] text-[#607166] mt-1">100% verified trigger citation</div>
        </div>
      </div>

      {/* Grid of Personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personas.map((persona) => {
          const initials = persona.companyName
            ? persona.companyName.substring(0, 2).toUpperCase()
            : persona.name.substring(0, 2).toUpperCase();

          return (
            <div
              key={persona.id}
              className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 flex flex-col justify-between space-y-4 hover:border-[#17b267]/40 transition-all group"
            >
              <div className="space-y-3.5">
                {/* Persona Header with Avatar */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-[10px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#0a2414] font-bold text-[14px] flex items-center justify-center tracking-tight">
                      {initials}
                    </div>

                    <div>
                      <h3 className="text-[16px] font-semibold text-[#0a2414] leading-tight">
                        {persona.name}
                      </h3>
                      <span className="text-[12.5px] text-[#607166] font-medium">
                        {persona.companyName}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-[6px] bg-[#fafaf9] border border-[#0a2414]/10 text-[12px] text-[#0a2414] font-medium">
                    {persona.activeCampaignsCount} {persona.activeCampaignsCount === 1 ? 'campaign' : 'campaigns'}
                  </span>
                </div>

                {/* Value Proposition description */}
                <div className="bg-[#fafaf9] p-4 rounded-[10px] border border-[#0a2414]/6">
                  <div className="text-[11px] uppercase tracking-wider text-[#607166] font-semibold mb-1">
                    Value Proposition & Angle
                  </div>
                  <p className="text-[13px] text-[#283a2e] leading-relaxed">
                    {persona.description}
                  </p>
                </div>

                {/* Website Link */}
                {persona.websiteUrl && (
                  <div className="flex items-center justify-between text-[12.5px]">
                    <a
                      href={persona.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[#17b267] hover:underline font-medium"
                    >
                      <span>{persona.websiteUrl}</span>
                      <span>↗</span>
                    </a>

                    <span className="text-[11.5px] text-[#607166]">
                      Synced to sender signature
                    </span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#0a2414]/6">
                <span className="text-[12px] text-[#607166] font-medium">
                  Identifies sender profile in AI drafting
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(persona)}
                    className="px-3.5 py-2 text-[12.5px] rounded-[10px] border border-[#0a2414]/12 bg-white hover:bg-[#fafaf9] text-[#0a2414] font-medium transition-colors"
                  >
                    Edit
                  </button>

                  {persona.activeCampaignsCount === 0 && (
                    <button
                      onClick={() => {
                        onDeletePersona(persona.id);
                        triggerToast('Persona deleted.');
                      }}
                      className="px-3.5 py-2 text-[12.5px] rounded-[10px] border border-[#0a2414]/12 hover:bg-[#ffbac3]/20 hover:text-[#360003] text-[#607166] font-medium transition-colors"
                      title="Delete persona"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {(showAddModal || editingPersona) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#ffffff] rounded-[10px] p-6 sm:p-8 border border-[#0a2414]/10 space-y-5">
            <div>
              <h2 className="text-[20px] font-semibold text-[#0a2414]">
                {editingPersona ? 'Edit Persona' : 'Create Product Persona'}
              </h2>
              <p className="text-[13px] text-[#607166]">
                This gives clerk the context it needs to write natural, value-focused emails that cite real triggers.
              </p>
            </div>

            <form
              onSubmit={editingPersona ? handleSaveEdit : handleSaveAdd}
              className="space-y-4"
            >
              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Persona Title
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. clerk Outbound Engine"
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. clerk Systems Inc."
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Value Proposition & Angle (1-2 sentences)
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Autonomous sales tool that monitors buying signals across the web and writes peer-to-peer drafts."
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Website / Landing Page Link
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#0a2414]/8">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPersona(null);
                  }}
                  className="px-4 py-2 text-[13.5px] text-[#607166] hover:text-[#0a2414]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13.5px] font-semibold transition-all"
                >
                  {editingPersona ? 'Save Changes' : 'Create Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
