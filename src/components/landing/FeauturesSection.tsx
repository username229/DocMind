import { motion } from 'framer-motion';
import { FileText, Lightbulb, Target, Wand2, Clock, Shield } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Resumo Inteligente',
    description: 'Transforme documentos longos em resumos concisos e bem estruturados em segundos.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Lightbulb,
    title: 'Explicação Simples',
    description: 'Receba explicações claras como se fossem para uma criança de 12 anos.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Target,
    title: 'Sugestões de Melhoria',
    description: 'Identifique pontos fracos e receba sugestões práticas para melhorar seu texto.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: Wand2,
    title: 'Versão Melhorada',
    description: 'Gere automaticamente uma versão aprimorada do seu documento.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Clock,
    title: 'Histórico Completo',
    description: 'Acesse todos os seus documentos analisados a qualquer momento.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Shield,
    title: 'Seguro e Privado',
    description: 'Seus documentos são processados com segurança e privacidade garantidas.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas de IA para transformar seus documentos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
