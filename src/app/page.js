"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { FileText, X, Loader2, Download, FileSliders, Upload } from "lucide-react";

export default function HomePage() {
  const [textInput, setTextInput] = useState("");
  const [textFile, setTextFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // Refs to programmatically click the hidden file inputs
  const textFileRef = useRef(null);
  const templateFileRef = useRef(null);

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileType === 'text') {
      setTextFile(file);
      setTextInput(""); // Clear textarea if a file is chosen
      setError(null);
    } else if (fileType === 'template') {
      setTemplateFile(file);
    }
  };

  const handleGenerateClick = async () => {
    if (!textFile && !textInput) {
      setError("Please provide the source content for the presentation.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDownloadUrl(null);

    const formData = new FormData();
    if (textFile) {
      formData.append("text_file", textFile);
    } else {
      const textBlob = new Blob([textInput], { type: "text/plain" });
      formData.append("text_file", textBlob, "input.txt");
    }
    if (templateFile) {
      formData.append("template_file", templateFile);
    }

    try {
      const response = await axios.post(
        "https://ppt-backend-gfqr.onrender.com/generate-presentation/",
        formData,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Failed to generate presentation. Please check the backend server and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = (type) => {
    if (type === 'text') {
      setTextFile(null);
      if (textFileRef.current) textFileRef.current.value = "";
    }
    if (type === 'template') {
      setTemplateFile(null);
      if (templateFileRef.current) templateFileRef.current.value = "";
    }
  };

  // Self-contained component for displaying a selected file
  const FileChip = ({ file, onRemove, icon }) => (
    <div className="flex items-center justify-between p-2 mt-2 bg-slate-700/50 border border-slate-600 rounded-lg animate-fade-in">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-sm font-medium text-slate-300">{file.name}</span>
      </div>
      <button onClick={onRemove} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
<main>
    <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-black/20 p-8 space-y-8">
          
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
              AI Presentation Generator
            </h1>
            <p className="mt-2 text-slate-400">Transform your notes into polished presentations instantly.</p>
          </div>
          
          {/* Source Content Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">1. Provide Source Content</label>
            <textarea
              placeholder="Type or paste your content here..."
              rows={8}
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                removeFile('text');
              }}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
            <input type="file" ref={textFileRef} onChange={(e) => handleFileChange(e, 'text')} accept=".txt" className="hidden" />
            <button 
              onClick={() => textFileRef.current.click()} 
              className="w-full flex items-center justify-center p-3 text-sm font-semibold rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Upload className="w-4 h-4 mr-2"/>
              ...or Upload a .txt File
            </button>
            {textFile && <FileChip file={textFile} onRemove={() => removeFile('text')} icon={<FileText className="w-5 h-5 text-blue-400" />} />}
          </div>

          {/* Template Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">2. Upload a Template (Optional)</label>
            <input type="file" ref={templateFileRef} onChange={(e) => handleFileChange(e, 'template')} accept=".pptx" className="hidden" />
            <button 
              onClick={() => templateFileRef.current.click()} 
              className="w-full flex items-center justify-center p-3 text-sm font-semibold rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FileSliders className="w-4 h-4 mr-2"/>
              Upload a .pptx Template
            </button>
            {templateFile && <FileChip file={templateFile} onRemove={() => removeFile('template')} icon={<FileSliders className="w-5 h-5 text-green-400" />} />}
          </div>

          {/* Error & Action Buttons */}
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg text-sm">
              <p className="font-bold">Generation Failed</p>
              <p>{error}</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700/50">
            <button 
              onClick={handleGenerateClick} 
              disabled={(!textFile && !textInput) || isLoading} 
              className="w-full flex items-center justify-center px-4 py-3 text-base font-bold rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</> : "✨ Generate Presentation"}
            </button>

            {downloadUrl && (
              <a href={downloadUrl} download="presentation.pptx" className="mt-4 block">
                <button className="w-full flex items-center justify-center px-4 py-3 text-base font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-400">
                  <Download className="mr-2 h-5 w-5" /> Download Your Presentation
                </button>
              </a>
            )}
          </div>
        </div>
      </div>            
      </div>
    </main>
  );
}
