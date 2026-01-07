import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onSubmit: (title: string, content: string) => void;
  isLoading?: boolean;
}

export function DocumentUpload({ onSubmit, isLoading }: DocumentUploadProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    setTitle(file.name.replace('.pdf', '').replace('.txt', ''));

    if (file.type === 'application/pdf') {
      // For PDFs, we'll inform the user to paste the text
      setExtracting(false);
      toast.info('Para PDFs, por favor copie e cole o texto do documento abaixo.');
      setContent('');
    } else if (file.type === 'text/plain') {
      const text = await file.text();
      setContent(text);
      toast.success('Arquivo carregado com sucesso!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: isLoading || extracting,
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Por favor, adicione um título');
      return;
    }
    if (!content.trim()) {
      toast.error('Por favor, adicione conteúdo ou cole o texto do documento');
      return;
    }
    onSubmit(title, content);
  };

  const clearFile = () => {
    setFile(null);
    setContent('');
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Title input */}
      <div>
        <label className="block text-sm font-medium mb-2">Título do documento</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Relatório Anual 2024"
          disabled={isLoading}
        />
      </div>

      {/* Upload area */}
      <div>
        <label className="block text-sm font-medium mb-2">Arquivo ou texto</label>
        
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            } ${extracting ? 'opacity-50 cursor-wait' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-700 font-medium mb-1">
              {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um PDF ou TXT'}
            </p>
            <p className="text-sm text-slate-500">
              ou clique para selecionar
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-xl">
            <FileText className="w-8 h-8 text-indigo-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{file.name}</p>
              <p className="text-sm text-slate-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Text input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {file ? 'Cole o texto do documento aqui' : 'Ou cole seu texto aqui'}
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Cole ou digite o texto que deseja analisar..."
          rows={8}
          disabled={isLoading || extracting}
          className="resize-none"
        />
        {content && (
          <p className="text-xs text-slate-500 mt-1">
            {content.length.toLocaleString()} caracteres
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || extracting || !content.trim() || !title.trim()}
        size="lg"
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
      >
        {extracting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Extraindo texto...
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analisando com IA...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Analisar Documento
          </>
        )}
      </Button>
    </div>
  );
}
