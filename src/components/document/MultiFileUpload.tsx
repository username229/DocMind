import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, Image as ImageIcon, Plus, AlertCircle, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// ✅ Worker local (Vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const PLAN_LIMITS = {
  free: 3,
  standard: 10,
  pro: 20,
};

type UserPlan = 'free' | 'standard' | 'pro';

interface FileItem {
  id: string;
  file: File;
  title: string;
  content: string;
  imageBase64: string | null;
  imagePreview: string | null;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

interface MultiFileUploadProps {
  onSubmit: (files: { title: string; content: string; imageBase64?: string }[]) => void;
  isLoading?: boolean;
  plan?: UserPlan;
}

export function MultiFileUpload({ onSubmit, isLoading, plan = 'free' }: MultiFileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [extracting, setExtracting] = useState(false);

  // CORREÇÃO: Garante que maxFiles sempre tenha um número, mesmo se 'plan' vier errado do banco
  const currentPlan = PLAN_LIMITS[plan] ? plan : 'free';
  const maxFiles = PLAN_LIMITS[currentPlan];
  const isLimitReached = files.length >= maxFiles;

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    } catch (error) {
      console.error("Erro na extração do PDF:", error);
      throw new Error("Não foi possível ler o PDF.");
    }
  };

  const processFile = async (file: File): Promise<Omit<FileItem, 'id' | 'status'>> => {
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve({ file, title: fileName, content: '', imageBase64: base64, imagePreview: base64 });
        };
        reader.readAsDataURL(file);
      });
    } 
    
    if (file.type === 'application/pdf') {
      const text = await extractTextFromPDF(file);
      return { file, title: fileName, content: text, imageBase64: null, imagePreview: null };
    }

    if (file.type === 'text/plain') {
      const text = await file.text();
      return { file, title: fileName, content: text, imageBase64: null, imagePreview: null };
    }

    return { file, title: fileName, content: '', imageBase64: null, imagePreview: null };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Validação de limite
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Limite atingido! Seu plano ${currentPlan} permite ${maxFiles} arquivos.`);
      return;
    }

    setExtracting(true);
    const loadingToast = toast.loading("Lendo documentos...");
    
    try {
      const processedResults = await Promise.all(
        acceptedFiles.map(async (file) => {
          const processed = await processFile(file);
          return {
            ...processed,
            id: Math.random().toString(36).substr(2, 9),
            status: 'complete' as const,
          };
        })
      );

      setFiles((prev) => [...prev, ...processedResults]);
      toast.success("Processado com sucesso!", { id: loadingToast });
    } catch (error) {
      toast.error("Erro ao processar arquivos.", { id: loadingToast });
    } finally {
      setExtracting(false);
    }
  }, [files.length, maxFiles, currentPlan]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    disabled: isLoading || extracting || isLimitReached,
  });

  const handleSubmit = () => {
    const validFiles = files.filter(f => f.title.trim() && (f.content.trim() || f.imageBase64));
    if (validFiles.length === 0) {
      toast.error('Adicione conteúdo aos documentos.');
      return;
    }
    onSubmit(validFiles.map(f => ({ 
      title: f.title, 
      content: f.content, 
      imageBase64: f.imageBase64 || undefined 
    })));
  };

  return (
    <div className="space-y-6">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
        isDragActive ? 'border-primary bg-primary/5' : isLimitReached ? 'bg-muted/20 opacity-50 cursor-not-allowed' : 'border-border hover:border-primary/50 cursor-pointer'
      }`}>
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">
            {isLimitReached ? 'Limite atingido' : 'Arraste seus documentos aqui'}
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-tighter">
            Plano {currentPlan} — {files.length} de {maxFiles} usados
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <ScrollArea className="max-h-[300px] rounded-lg border bg-muted/20 p-4">
          <div className="space-y-3">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="flex gap-4 p-3 bg-card rounded-lg border shadow-sm items-center">
                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
                  {fileItem.imageBase64 ? <ImageIcon className="w-5 h-5 text-primary" /> : <FileCheck className="w-5 h-5 text-primary" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <Input 
                    value={fileItem.title} 
                    onChange={(e) => setFiles(prev => prev.map(f => f.id === fileItem.id ? {...f, title: e.target.value} : f))}
                    className="h-8 text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                    {fileItem.content ? fileItem.content.substring(0, 50) + "..." : "Análise visual pronta"}
                  </p>
                </div>

                <Button variant="ghost" size="icon" onClick={() => setFiles(prev => prev.filter(f => f.id !== fileItem.id))} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || extracting || files.length === 0} 
        className="w-full h-12 text-base font-bold"
      >
        {extracting || isLoading ? (
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
        ) : (
          <Plus className="mr-2 h-5 w-5" />
        )}
        {extracting ? "Lendo arquivos..." : isLoading ? "IA Analisando..." : `Analisar ${files.length} item(ns)`}
      </Button>
    </div>
  );
}