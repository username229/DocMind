import { useState } from 'react';
import { FileText, Lightbulb, Target, Wand2, Copy, Check, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AnalysisResultsProps {
  summary: string | null;
  simpleExplanation: string | null;
  suggestions: string | null;
  improvedVersion: string | null;
  isLoading: {
    summary: boolean;
    simple: boolean;
    suggestions: boolean;
    improved: boolean;
  };
  onAnalyze: (type: 'summary' | 'simple' | 'suggestions' | 'improved') => void;
}

export function AnalysisResults({
  summary,
  simpleExplanation,
  suggestions,
  improvedVersion,
  isLoading,
  onAnalyze,
}: AnalysisResultsProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const tabs = [
    {
      id: 'summary',
      label: 'Resumo',
      icon: FileText,
      content: summary,
      loading: isLoading.summary,
      description: 'Um resumo conciso dos pontos principais do documento.',
    },
    {
      id: 'simple',
      label: 'Explicação',
      icon: Lightbulb,
      content: simpleExplanation,
      loading: isLoading.simple,
      description: 'Uma explicação simples, como para uma criança de 12 anos.',
    },
    {
      id: 'suggestions',
      label: 'Sugestões',
      icon: Target,
      content: suggestions,
      loading: isLoading.suggestions,
      description: 'Sugestões práticas para melhorar o documento.',
    },
    {
      id: 'improved',
      label: 'Versão Melhorada',
      icon: Wand2,
      content: improvedVersion,
      loading: isLoading.improved,
      description: 'Uma versão aprimorada do seu documento.',
    },
  ];

  const copyToClipboard = async (content: string, tabId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedTab(tabId);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display text-xl font-semibold mb-6">Resultados da Análise</h3>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analisando com IA...</p>
              </div>
            ) : tab.content ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{tab.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(tab.content!, tab.id)}
                  >
                    {copiedTab === tab.id ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none bg-muted/50 rounded-xl p-6 max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-foreground">{tab.content}</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <tab.icon className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">{tab.description}</p>
                <Button
                  onClick={() => onAnalyze(tab.id as any)}
                  variant="default"
                >
                  Gerar {tab.label}
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
