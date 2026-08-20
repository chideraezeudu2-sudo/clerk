import React from 'react';
import { ViewMode } from '../types';

interface LegalPageProps {
  mode: 'terms' | 'privacy';
  onNavigate: (view: ViewMode) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ mode, onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0a2414] py-12 px-4 sm:px-6">
      <div className="max-w-[760px] mx-auto">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center text-[14px] text-[#607166] hover:text-[#0a2414] mb-8 font-medium transition-colors"
        >
          Back to Klerk
        </button>

        {mode === 'terms' ? (
          <article className="space-y-6">
            <header className="border-b border-[#0a2414]/10 pb-6">
              <span className="text-[12px] uppercase text-[#607166] block mb-1">Legal Agreement</span>
              <h1 className="text-[36px] font-medium tracking-tight text-[#0a2414]">Terms of Service</h1>
              <p className="text-[13px] text-[#607166] mt-1">Last updated: August 19, 2026</p>
            </header>

            <div className="space-y-6 text-[15px] leading-relaxed text-[#283a2e]">
              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">1. Who this is for</h2>
                <p>
                  Klerk is a tool for finding and contacting business leads by email using verified web intent signals. By using it, you agree to these terms.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">2. Your account</h2>
                <p>
                  You need an account to use Klerk. You're responsible for keeping your login secure and for anything that happens under your account.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">3. Connecting your email</h2>
                <p>
                  Klerk sends email through mailboxes you connect using your own credentials and application passwords. You're responsible for making sure you have the right to send from any account you connect, and for following the sending limits and rules of your email provider.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">4. Acceptable use</h2>
                <p>You agree not to use Klerk to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Send unsolicited email in violation of CAN-SPAM, GDPR, or any other applicable law.</li>
                  <li>Contact people who have opted out or asked not to be contacted.</li>
                  <li>Impersonate another person or company.</li>
                  <li>Send anything illegal, deceptive, or harmful.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">5. Content you send</h2>
                <p>
                  You're responsible for the content of every email Klerk sends on your behalf, including AI-drafted emails you approve. Reviewing a draft before it sends means you're accepting responsibility for what it says.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">6. No guarantee of results</h2>
                <p>
                  Klerk helps you find and contact leads based on real web signals. It does not guarantee replies, meetings, or sales.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">7. Changes to the service</h2>
                <p>
                  This tool may change, and features may be added or removed, without advance notice.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">8. Termination</h2>
                <p>
                  Either party can end this agreement at any time. If your account is terminated, your data may be deleted.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">9. Limitation of liability</h2>
                <p>
                  Klerk is provided as-is. To the fullest extent allowed by law, Klerk and its operator are not liable for indirect, incidental, or consequential damages arising from its use.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">10. Contact</h2>
                <p>
                  Questions about these terms: legal@Klerk.so
                </p>
              </section>
            </div>
          </article>
        ) : (
          <article className="space-y-6">
            <header className="border-b border-[#0a2414]/10 pb-6">
              <span className="text-[12px] uppercase text-[#607166] block mb-1">Data Privacy</span>
              <h1 className="text-[36px] font-medium tracking-tight text-[#0a2414]">Privacy Policy</h1>
              <p className="text-[13px] text-[#607166] mt-1">Last updated: August 19, 2026</p>
            </header>

            <div className="space-y-6 text-[15px] leading-relaxed text-[#283a2e]">
              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">1. What this covers</h2>
                <p>
                  This policy explains what information Klerk collects and how it's used.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">2. What we collect</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Account information:</strong> your name, email, and login details.</li>
                  <li><strong>Email credentials:</strong> app passwords for mailboxes you connect, stored encrypted.</li>
                  <li><strong>Contact and company data:</strong> information about the people and companies Klerk finds and helps you contact.</li>
                  <li><strong>Email content:</strong> drafts, sent emails, and replies processed to run outreach and track engagement.</li>
                  <li><strong>Usage data:</strong> how you use the app, for improving it and fixing bugs.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">3. How we use it</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>To run the core features: finding signals, drafting emails, sending and tracking outreach.</li>
                  <li>To improve the product.</li>
                  <li>To communicate with you about your account.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">4. What we don't do</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>We don't sell your data.</li>
                  <li>We don't read your email for any purpose other than running the features you're using.</li>
                  <li>We don't share your contact lists with anyone else.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">5. Third-party services</h2>
                <p>
                  Klerk uses outside services to operate, including AI providers for drafting and analysis, and infrastructure providers for hosting and storage. These providers only receive the data needed to perform their specific function.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">6. Data retention</h2>
                <p>
                  Your data is kept as long as your account is active. You can request deletion of your account and associated data at any time.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">7. Security</h2>
                <p>
                  Email credentials and other sensitive data are encrypted at rest. Access is restricted to your own account.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[18px] font-medium text-[#0a2414]">8. Your rights</h2>
                <p>
                  You can access, correct, or delete your data at any time by contacting privacy@Klerk.so.
                </p>
              </section>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export const TermsPage: React.FC<{ onNavigate: (view: ViewMode) => void }> = ({ onNavigate }) => (
  <LegalPage mode="terms" onNavigate={onNavigate} />
);

export const PrivacyPage: React.FC<{ onNavigate: (view: ViewMode) => void }> = ({ onNavigate }) => (
  <LegalPage mode="privacy" onNavigate={onNavigate} />
);
