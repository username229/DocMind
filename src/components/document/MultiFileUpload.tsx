import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  maxFiles?: number;
}

export function MultiFileUpload({ onSubmit, isLoading, maxFiles = 20 }: MultiFileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [extracting, setExtracting] = useState(false);

  const isImageFile = (file: File) => file.type.startsWith('image/');

  const processFile = async (file: File): Promise<Omit<FileItem, 'id' | 'status'>> => {
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    
    if (isImageFile(file)) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve({
            file,
            title: fileName,
            content: '',
            imageBase64: base64,
            imagePreview: base64,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else if (file.type === 'text/plain') {
      const text = await file.text();
      return {
        file,
        title: fileName,
        content: text,
        imageBase64: null,
        imagePreview: null,
      };
    } else {
      // For PDFs and other files
      return {
        file,
        title: fileName,
        content: '',
        imageBase64: null,
        imagePreview: null,
      };
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    setExtracting(true);
    
    try {
      const newFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const processed = await processFile(file);
          return {
            ...processed,
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'pending' as const,
          };
        })
      );

      setFiles((prev) => [...prev, ...newFiles]);
      toast.success(`${acceptedFiles.length} arquivo(s) adicionado(s)!`);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Erro ao processar arquivos');
    } finally {
      setExtracting(false);
    }
  }, [files.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'],
    },
    maxFiles: maxFiles - files.length,
    disabled: isLoading || extracting || files.length >= maxFiles,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileTitle = (id: string, title: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title } : f))
    );
  };

  const updateFileContent = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content } : f))
    );
  };

  const handleSubmit = () => {
    const validFiles = files.filter((f) => {
      if (!f.title.trim()) return false;
      if (!f.content.trim() && !f.imageBase64) return false;
      return true;
    });

    if (validFiles.length === 0) {
      toast.error('Por favor, adicione pelo menos um arquivo válido com título e conteúdo');
      return;
    }

    onSubmit(
      validFiles.map((f) => ({
        title: f.title,
        content: f.content,
        imageBase64: f.imageBase64 || undefined,
      }))
    );
  };

  const clearAll = () => {
    setFiles([]);
  };

  const needsTextForPDF = files.some((f) => f.file.type === 'application/pdf' && !f.content);

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Arquivos ({files.length}/{maxFiles})
        </label>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          } ${(extracting || files.length >= maxFiles) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex justify-center gap-2 mb-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-1">
            {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos (PDF, TXT, imagens)'}
          </p>
          <p className="text-sm text-muted-foreground">
            ou clique para selecionar (até {maxFiles} arquivos)
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Arquivos selecionados</h4>
            <Button variant="ghost" size="sm" onClick={clearAll} disabled={isLoading}>
              Limpar todos
            </Button>
          </div>

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-4">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="p-4 bg-muted/50 rounded-xl border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {fileItem.imagePreview ? (
                        <img
                          src={fileItem.imagePreview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <Input
                        value={fileItem.title}
                        onChange={(e) => updateFileTitle(fileItem.id, e.target.value)}
                        placeholder="Título do documento"
                        disabled={isLoading}
                        className="bg-background"
                      />

                      {!fileItem.imageBase64 && (
                        <textarea
                          value={fileItem.content}
                          onChange={(e) => updateFileContent(fileItem.id, e.target.value)}
                          placeholder={
                            fileItem.file.type === 'application/pdf'
                              ? 'Cole o texto do PDF aqui...'
                              : 'Conteúdo do documento...'
                          }
                          disabled={isLoading}
                          className="w-full h-20 px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      )}

                      <p className="text-xs text-muted-foreground">
                        {fileItem.file.name} • {(fileItem.file.size / 1024).toFixed(1)} KB
                        {fileItem.imageBase64 && ' • Imagem'}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(fileItem.id)}
                      disabled={isLoading}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {needsTextForPDF && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              ⚠️ Alguns PDFs precisam do texto colado manualmente
            </p>
          )}
        </div>
      )}

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || extracting || files.length === 0}
        size="lg"
        className="w-full"
        variant="hero"
      >
        {extracting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processando arquivos...
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analisando com IA...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Analisar {files.length} arquivo{files.length !== 1 ? 's' : ''}
          </>
        )}
      </Button>
    </div>
  );
}
