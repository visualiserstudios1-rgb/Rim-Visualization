// src/pages/TermsPage.js

import { NavBar, DropdownMenu, SearchBar } from '../components/NavBar';
import { IconMail } from '../components/icons';
import { buildMenuItems, buildSearchTargets } from './ThreeDPage';

const SECTIONS = [
  { title: '1. Overview', content: `RimViz ("we", "us", "our") is an online visualisation service that creates digital images showing how selected rims will appear on a customer's vehicle. By submitting an order and completing payment, you agree to be bound by these Terms and Conditions. These terms apply to all customers worldwide.` },
  { title: '2. The Service', content: `RimViz provides a digital rim visualisation service. Upon receiving your payment, uploaded images, and rim specifications, our team will produce a professionally edited visualisation image showing your chosen rims fitted to your vehicle. The visualisation is a digital representation intended to give you a realistic preview — it is not a guarantee of exact appearance once physical rims are installed, as lighting, camera angle, and vehicle condition may affect the final look.` },
  { title: '3. Pricing', content: `The current price for one visualisation is R49.99 (South African Rand) or the equivalent in your local currency. Pricing is subject to change at any time. Orders are charged at the price displayed at the time of submission. All payments are processed securely through PayFast.` },
  { title: '4. Turnaround Time', content: `We aim to deliver your completed visualisation within 24 to 48 hours of receiving your payment and uploaded images. Delivery times may vary during high demand periods. Your visualisation will be sent to the email address provided at checkout. RimViz is not liable for delays caused by incorrect email addresses provided by the customer.` },
  { title: '5. Refund Policy', content: `All payments are non-refundable once your order has been submitted and payment has been processed. This is because work begins on your visualisation immediately after payment is confirmed. If you are not satisfied with your visualisation, we will redo it for free — one revision is included with every order at no additional cost. To request a revision, reply to your confirmation email with details of what you would like changed.` },
  { title: '6. Revisions', content: `Every order includes one free revision. If you are unhappy with the result, contact us at visualiserstudios1@gmail.com within 7 days of receiving your visualisation. Please describe clearly what changes you require. We will deliver the revised visualisation within 48 hours. Additional revisions beyond the first may be subject to a fee at our discretion.` },
  { title: '7. Image Requirements', content: `You are responsible for uploading clear, well-lit images of your vehicle and the rim you wish to visualise. Images must be in JPG or PNG format and must not exceed 35MB. RimViz reserves the right to request replacement images if the quality is insufficient to produce a professional result. We will contact you by email if this is the case.` },
  { title: '8. Intellectual Property', content: `The completed visualisation image produced by RimViz is for your personal use only. You may share it on personal social media accounts. You may not resell, redistribute, or use the visualisation for commercial purposes without written permission from RimViz. RimViz retains the right to use completed visualisations as portfolio examples and marketing material unless you request otherwise in writing.` },
  { title: '9. Privacy', content: `We collect your name, email address, phone number, and uploaded images solely for the purpose of fulfilling your order. Your personal information will not be sold or shared with third parties. Uploaded images are stored securely and automatically deleted after 15 days. Payments are processed by PayFast and we do not store any card or banking details.` },
  { title: '10. Limitation of Liability', content: `RimViz provides a digital visualisation service only. We are not liable for any purchasing decisions made based on the visualisation. The visualisation is a preview tool and does not constitute professional automotive advice. Our total liability in any circumstance shall not exceed the amount paid for the order in question.` },
  { title: '11. Changes to These Terms', content: `RimViz reserves the right to update these Terms and Conditions at any time. Changes will be posted on this page with an updated date. Continued use of the service after changes are posted constitutes acceptance of the new terms.` },
  { title: '12. Contact', content: `For any questions regarding these Terms and Conditions, please contact us at visualiserstudios1@gmail.com. We aim to respond within 24 hours.` },
];

export function TermsPage({ isMobile, isTablet, setPage, menuOpen, setMenuOpen, searchOpen, setSearchOpen, searchText, setSearchText, scrollTo, handleStartNow }) {
  const sectionPadding = isMobile ? '40px 16px' : isTablet ? '60px 32px' : '80px 24px';

  const onSelect      = (target) => { target.action(); setSearchOpen(false); setSearchText(''); };
  const menuItems     = buildMenuItems({ setPage, setMenuOpen, handleStartNow, scrollTo });
  const searchTargets = buildSearchTargets({ setPage, setMenuOpen, handleStartNow, scrollTo });

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
      {searchOpen && <SearchBar searchText={searchText} setSearchText={setSearchText} searchTargets={searchTargets} onSelect={onSelect} onClose={() => { setSearchOpen(false); setSearchText(''); }} />}
      <NavBar isMobile={isMobile} onHome={() => { setPage('home'); setMenuOpen(false); }} onSearch={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} onMenu={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }} />
      {menuOpen && <DropdownMenu isMobile={isMobile} items={menuItems} />}
      {(menuOpen || searchOpen) && <div onClick={() => { setMenuOpen(false); setSearchOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }} />}

      <div style={{ paddingTop: '52px' }}>
        <div style={{ backgroundColor: 'black', textAlign: 'center', padding: isMobile ? '48px 20px 36px' : '80px 40px 60px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 14px' }}>Legal</p>
          <h1 style={{ fontSize: isMobile ? '32px' : '56px', fontWeight: '300', color: 'white', margin: 0, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Terms &amp; <span style={{ fontWeight: '700' }}>Conditions</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '16px auto 0', fontWeight: '300' }}>Last updated: May 2025</p>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto', padding: sectionPadding }}>
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px 24px', marginBottom: '40px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, margin: 0 }}>
              Please read these Terms and Conditions carefully before using RimViz. By placing an order you confirm that you have read, understood, and agree to these terms.
            </p>
          </div>

          {SECTIONS.map((s, i) => (
            <div key={i} style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: i < SECTIONS.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <h2 style={{ fontSize: isMobile ? '17px' : '19px', fontWeight: '700', color: '#1d1d1f', marginBottom: '12px' }}>{s.title}</h2>
              <p style={{ fontSize: isMobile ? '15px' : '16px', color: '#4b5563', lineHeight: 1.8, margin: 0, fontWeight: '300' }}>{s.content}</p>
            </div>
          ))}

          <div style={{ backgroundColor: 'black', borderRadius: '16px', padding: '32px', textAlign: 'center', marginTop: '16px' }}>
            <p style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Questions about our terms?</p>
            <p style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '300', marginBottom: '16px' }}>We are happy to clarify anything.</p>
            <a href="mailto:visualiserstudios1@gmail.com" style={{ color: 'white', fontSize: '15px', fontWeight: '600', textDecoration: 'none', backgroundColor: '#1d1d1f', padding: '12px 28px', borderRadius: '9999px', border: '1px solid #ffffff33', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <IconMail size={15} color="white" />
              visualiserstudios1@gmail.com
            </a>
          </div>
        </div>

        <footer style={{ backgroundColor: 'black', color: 'white', padding: isMobile ? '32px 16px' : '48px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>Home</button>
              <a href="mailto:visualiserstudios1@gmail.com" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Contact</a>
            </div>
            <p style={{ color: '#6b7280', fontSize: isMobile ? '13px' : '14px' }}>Copyright © 2025 RimViz. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
