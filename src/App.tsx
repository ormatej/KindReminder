import React, { useState, useEffect } from 'react';
import { Share2, RefreshCcw, Smile } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Giphy API Key - it's generally better to store this in environment variables
const GIPHY_API_KEY = 'sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh';

// Business-focused passive aggressive reminders
const reminders = [
  "Your 'urgent' request from last month is still pending your input",
  "Haven't heard back on those 27 emails I sent",
  "We're still waiting for your 'ASAP' response from last Tuesday",

];

function App() {
  const [gifUrl, setGifUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reminder, setReminder] = useState('');

  const getRandomReminder = () => {
    return reminders[Math.floor(Math.random() * reminders.length)];
  };

  const fetchNewGif = async () => {
    // Removed GiphyFetch initialization
    setIsLoading(true);
    setReminder(getRandomReminder());
    try {
      // Construct the Giphy API URL with cache-busting timestamp
      const timestamp = new Date().getTime();
      const giphyUrl = `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=office%20passive%20aggressive&rating=g&timestamp=${timestamp}`;
      
      // Use native fetch
      const response = await fetch(giphyUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Check if data and the expected image URL exist
      if (result.data && result.data.images && result.data.images.original && result.data.images.original.url) {
        setGifUrl(result.data.images.original.url);
      } else {
        throw new Error('Invalid data structure received from Giphy');
      }

    } catch (error) {
      console.error('Error fetching GIF:', error);
      // Fallback URL
      setGifUrl('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNewGif();
  }, []);

  const handleShare = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [800, 600]
      });

      // Add title and reminder
      pdf.setFontSize(28);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Kind Reminder', 400, 60, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(100, 100, 100);
      const lines = pdf.splitTextToSize(reminder, 700);
      pdf.text(lines, 400, 90, { align: 'center' });

      // Add the image
      const response = await fetch(gifUrl);
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      await new Promise((resolve) => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const imgWidth = 720;
          const imgHeight = (img.height * imgWidth) / img.width;
          pdf.addImage(img, 'PNG', 40, 140, imgWidth, imgHeight);
          resolve(null);
        };
      });

      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], 'kind-reminder.pdf', { type: 'application/pdf' });
      await navigator.share({
        title: 'Kind Reminder',
        text: reminder,
        files: [file]
      });

      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      console.log('Sharing failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Kind Reminder
            <span className="text-indigo-500">*</span>
          </h1>
          <p className="text-gray-500 text-sm italic">
            *Professional courtesy at its finest
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-100">
          <div className="p-8">
            <div className="mb-6">
              <p className="text-xl text-gray-700 font-medium text-center">
                {reminder}
              </p>
            </div>
            
            <div className="relative aspect-video mb-8 bg-gray-50 rounded-xl overflow-hidden">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : (
                <img 
                  src={gifUrl} 
                  alt="Professional Reminder GIF"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={fetchNewGif}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <RefreshCcw size={20} />
                <span>New Reminder</span>
              </button>
              
              <div className="flex gap-4">
                {/* Remove the 'Noted' button */}
                {/* 
                <button 
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                >
                  <Smile size={20} />
                  <span>Noted</span>
                </button>
                */}
                
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Share2 size={20} />
                  <span>Forward Kindly</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 text-gray-500 italic">
          <p>Because sometimes a gentle nudge needs to be delivered with professional precision</p>
        </footer>
      </div>
    </div>
  );
}

export default App;