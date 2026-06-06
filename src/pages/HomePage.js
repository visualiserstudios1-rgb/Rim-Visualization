// src/pages/HomePage.js

import { useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import { NavBar, DropdownMenu, SearchBar } from '../components/NavBar';
import { SkeletonImage } from '../components/SkeletonImage';
import { IconAlert, IconCheck, IconLoader, IconLock, IconMail } from '../components/icons';
import { uploadToCloudinary, validateForm } from '../utils/cloudinary';
import { buildMenuItems, buildSearchTargets } from './ThreeDPage';

export function HomePage({ isMobile, isTablet, page, setPage, menuOpen, setMenuOpen, searchOpen, setSearchOpen, searchText, setSearchText, showForm, setShowForm, scrollTo, handleStartNow }) {
  const [formData, setFormData]         = useState({ name: '', email: '', phone: '', rimInch: '' });
  const [rimImage, setRimImage]         = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null);
  const [sending, setSending]           = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [formError, setFormError]       = useState('');

  const heroFontSize       = isMobile ? '36px'      : isTablet ? '52px'      : '72px';
  const heroSubFontSize    = isMobile ? '15px'      : isTablet ? '18px'      : '22px';
  const headingFontSize    = isMobile ? '28px'      : isTablet ? '38px'      : '48px';
  const bodyFontSize       = isMobile ? '15px'      : isTablet ? '16px'      : '18px';
  const sectionPadding     = isMobile ? '40px 16px' : isTablet ? '60px 32px' : '80px 24px';
  const galleryColumns     = isMobile ? '1fr'       : 'repeat(2, 1fr)';
  const galleryImageHeight = isMobile ? '200px'     : isTablet ? '280px'     : '400px';
  const galleryGap         = isMobile ? '16px'      : isTablet ? '20px'      : '32px';

  // Form abandonment tracking
  useEffect(() => {
    if (!showForm) return;
    const handleLeave = () => {
      if (!sending) ReactGA.event({ category: 'Purchase', action: 'form_abandoned' });
    };
    window.addEventListener('beforeunload', handleLeave);
    return () => window.removeEventListener('beforeunload', handleLeave);
  }, [showForm, sending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (rimImage && !allowedTypes.includes(rimImage.type)) { setFormError('Rim image must be a JPG or PNG file.'); return; }
    if (vehicleImage && !allowedTypes.includes(vehicleImage.type)) { setFormError('Car image must be a JPG or PNG file.'); return; }
    if (rimImage && rimImage.size > 35 * 1024 * 1024) { setFormError('Rim image must be under 35MB.'); return; }
    if (vehicleImage && vehicleImage.size > 35 * 1024 * 1024) { setFormError('Car image must be under 35MB.'); return; }

    const validationError = validateForm({ ...formData, rimImage, vehicleImage });
    if (validationError) { setFormError(validationError); return; }

    ReactGA.event({ category: 'Purchase', action: 'payment_attempted' });
    setSending(true);
    try {
      setUploadStatus('Uploading rim image...');
      const rimImageUrl = await uploadToCloudinary(rimImage);
      setUploadStatus('Uploading car image...');
      const vehicleImageUrl = await uploadToCloudinary(vehicleImage);
      setUploadStatus('Preparing payment...');

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim(), rimSize: formData.rimInch, rimImageUrl, vehicleImageUrl }),
      });

      const result = await response.json();
      if (!response.ok) { setFormError(result.error || 'Something went wrong. Please try again.'); return; }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = result.payfastUrl;
      Object.entries(result.payfastData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = key; input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();

    } catch { setFormError('Something went wrong. Please check your connection and try again.'); }
    finally { setSending(false); setUploadStatus(''); }
  };

  const onSelect      = (target) => { target.action(); setSearchOpen(false); setSearchText(''); };
  const menuItems     = buildMenuItems({ setPage, setMenuOpen, handleStartNow, scrollTo });
  const searchTargets = buildSearchTargets({ setPage, setMenuOpen, handleStartNow, scrollTo });

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
      {searchOpen && <SearchBar searchText={searchText} setSearchText={setSearchText} searchTargets={searchTargets} onSelect={onSelect} onClose={() => { setSearchOpen(false); setSearchText(''); }} />}
      <NavBar isMobile={isMobile} onHome={() => { setPage('home'); setMenuOpen(false); }} onSearch={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} onMenu={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }} />
      {menuOpen && <DropdownMenu isMobile={isMobile} items={menuItems} />}
      {(menuOpen || searchOpen) && <div onClick={() => { setMenuOpen(false); setSearchOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }} />}

      {/* Hero */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <SkeletonImage src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80" alt="Premium car" dark={true} style={{ width: '100%', height: '100vh', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isMobile ? '0 20px' : '0 40px' }}>
          <h1 style={{ fontSize: heroFontSize, fontWeight: '300', color: 'white', marginBottom: '16px', lineHeight: 1.15, letterSpacing: isMobile ? '-0.5px' : '-2px' }}>
            Visualize Your<br /><span style={{ fontWeight: '700' }}>Perfect Rims</span>
          </h1>
          <p style={{ fontSize: heroSubFontSize, color: 'rgba(255,255,255,0.85)', marginBottom: '36px', fontWeight: '300', maxWidth: '600px', lineHeight: 1.6 }}>See how premium rims transform your vehicle before you buy.</p>
          <button onClick={handleStartNow} style={{ padding: isMobile ? '12px 28px' : '14px 36px', borderRadius: '9999px', backgroundColor: 'white', color: 'black', fontSize: isMobile ? '15px' : '16px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Start Now</button>
        </div>
      </section>

      {/* Order Form */}
      {showForm && (
        <section id="order" style={{ padding: sectionPadding, backgroundColor: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: headingFontSize, fontWeight: '300', color: 'black', marginBottom: '16px', textAlign: 'center' }}>Get Your Visualization</h2>
            <p style={{ fontSize: bodyFontSize, color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>Fill in your details and upload your images.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {formError && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconAlert size={15} color="#dc2626" />
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{formError}</p>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Full Name *</label>
                <input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} maxLength={100}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email Address *</label>
                <input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} maxLength={200}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Phone Number (Optional)</label>
                <input type="tel" placeholder="+27 123 456 789" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} maxLength={20}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Desired Rim Size *</label>
                <select value={formData.rimInch} onChange={(e) => setFormData({ ...formData, rimInch: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select rim size</option>
                  {['17','18','19','20','21','22','23'].map(s => <option key={s} value={s}>{s} inches</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Upload Rim Image *</label>
                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => setRimImage(e.target.files[0])}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box' }} />
                {rimImage && <p style={{ color: '#16a34a', fontSize: '14px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><IconCheck size={14} color="#16a34a" /> {rimImage.name}</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Upload Your Car Image *</label>
                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => setVehicleImage(e.target.files[0])}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box' }} />
                {vehicleImage && <p style={{ color: '#16a34a', fontSize: '14px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><IconCheck size={14} color="#16a34a" /> {vehicleImage.name}</p>}
              </div>
              {sending && uploadStatus && (
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <IconLoader size={15} color="#0284c7" />
                  <p style={{ color: '#0284c7', fontSize: '14px', margin: 0 }}>{uploadStatus}</p>
                </div>
              )}
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Total amount due</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: 'black', margin: 0 }}>R49.99</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Secure payment via PayFast — Card &amp; EFT accepted</p>
              </div>
              <button type="submit" disabled={sending}
                style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: sending ? '#666' : 'black', color: 'white', fontSize: '16px', fontWeight: '600', border: 'none', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconLock size={15} color="white" />
                {sending ? 'Processing...' : 'Pay R49.99 & Submit'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Gallery */}
      <section id="gallery" style={{ padding: sectionPadding, backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: headingFontSize, fontWeight: '300', color: 'black', marginBottom: isMobile ? '24px' : '48px', textAlign: 'center' }}>Showcase Gallery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: galleryColumns, gap: galleryGap }}>
            {[
              { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80', alt: 'Black rims' },
              { src: 'https://i.imgur.com/f2jT8fm.png', alt: 'Silver rims' },
              { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&q=80', alt: 'Chrome rims' },
              { src: 'https://i.imgur.com/uqinPfy.png', alt: 'Performance wheels' },
            ].map((img, i) => (
              <SkeletonImage key={i} src={img.src} alt={img.alt}
                style={{ width: '100%', height: galleryImageHeight, objectFit: 'cover', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'block' }} />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ padding: sectionPadding, backgroundColor: 'white' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: headingFontSize, fontWeight: '300', color: 'black', marginBottom: '24px' }}>About Rim Visualizer</h2>
          <p style={{ fontSize: bodyFontSize, color: '#6b7280', fontWeight: '300', lineHeight: 1.8 }}>Rim Visualizer is a South African visualisation company pioneering a new standard in automotive customisation. We give drivers the power to see their dream rims on their vehicle before committing to a purchase — eliminating guesswork and inspiring confidence.</p>
          <p style={{ fontSize: bodyFontSize, color: '#6b7280', fontWeight: '300', lineHeight: 1.8, marginTop: '16px' }}>Simple process. Professional results. Complete clarity.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '48px', flexWrap: 'wrap' }}>
            {[{ value: '2h', label: 'Turnaround Time' }, { value: '99.9%', label: 'Satisfaction Focus' }, { value: 'SA ', label: 'Worldwide Service' }].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: '700', color: 'black', margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400', marginTop: '4px' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section id="support" style={{ padding: sectionPadding, backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: headingFontSize, fontWeight: '300', color: 'black', marginBottom: '24px' }}>Support</h2>
          <p style={{ fontSize: bodyFontSize, color: '#6b7280', fontWeight: '300', lineHeight: 1.8, marginBottom: '40px' }}>Have questions? We are here to help you every step of the way.</p>
          {[
            { q: 'How does Rim-Visualizer work?', a: 'Simply fill in your details, upload a photo of your rim and your vehicle, and submit. Our team will create a professional visualisation showing exactly how your chosen rims will look on your car.' },
            { q: 'How long does a visualisation take?', a: 'Most visualisations are delivered within 24 to 48 hours. We will contact you directly at the email address you provided.' },
            { q: 'What image formats are accepted?', a: 'We accept JPG and PNG images only. Make sure your photos are clear and well lit for the best results.' },
            { q: 'What rim sizes do you support?', a: 'We currently support rim sizes from 17 to 23 inches.' },
            { q: 'Is there a cost for the visualisation?', a: 'Our visualisation service is priced at R49.99 per request.' },
            { q: 'How do I contact Rim-Visualizer?', a: 'You can reach us at visualiserstudios1@gmail.com. We typically respond within 24 hours.' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: '12px', textAlign: 'left', backgroundColor: 'white', borderRadius: '12px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: bodyFontSize, fontWeight: '600', color: '#1d1d1f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: 'black', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                {item.q}
              </p>
              <p style={{ fontSize: bodyFontSize, color: '#6b7280', fontWeight: '300', lineHeight: 1.8, margin: 0, paddingLeft: '34px' }}>{item.a}</p>
            </div>
          ))}
          <div style={{ marginTop: '40px', backgroundColor: 'black', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: bodyFontSize, fontWeight: '600', marginBottom: '8px' }}>Still have questions?</p>
            <p style={{ color: '#9ca3af', fontSize: bodyFontSize, fontWeight: '300', marginBottom: '16px' }}>We would love to hear from you.</p>
            <a href="mailto:visualiserstudios1@gmail.com" style={{ color: 'white', fontSize: bodyFontSize, fontWeight: '600', textDecoration: 'none', backgroundColor: '#1d1d1f', padding: '12px 28px', borderRadius: '9999px', border: '1px solid #ffffff33', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <IconMail size={16} color="white" />
              visualiserstudios1@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'black', color: 'white', padding: isMobile ? '32px 16px' : '48px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => { setPage('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: isMobile ? '13px' : '14px', cursor: 'pointer', textDecoration: 'underline' }}>
              Terms &amp; Conditions
            </button>
            <button onClick={() => { setPage('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: isMobile ? '13px' : '14px', cursor: 'pointer', textDecoration: 'underline' }}>
              Privacy Policy
            </button>
            <a href="mailto:visualiserstudios1@gmail.com" style={{ color: '#9ca3af', fontSize: isMobile ? '13px' : '14px', textDecoration: 'underline' }}>Contact</a>
          </div>
          <p style={{ color: '#6b7280', fontSize: isMobile ? '13px' : '14px' }}>Copyright © 2025 Rim-Visualizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
