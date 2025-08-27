"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FileText, X, Loader2, Download, FileSliders } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Textarea } from "./components/ui/textarea";

export default function HomePage() {
  const [textInput, setTextInput] = useState("");
  const [textFile, setTextFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const onDropText = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setTextFile(acceptedFiles[0]);
      setTextInput("");
      setError(null);
    }
  }, []);

  const onDropTemplate = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setTemplateFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps: getTextRootProps, getInputProps: getTextInputProps } = useDropzone({
    onDrop: onDropText,
    accept: { "text/plain": [".txt"] },
    multiple: false,
  });

  const { getRootProps: getTemplateRootProps, getInputProps: getTemplateInputProps } = useDropzone({
    onDrop: onDropTemplate,
    accept: { "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"] },
    multiple: false,
  });

  const handleGenerateClick = async () => {
    if (!textFile && !textInput) {
      setError("Please provide source text by typing or uploading a .txt file.");
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
      setError("Failed to generate presentation. Check the backend server and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = (type) => {
    if (type === 'text') setTextFile(null);
    if (type === 'template') setTemplateFile(null);
  };

  const renderFileChip = (file, onRemove, icon) => (
    <div className="flex items-center justify-between p-2 mt-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{file.name}</span>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">AI Presentation Generator</CardTitle>
            <CardDescription>Provide source text and an optional template to create a professional presentation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source Content</label>
              <Textarea
                placeholder="Type or paste your presentation content here..."
                rows={8}
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setTextFile(null);
                }}
                className="mb-2"
              />
              <div
                {...getTextRootProps()}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer text-sm text-gray-500 hover:border-gray-400"
              >
                <input {...getTextInputProps()} />
                <p>...or drag & drop a .txt file here.</p>
              </div>
              {textFile && renderFileChip(textFile, () => removeFile('text'), <FileText className="w-5 h-5 text-blue-500" />)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Presentation Template (Optional)</label>
              <div
                {...getTemplateRootProps()}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer text-sm text-gray-500 hover:border-gray-400"
              >
                <input {...getTemplateInputProps()} />
                <p>Drag & drop a .pptx template here.</p>
              </div>
              {templateFile && renderFileChip(templateFile, () => removeFile('template'), <FileSliders className="w-5 h-5 text-green-500" />)}
            </div>

            {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

            <Button onClick={handleGenerateClick} disabled={(!textFile && !textInput) || isLoading} className="w-full font-semibold" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</> : "Generate Presentation"}
            </Button>

            {downloadUrl && (
              <a href={downloadUrl} download="presentation.pptx">
                <Button variant="outline" className="w-full font-semibold" size="lg">
                  <Download className="mr-2 h-5 w-5" /> Download Presentation
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
