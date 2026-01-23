import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/LanguageSelector';
import { useSession } from '../contexts/SessionContext';

export function EmergencySetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { code } = useParams<{ code: string }>();
  const { setRole } = useSession();

  // Set role to driver for emergency beacon
  useEffect(() => {
    setRole('driver');
  }, [setRole]);

  const handleShare = async () => {
    // Request location when user wants to share
    console.log('[EmergencySetup] Requesting location for sharing...');
    console.log('[EmergencySetup] Geolocation available:', !!navigator.geolocation);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    try {
      console.log('[EmergencySetup] Calling getCurrentPosition...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      console.log('[EmergencySetup] Location received:', position.coords);

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const shareText = t('emergency.shareLocationText', {
        code,
        lat: latitude.toFixed(6),
        lng: longitude.toFixed(6)
      });

      console.log('Share button clicked');
      console.log('Location:', latitude, longitude);
      console.log('Maps URL:', mapsUrl);
      console.log('navigator.share available:', !!navigator.share);

      // Try native share API first (opens WhatsApp, SMS, Email selector)
      if (navigator.share) {
        try {
          await navigator.share({
            title: t('emergency.shareTitle'),
            text: shareText,
            url: mapsUrl,
          });
          console.log('Share successful');
          return;
        } catch (err: any) {
          console.log('Share cancelled or failed:', err?.name, err?.message);
          // If user cancelled, don't show error
          if (err?.name === 'AbortError') {
            return;
          }
          // Continue to clipboard fallback for other errors
        }
      }

      // Desktop fallback: copy to clipboard
      try {
        const fullText = `${shareText}\n${mapsUrl}`;
        await navigator.clipboard.writeText(fullText);
        alert(t('emergency.copied'));
        console.log('Copied to clipboard');
      } catch (err) {
        console.error('Failed to copy:', err);
        // Last resort: show URL in prompt so user can copy manually
        prompt('Copy this emergency location:', `${shareText}\n${mapsUrl}`);
      }
    } catch (error: any) {
      console.error('[EmergencySetup] Location error:', error);
      console.error('[EmergencySetup] Error code:', error.code);
      console.error('[EmergencySetup] Error message:', error.message);

      // Show specific error message
      let errorMsg = t('emergency.locationDeniedHelp');
      if (error.code === 1) {
        errorMsg = 'Location permission denied. Please allow location access in your browser and try again.';
      } else if (error.code === 2) {
        errorMsg = 'Location unavailable. Please check your device settings.';
      } else if (error.code === 3) {
        errorMsg = 'Location request timed out. Please try again.';
      }
      alert(errorMsg);
    }
  };

  const handleActivateBeacon = () => {
    // Pass emergency flag through URL
    navigate(`/session/${code}/beacon?emergency=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Top Bar with Language Selector */}
        <div className="mb-6 flex items-center justify-end">
          <LanguageSelector />
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-amber-200">
          {/* Emergency Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t('emergency.title')}
            </h1>
            <p className="text-gray-600 text-base mb-4">
              {t('emergency.subtitle')}
            </p>

            {/* Legal Warning */}
            <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="text-sm font-bold text-red-800">
                {t('emergency.legalWarning')}
              </p>
            </div>
          </div>

          {/* Session Code Display */}
          <div className="mb-8 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-center">
            <p className="text-sm text-amber-800 font-medium mb-2">{t('emergency.codeLabel')}</p>
            <p className="text-4xl font-bold text-amber-600 tracking-wider">{code}</p>
          </div>

          {/* Share Button */}
          <div className="mb-8">
            <button
              onClick={handleShare}
              className="w-full min-h-[70px] bg-white border-2 border-amber-300 text-amber-800 font-semibold py-6 px-8 rounded-xl hover:bg-amber-50 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 text-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{t('emergency.shareButton')}</span>
            </button>
            <p className="text-sm text-gray-500 mt-3 text-center">{t('emergency.shareHint')}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Activate Beacon - Primary action */}
            <button
              onClick={handleActivateBeacon}
              className="w-full min-h-[70px] bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-xl"
            >
              {t('emergency.activateBeacon')}
            </button>

            {/* Back to Home - Secondary action */}
            <button
              onClick={() => navigate('/')}
              className="w-full min-h-[60px] bg-white border-2 border-gray-200 text-gray-700 font-semibold py-5 px-8 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('emergency.backToHome')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
