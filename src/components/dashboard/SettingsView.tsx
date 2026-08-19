import React, { useState } from 'react';
import { UserSettings } from '../../types';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (updated: Partial<UserSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formSettings, setFormSettings] = useState<UserSettings>(settings);
  const [hasSaved, setHasSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [apiSnippetLang, setApiSnippetLang] = useState<'curl' | 'node' | 'python'>('curl');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formSettings);
    setHasSaved(true);
    triggerToast('Compliance disclosures and sending rules saved.');
    setTimeout(() => setHasSaved(false), 2000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(formSettings.apiKey);
    setCopiedKey(true);
    triggerToast('API Key copied to clipboard.');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateApiKey = () => {
    const newKey = `clerk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    setFormSettings({ ...formSettings, apiKey: newKey });
    onSaveSettings({ apiKey: newKey });
    setShowRegenModal(false);
    triggerToast('API key regenerated. Previous token invalidated.');
  };

  return (
    <div id="dashboard-settings-view" className="space-y-6 max-w-4xl">
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
            Settings & Compliance
          </h1>
          <p className="text-[13.5px] text-[#607166]">
            Configure your legal mailing disclosures, sending throttles, and developer API keys.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-[10px] bg-[#f3fbe9] border border-[#17b267]/30 text-[12.5px] font-semibold text-[#0a2414] self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
          <span>CAN-SPAM & GDPR Active</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Legal Mailing Address */}
        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#0a2414]/6 pb-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#0a2414]">
                Commercial Mailing Address
              </h2>
              <p className="text-[12.5px] text-[#607166]">
                Required by global anti-spam regulations (CAN-SPAM, GDPR, CASL) to prevent spam filtering
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-[6px] bg-[#f3fbe9] text-[#17b267] text-[11.5px] font-semibold border border-[#17b267]/30 self-start sm:self-auto">
              ✓ Validated Compliant
            </span>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#0a2414] mb-1.5">
              Physical address / Virtual office address
            </label>
            <textarea
              rows={2}
              required
              value={formSettings.mailingAddress}
              onChange={(e) =>
                setFormSettings({ ...formSettings, mailingAddress: e.target.value })
              }
              placeholder="e.g. clerk Systems Inc., 548 Market St, Suite 8201, San Francisco, CA 94104"
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#0a2414]/15 focus:border-[#17b267] text-[14px] text-[#0a2414] outline-none transition-colors"
            />
          </div>

          {/* Email Footer Preview */}
          <div className="p-4 bg-[#fafaf9] rounded-[10px] border border-[#0a2414]/8 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#607166] text-[11px] uppercase tracking-wider">
                Automated Outbound Footer Preview
              </span>
              <span className="text-[11.5px] text-[#17b267] font-semibold">Auto-injected into every email</span>
            </div>
            <div className="text-[12.5px] text-[#283a2e] bg-white p-3 rounded-[8px] border border-[#0a2414]/6">
              <p className="leading-relaxed">
                {formSettings.mailingAddress || 'Your company address'} •{' '}
                <span className="text-[#17b267] underline cursor-pointer font-medium">Unsubscribe instantly</span> •{' '}
                <span className="text-[#607166]">Powered by clerk native sender pool</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Sending Delivery Throttle & Cadence */}
        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 space-y-5">
          <div className="border-b border-[#0a2414]/6 pb-3">
            <h2 className="text-[16px] font-semibold text-[#0a2414]">
              Delivery Throttle & Sending Cadence
            </h2>
            <p className="text-[12.5px] text-[#607166]">
              Protect mailbox health by spreading outbound requests with humanized pauses and randomized intervals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#0a2414]">
                Default Delay Between Follow-ups (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={formSettings.defaultFollowUpDays}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    defaultFollowUpDays: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
              />
              <span className="text-[11.5px] text-[#607166] block">
                Standard B2B rhythm is 3–4 business days
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#0a2414]">
                Pool Max Daily Volume Cap
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={formSettings.dailyCapAcrossAll}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    dailyCapAcrossAll: parseInt(e.target.value) || 60,
                  })
                }
                className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
              />
              <span className="text-[11.5px] text-[#607166] block">
                Load balanced evenly across your connected mailboxes
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-[#0a2414]">
              Outreach Sending Timezone Window
            </label>
            <select
              value={formSettings.timezone}
              onChange={(e) =>
                setFormSettings({ ...formSettings, timezone: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none bg-white text-[#0a2414] focus:border-[#17b267]"
            >
              <option value="America/Los_Angeles">America/Los_Angeles (PT) — 8:00 AM - 5:00 PM</option>
              <option value="America/New_York">America/New_York (ET) — 8:00 AM - 5:00 PM</option>
              <option value="Europe/London">Europe/London (GMT) — 8:00 AM - 5:00 PM</option>
              <option value="Europe/Berlin">Europe/Berlin (CET) — 8:00 AM - 5:00 PM</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST) — 8:00 AM - 5:00 PM</option>
            </select>
            <span className="text-[11.5px] text-[#607166] block">
              Emails will only be sent between 8:00 AM and 5:00 PM on business weekdays.
            </span>
          </div>

          {/* Safety Safeguards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-[#fafaf9] rounded-[10px] border border-[#0a2414]/6 flex items-start space-x-2.5 text-[12.5px]">
              <span className="text-[#17b267] font-bold mt-0.5">✓</span>
              <div>
                <strong className="text-[#0a2414] block">Automatic Reply Detection</strong>
                <span className="text-[#607166]">Outreach halts instantly when a prospect responds.</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#fafaf9] rounded-[10px] border border-[#0a2414]/6 flex items-start space-x-2.5 text-[12.5px]">
              <span className="text-[#17b267] font-bold mt-0.5">✓</span>
              <div>
                <strong className="text-[#0a2414] block">Hard Bounce Safeguard</strong>
                <span className="text-[#607166]">Auto-pauses campaign if hard bounce rate exceeds 2%.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Developer API Keys & Trigger Webhooks */}
        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 space-y-5">
          <div className="border-b border-[#0a2414]/6 pb-3">
            <h2 className="text-[16px] font-semibold text-[#0a2414]">
              Developer API Keys & Trigger Webhooks
            </h2>
            <p className="text-[12.5px] text-[#607166]">
              Trigger clerk autonomous intent crawlers directly from Zapier, Make.com, or your internal CRM.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-[#0a2414]">
              Live Secret API Key
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={formSettings.apiKey}
                  className="w-full px-3.5 py-2 font-mono rounded-[10px] border border-[#0a2414]/15 bg-[#fafaf9] text-[13px] text-[#0a2414] outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#607166] hover:text-[#0a2414] font-medium"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyApiKey}
                className="px-4 py-2 rounded-[10px] border border-[#0a2414]/15 hover:bg-[#fafaf9] text-[#0a2414] text-[13px] font-medium transition-colors shrink-0"
              >
                {copiedKey ? '✓ Copied' : 'Copy Key'}
              </button>

              <button
                type="button"
                onClick={() => setShowRegenModal(true)}
                className="px-4 py-2 rounded-[10px] border border-[#0a2414]/15 hover:bg-[#ffbac3]/20 hover:text-[#360003] text-[#607166] text-[13px] font-medium transition-colors shrink-0"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Code Snippet Quickstart with tabs */}
          <div className="bg-[#0a2414] text-[#ffffff] rounded-[10px] overflow-hidden border border-[#0a2414]">
            <div className="px-4 py-2.5 bg-[#05140b] flex items-center justify-between border-b border-white/10 text-[12px]">
              <span className="font-semibold text-[#1ad379]">Quickstart API Integration</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setApiSnippetLang('curl')}
                  className={`px-2.5 py-0.5 rounded-[6px] transition-colors ${
                    apiSnippetLang === 'curl' ? 'bg-white/20 text-white font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  cURL
                </button>
                <button
                  type="button"
                  onClick={() => setApiSnippetLang('node')}
                  className={`px-2.5 py-0.5 rounded-[6px] transition-colors ${
                    apiSnippetLang === 'node' ? 'bg-white/20 text-white font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Node.js
                </button>
                <button
                  type="button"
                  onClick={() => setApiSnippetLang('python')}
                  className={`px-2.5 py-0.5 rounded-[6px] transition-colors ${
                    apiSnippetLang === 'python' ? 'bg-white/20 text-white font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            <div className="p-4 font-mono text-[12px] overflow-x-auto text-white/90 leading-relaxed">
              {apiSnippetLang === 'curl' && (
                <>
                  <div><span className="text-[#1ad379]">curl</span> -X POST https://api.clerk.so/v1/signals \</div>
                  <div className="pl-4 text-white/80">-H <span className="text-[#f9f6f1]">"Authorization: Bearer {formSettings.apiKey}"</span> \</div>
                  <div className="pl-4 text-white/80">-H <span className="text-[#f9f6f1]">"Content-Type: application/json"</span> \</div>
                  <div className="pl-4 text-white/80">-d <span className="text-[#ffbac3]">'{'{"campaign_id": "cmp_1", "target_domain": "stripe.com", "signal_type": "hiring"}'}'</span></div>
                </>
              )}

              {apiSnippetLang === 'node' && (
                <>
                  <div><span className="text-[#1ad379]">await</span> fetch(<span className="text-[#ffbac3]">'https://api.clerk.so/v1/signals'</span>, {'{'}</div>
                  <div className="pl-4">method: <span className="text-[#ffbac3]">'POST'</span>,</div>
                  <div className="pl-4">headers: {'{'}</div>
                  <div className="pl-8"><span className="text-[#ffbac3]">'Authorization'</span>: <span className="text-[#ffbac3]">'Bearer {formSettings.apiKey}'</span>,</div>
                  <div className="pl-8"><span className="text-[#ffbac3]">'Content-Type'</span>: <span className="text-[#ffbac3]">'application/json'</span>,</div>
                  <div className="pl-4">{'}'},</div>
                  <div className="pl-4">body: JSON.stringify({'{'} campaign_id: <span className="text-[#ffbac3]">'cmp_1'</span>, target_domain: <span className="text-[#ffbac3]">'stripe.com'</span> {'}'}),</div>
                  <div>{'}'});</div>
                </>
              )}

              {apiSnippetLang === 'python' && (
                <>
                  <div><span className="text-[#1ad379]">import</span> requests</div>
                  <div className="mt-1">response = requests.post(</div>
                  <div className="pl-4"><span className="text-[#ffbac3]">'https://api.clerk.so/v1/signals'</span>,</div>
                  <div className="pl-4">headers={'{'}<span className="text-[#ffbac3]">'Authorization'</span>: <span className="text-[#ffbac3]">'Bearer {formSettings.apiKey}'</span>{'}'},</div>
                  <div className="pl-4">json={'{'}<span className="text-[#ffbac3]">'campaign_id'</span>: <span className="text-[#ffbac3]">'cmp_1'</span>, <span className="text-[#ffbac3]">'target_domain'</span>: <span className="text-[#ffbac3]">'stripe.com'</span>{'}'}</div>
                  <div>)</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#0a2414]/10">
          <span className="text-[13px] text-[#607166]">
            {hasSaved ? '✓ All settings live and synced' : 'Changes apply immediately across connected inboxes'}
          </span>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-semibold tracking-tight transition-all flex items-center space-x-2"
          >
            <span>{hasSaved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* REGENERATE CONFIRM MODAL */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ffffff] rounded-[10px] p-6 border border-[#0a2414]/10 space-y-4">
            <h3 className="text-[18px] font-semibold text-[#0a2414]">Regenerate API Key?</h3>
            <p className="text-[14px] text-[#283a2e] leading-relaxed">
              Any current background webhooks or CRM integrations using this token will fail immediately until updated with the new token.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 text-[13.5px] font-medium text-[#607166]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateApiKey}
                className="px-4 py-2 rounded-[10px] bg-[#ffbac3] hover:bg-[#ffbac3]/80 text-[#360003] text-[13.5px] font-semibold"
              >
                Confirm & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
