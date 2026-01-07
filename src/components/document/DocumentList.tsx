import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Document {
  id: string;
  title: string;
  status: string;
  created_at: string;
  summary: string | null;
}

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">
          Nenhum documento ainda
        </h3>
        <p className="text-muted-foreground mb-6">
          Faça upload do seu primeiro documento para começar
        </p>
        <Button asChild variant="hero">
          <Link to="/dashboard/new">
            <FileText className="w-4 h-4" />
            Novo Documento
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="glass-card rounded-xl p-4 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{doc.title}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {formatDistanceToNow(new Date(doc.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  doc.status === 'completed'
                    ? 'bg-success/20 text-success'
                    : doc.status === 'processing'
                    ? 'bg-warning/20 text-warning'
                    : doc.status === 'error'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {doc.status === 'completed' ? 'Concluído' :
                   doc.status === 'processing' ? 'Processando' :
                   doc.status === 'error' ? 'Erro' : 'Pendente'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(doc.id);
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Link to={`/dashboard/document/${doc.id}`}>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
