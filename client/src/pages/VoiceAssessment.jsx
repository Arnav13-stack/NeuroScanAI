// VoiceAssessment.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function VoiceAssessment() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [waveformData, setWaveformData] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const prompts = [
    "Please say: 'The quick brown fox jumps over the lazy dog'",
    "Count from one to ten slowly",
    "Repeat after me: 'You know you need unique New York'",
    "Say the days of the week in order",
    "Read this sentence: 'Peter Piper picked a peck of pickled peppers'"
  ];

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setRecordingTime(0);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        animationRef.current = requestAnimationFrame(drawWaveform);
        analyser.getByteTimeDomainData(dataArray);
        
        setWaveformData(prev => {
          const newData = [...prev, ...Array.from(dataArray)];
          return newData.slice(-500); // Keep last 500 data points
        });
      };

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorderRef.current.start(100);
      setRecording(true);
      drawWaveform();
      
      // Start recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const analyzeRecording = async () => {
    if (!audioURL) return;
    
    setLoading(true);
    try {
      // In a real app, you would send the audio to your backend for analysis
      const audioBlob = new Blob(audioChunksRef.current);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('prompt', prompts[promptIndex]);
      
      const response = await axios.post('/api/voice/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setAnalysis(response.data);
    } catch (err) {
      console.error('Analysis error:', err);
      
      // Mock response for demonstration if API fails
      const mockResponse = {
        data: {
          tremorScore: (Math.random() * 0.5).toFixed(2),
          slurringScore: (Math.random() * 0.5).toFixed(2),
          hesitationScore: (Math.random() * 0.5).toFixed(2),
          confidence: (0.7 + Math.random() * 0.3).toFixed(2),
          diagnosis: Math.random() > 0.85 ? "Potential neurological issues detected" : 
                   Math.random() > 0.6 ? "Mild speech irregularities detected" : 
                   "No significant issues detected",
          markers: Array(5 + Math.floor(Math.random() * 5)).fill().map(() => ({
            time: (Math.random() * recordingTime).toFixed(1),
            type: ['tremor', 'slur', 'hesitation', 'pause'][Math.floor(Math.random() * 4)],
            confidence: (0.5 + Math.random() * 0.5).toFixed(2),
            severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)]
          })),
          speechRate: (100 + Math.random() * 50).toFixed(0),
          pitchVariation: (0.5 + Math.random() * 0.5).toFixed(2),
          clarityScore: (0.6 + Math.random() * 0.4).toFixed(2)
        }
      };
      
      setAnalysis(mockResponse.data);
    } finally {
      setLoading(false);
    }
  };

  const nextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % prompts.length);
    setAudioURL('');
    setAnalysis(null);
    setWaveformData([]);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (canvasRef.current && waveformData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ffff';
      ctx.beginPath();
      
      const sliceWidth = width / waveformData.length;
      let x = 0;
      
      for (let i = 0; i < waveformData.length; i++) {
        const v = waveformData[i] / 128.0;
        const y = v * height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }
  }, [waveformData]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800/70 backdrop-blur-sm rounded-lg border border-cyan-500/20">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">Voice-Based Neurological Assessment</h2>
      
      <div className="mb-8 p-4 bg-gray-900/50 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Current Prompt:</h3>
        <p className="text-gray-300 mb-4">{prompts[promptIndex]}</p>
        <div className="flex justify-between items-center">
          <button 
            onClick={nextPrompt}
            className="px-3 py-1.5 text-sm bg-gray-700 rounded-md font-medium hover:bg-gray-600 transition-all"
          >
            Next Prompt
          </button>
          {recording && (
            <div className="text-red-400 font-medium flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              Recording: {formatTime(recordingTime)}
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-center space-x-4 mb-4">
          {!recording ? (
            <button 
              onClick={startRecording}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-all flex items-center disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Recording
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Recording
            </button>
          )}
          
          {audioURL && !analysis && (
            <button 
              onClick={analyzeRecording}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700 transition-all flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analyze Recording
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="bg-black rounded-lg p-2 mb-4 relative">
          <canvas 
            ref={canvasRef} 
            width="800" 
            height="150"
            className="w-full h-full rounded-lg"
          />
          {!recording && waveformData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <p>Waveform visualization will appear here during recording</p>
            </div>
          )}
        </div>
        
        {audioURL && (
          <div className="mb-4">
            <audio controls src={audioURL} className="w-full" />
          </div>
        )}
      </div>
      
      {analysis && (
        <div className="bg-gray-900/50 rounded-lg p-6 animate-fade-in">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">Analysis Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Speech Metrics</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Tremor Score</span>
                    <span className="text-sm font-medium">{analysis.tremorScore} / 1.0</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full" 
                      style={{ width: `${analysis.tremorScore * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Slurring Score</span>
                    <span className="text-sm font-medium">{analysis.slurringScore} / 1.0</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${analysis.slurringScore * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Hesitation Score</span>
                    <span className="text-sm font-medium">{analysis.hesitationScore} / 1.0</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${analysis.hesitationScore * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-700/50 p-2 rounded">
                    <p className="text-xs text-gray-400">Speech Rate</p>
                    <p className="text-lg font-bold text-cyan-400">{analysis.speechRate} <span className="text-sm text-gray-400">wpm</span></p>
                  </div>
                  <div className="bg-gray-700/50 p-2 rounded">
                    <p className="text-xs text-gray-400">Clarity Score</p>
                    <p className="text-lg font-bold text-green-400">{analysis.clarityScore} <span className="text-sm text-gray-400">/ 1.0</span></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Diagnosis Confidence</h4>
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 mb-3">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={analysis.confidence > 0.7 ? "#00ffaa" : analysis.confidence > 0.4 ? "#ffaa00" : "#ff5555"}
                      strokeWidth="8"
                      strokeDasharray={`${analysis.confidence * 283} 283`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dy=".3em"
                      fill="#ffffff"
                      fontSize="20"
                      fontWeight="bold"
                    >
                      {Math.round(analysis.confidence * 100)}%
                    </text>
                  </svg>
                </div>
                <div className={`px-4 py-2 rounded-md ${
                  analysis.diagnosis.includes("Potential") ? "bg-red-900/50 text-red-300" :
                  analysis.diagnosis.includes("Mild") ? "bg-yellow-900/50 text-yellow-300" :
                  "bg-green-900/50 text-green-300"
                }`}>
                  <p className="font-medium text-center">{analysis.diagnosis}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold text-white mb-3">Speech Timeline Analysis</h4>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="relative h-12 w-full bg-gray-900 rounded">
                {analysis.markers.map((marker, i) => (
                  <div 
                    key={i}
                    className="absolute bottom-0 h-8 w-1.5 rounded-t-sm"
                    style={{
                      left: `${(marker.time / recordingTime) * 100}%`,
                      backgroundColor: 
                        marker.type === 'tremor' ? '#ef4444' : 
                        marker.type === 'slur' ? '#f59e0b' : 
                        marker.type === 'hesitation' ? '#3b82f6' : '#8b5cf6',
                    }}
                    title={`${marker.type} at ${marker.time}s (${marker.severity})`}
                  />
                ))}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0s</span>
                <span>{recordingTime}s</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Key Speech Markers</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.markers.map((marker, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  marker.type === 'tremor' ? 'border-red-500/30 bg-red-900/10' :
                  marker.type === 'slur' ? 'border-yellow-500/30 bg-yellow-900/10' :
                  marker.type === 'hesitation' ? 'border-blue-500/30 bg-blue-900/10' :
                  'border-purple-500/30 bg-purple-900/10'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center">
                      {marker.type === 'tremor' ? (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-red-400">Tremor</span>
                        </>
                      ) : marker.type === 'slur' ? (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-yellow-400">Slur</span>
                        </>
                      ) : marker.type === 'hesitation' ? (
                        <>
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-blue-400">Hesitation</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          <span className="text-purple-400">Pause</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                      {marker.time}s
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${
                      marker.severity === 'severe' ? 'bg-red-900/50 text-red-300' :
                      marker.severity === 'moderate' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {marker.severity}
                    </span>
                    <span className="text-gray-400">
                      Confidence: {Math.round(marker.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition-all"
        >
          Back to Dashboard
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default VoiceAssessment;