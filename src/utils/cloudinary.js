// src/utils/cloudinary.js

const CLOUDINARY_CLOUD_NAME   = 'dfyjxhjce';
const CLOUDINARY_UPLOAD_PRESET = 'rimviz_uploads';

export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  const data = await res.json();
  return data.secure_url;
}

export function validateForm({ name, email, rimInch, rimImage, vehicleImage }) {
  if (!name || name.trim().length < 2) return 'Please enter your full name.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
  if (!rimInch) return 'Please select a rim size.';
  if (!rimImage) return 'Please upload a rim image.';
  if (!vehicleImage) return 'Please upload a car image.';
  return null;
}
