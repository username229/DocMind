import { motion } from 'framer-motion';
import { FileText, Sparkles, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      
      <div className="container relative z-10 px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8"
          >
        
          {/* Title */}
      <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground">
  <span className="whitespace-nowrap">
    Transforme seus <span className="text-accent">documentos</span> com IA
  </span>
</h1>


          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Faça upload de PDFs ou textos e receba resumos, explicações simples, 
            sugestões de melhoria e versões aprimoradas em segundos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/auth">
                <Zap className="w-5 h-5" />
                Começar Grátis
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <a href="#features">
                Saiba Mais
              </a>
            </Button>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex items-center justify-center gap-8 text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">+10k documentos analisados</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <div className="hidden sm:flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <span className="text-sm">IA de última geração</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature cards preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: '📝', label: 'Resumo' },
            { icon: '💡', label: 'Explicação' },
            { icon: '🎯', label: 'Sugestões' },
            { icon: '✨', label: 'Versão Melhorada' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <span className="font-medium text-foreground">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
