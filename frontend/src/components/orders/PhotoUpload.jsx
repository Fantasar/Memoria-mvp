import { useState } from 'react';
import axios from 'axios';

const PhotoUpload = ({ orderId, onUploadSuccess }) => {
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Gérer sélection photo "avant"
  const handleBeforePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBeforePhoto(file);
      setBeforePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Gérer sélection photo "après"
  const handleAfterPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterPhoto(file);
      setAfterPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Upload des photos
  const handleUpload = async () => {
    // Validation
    if (!beforePhoto || !afterPhoto) {
      setError('Vous devez fournir une photo avant ET après');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Upload photo "avant"
      const beforeFormData = new FormData();
      beforeFormData.append('photo', beforePhoto);
      beforeFormData.append('order_id', orderId);
      beforeFormData.append('photo_type', 'before');

      await axios.post(
        'http://localhost:5500/api/photos/upload',
        beforeFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Upload photo "après"
      const afterFormData = new FormData();
      afterFormData.append('photo', afterPhoto);
      afterFormData.append('order_id', orderId);
      afterFormData.append('photo_type', 'after');

      await axios.post(
        'http://localhost:5500/api/photos/upload',
        afterFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Succès
      alert('Photos uploadées avec succès !');
      
      // Reset
      setBeforePhoto(null);
      setAfterPhoto(null);
      setBeforePreview(null);
      setAfterPreview(null);

      // Callback parent
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (err) {
      console.error('Erreur upload photos:', err);
      setError(
        err.response?.data?.error?.message || 
        'Erreur lors de l\'upload des photos'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Upload des photos d'intervention
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Photo AVANT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo AVANT intervention
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
            {beforePreview ? (
              <div className="relative">
                <img 
                  src={beforePreview} 
                  alt="Preview avant" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setBeforePhoto(null);
                    setBeforePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Cliquez pour choisir une photo
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBeforePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Photo APRÈS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo APRÈS intervention
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
            {afterPreview ? (
              <div className="relative">
                <img 
                  src={afterPreview} 
                  alt="Preview après" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setAfterPhoto(null);
                    setAfterPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Cliquez pour choisir une photo
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAfterPhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Bouton Upload */}
      <button
        onClick={handleUpload}
        disabled={!beforePhoto || !afterPhoto || uploading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          !beforePhoto || !afterPhoto || uploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {uploading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Upload en cours...
          </span>
        ) : (
          'Uploader les photos'
        )}
      </button>

      <p className="mt-2 text-sm text-gray-500 text-center">
        Formats acceptés : JPG, PNG, WEBP • Taille max : 5 MB par photo
      </p>
    </div>
  );
};

export default PhotoUpload;