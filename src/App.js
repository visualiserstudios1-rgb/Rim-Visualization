import { useState } from 'react';
import emailjs from '@emailjs/browser';

const CLOUDINARY_CLOUD_NAME = 'dfyjxhjce';
const CLOUDINARY_UPLOAD_PRESET = 'rimviz_uploads';

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return data.secure_url;
}

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', rimInch: '' });
  const [rimImage, setRimImage] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartNow = () => {
    setShowForm(true);
    setMenuOpen(false);
    setTimeout(() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.rimInch || !rimImage || !vehicleImage) {
      alert('Please fill in all fields and upload both images!');
      return;
    }

    setSending(true);

    try {
      // Step 1: Upload images to Cloudinary
      setUploadStatus('Uploading rim image...');
      const rimImageUrl = await uploadToCloudinary(rimImage);

      setUploadStatus('Uploading car image...');
      const vehicleImageUrl = await uploadToCloudinary(vehicleImage);

      // Step 2: Send email with image URLs via EmailJS
      setUploadStatus('Sending email...');
      await emailjs.send(
        'service_z8z8qq8',
        'template_961506z',
        {
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || 'Not provided',
          rim_size: formData.rimInch,
          reply_to: formData.email,
          rim_image_url: rimImageUrl,
          vehicle_image_url: vehicleImageUrl,
        },
        'UH9DnNx4ESCO_8-Kf'
      );

      setSubmitted(true);
    } catch (error) {
      alert('Something went wrong: ' + error.message);
      console.error(error);
    } finally {
      setSending(false);
      setUploadStatus('');
    }
  };

  const SearchBar = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      padding: '14px 24px',
      display: 'flex', alignItems: 'center', gap: '12px',
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        autoFocus
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search rimviz.com"
        style={{
          flex: 1, border: 'none', outline: 'none', fontSize: '17px',
          background: 'transparent', color: '#333',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
        }}
      />
      <button
        onClick={() => { setSearchOpen(false); setSearchText(''); }}
        style={{ background: 'none', border: 'none', fontSize: '15px', color: '#0071e3', cursor: 'pointer', fontFamily: 'inherit' }}>
        Cancel
      </button>
    </div>
  );

  const DropdownMenu = () => (
    <div style={{
      position: 'fixed', top: '52px', left: 0, right: 0, zIndex: 150,
      backgroundColor: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      padding: '8px 0 16px 0'
    }}>
      {[
        { label: 'Home',             action: () => { setPage('home'); setMenuOpen(false); } },
        { label: 'Get Started',      action: handleStartNow },
        { label: '3D Visualization', action: () => { setPage('3d'); setMenuOpen(false); } },
        { label: 'Gallery',          action: () => { setPage('home'); scrollTo('gallery'); } },
        { label: 'About',            action: () => { setPage('home'); scrollTo('about'); } },
        { label: 'Support',          action: () => { setPage('home'); scrollTo('support'); } },
      ].map((item, i) => (
        <button
          key={i}
          onClick={item.action}
          style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '13px 24px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '17px', color: '#1d1d1f',
            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            borderBottom: i < 5 ? '1px solid #f0f0f0' : 'none',
          }}
          onMouseEnter={e => e.target.style.background = '#f5f5f7'}
          onMouseLeave={e => e.target.style.background = 'none'}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  const NavBar = () => (
    <nav style={{
      position: 'fixed', width: '100%', zIndex: 100, top: 0,
      backgroundColor: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #d2d2d7',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 24px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div
          onClick={() => { setPage('home'); setMenuOpen(false); }}
          style={{ fontSize: '22px', fontWeight: '300', color: '#1d1d1f', cursor: 'pointer', letterSpacing: '-0.5px' }}>
          RimViz
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button
            onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ display: 'block', width: '18px', height: '1.5px', backgroundColor: '#1d1d1f', borderRadius: '2px' }}/>
            <span style={{ display: 'block', width: '18px', height: '1.5px', backgroundColor: '#1d1d1f', borderRadius: '2px' }}/>
          </button>
        </div>
      </div>
    </nav>
  );

  if (page === '3d') {
    return (
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
        {searchOpen && <SearchBar />}
        <NavBar />
        {menuOpen && <DropdownMenu />}
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '80px', marginBottom: '24px' }}>🔧</p>
          <h1 style={{ fontSize: '64px', fontWeight: '300', color: 'black', marginBottom: '16px', letterSpacing: '-2px' }}>
            Coming <span style={{ fontWeight: '700' }}>Soon</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', fontWeight: '300', maxWidth: '500px', lineHeight: 1.8, marginBottom: '40px' }}>
            We are working hard on our 3D Visualization feature. Stay tuned!
          </p>
          <button onClick={() => setPage('home')}
            style={{ padding: '14px 36px', borderRadius: '9999px', backgroundColor: 'black', color: 'white', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>

      {searchOpen && <SearchBar />}
      <NavBar />
      {menuOpen && <DropdownMenu />}

      {(menuOpen || searchOpen) && (
        <div onClick={() => { setMenuOpen(false); setSearchOpen(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }} />
      )}

      {/* Hero */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80"
          alt="Premium car"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: '72px', fontWeight: '300', color: 'white', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-2px' }}>
            Visualize Your<br /><span style={{ fontWeight: '700' }}>Perfect Rims</span>
          </h1>
          <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.85)', marginBottom: '40px', fontWeight: '300', maxWidth: '600px' }}>
            See how premium rims transform your vehicle before you buy.
          </p>
          <button onClick={handleStartNow}
            style={{ padding: '14px 36px', borderRadius: '9999px', backgroundColor: 'white', color: 'black', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
            Start Now
          </button>
        </div>
      </section>

      {/* Form */}
      {showForm && (
        <section id="order" style={{ padding: '80px 24px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '300', color: 'black', marginBottom: '16px', textAlign: 'center' }}>Get Your Visualization</h2>
            <p style={{ fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>Fill in your details and upload your images!</p>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: '24px', color: '#16a34a', fontWeight: '600' }}>✅ Request Sent!</p>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>We received your request! We will contact you at <strong>{formData.email}</strong> shortly!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Full Name *</label>
                  <input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email Address *</label>
                  <input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Phone Number (Optional)</label>
                  <input type="tel" placeholder="+27 123 456 789" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Desired Rim Size *</label>
                  <select value={formData.rimInch} onChange={(e) => setFormData({ ...formData, rimInch: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">Select rim size</option>
                    <option value="17">17 inches</option>
                    <option value="18">18 inches</option>
                    <option value="19">19 inches</option>
                    <option value="20">20 inches</option>
                    <option value="21">21 inches</option>
                    <option value="22">22 inches</option>
                    <option value="23">23 inches</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Upload Rim Image *</label>
                  <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={(e) => setRimImage(e.target.files[0])}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box' }} />
                  {rimImage && <p style={{ color: '#16a34a', fontSize: '14px', marginTop: '4px' }}>✅ {rimImage.name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Upload Your Car Image *</label>
                  <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={(e) => setVehicleImage(e.target.files[0])}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box' }} />
                  {vehicleImage && <p style={{ color: '#16a34a', fontSize: '14px', marginTop: '4px' }}>✅ {vehicleImage.name}</p>}
                </div>

                {/* Upload progress status */}
                {sending && uploadStatus && (
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <p style={{ color: '#0284c7', fontSize: '14px', margin: 0 }}>⏳ {uploadStatus}</p>
                  </div>
                )}

                <button type="submit" disabled={sending}
                  style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: sending ? '#666' : 'black', color: 'white', fontSize: '16px', fontWeight: '600', border: 'none', cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? '⏳ Processing...' : 'Submit for Visualization'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Gallery */}
      <section id="gallery" style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '300', color: 'black', marginBottom: '64px', textAlign: 'center' }}>Showcase Gallery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80" alt="Black rims" style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
            <img src="https://images.unsplash.com/photo-1555353540-64580b51c258?w=600&q=80" alt="Silver rims" style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
            <img src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&q=80" alt="Chrome rims" style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
            <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80" alt="Performance wheels" style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ padding: '80px 24px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '300', color: 'black', marginBottom: '32px' }}>About RimViz</h2>
          <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: '300', lineHeight: 1.8 }}>
            At RimViz, we take the guesswork out of buying rims. Simply upload a photo of your vehicle and the rims you love, and our team will create a professional visualization showing exactly how they'll look on your car — before you spend a single cent.
          </p>
        </div>
      </section>

      {/* Support */}
      <section id="support" style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '300', color: 'black', marginBottom: '32px' }}>Support</h2>
          <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: '300', lineHeight: 1.8 }}>
            Have questions? We are here to help you every step of the way.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'black', color: 'white', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af' }}>© 2025 RimViz. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}