import { motion } from 'framer-motion';
import { Trophy, Check, X, BookOpen, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface QuestionResult {
  question_id: number;
  correct: boolean;
  points_earned: number;
  max_points: number;
  feedback: string;
  student_answer: string;
  correct_answer: string;
}

interface GradingResults {
  total_score: number;
  max_score: number;
  percentage: number;
  grade: string;
  overall_feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
  question_results: QuestionResult[];
  study_recommendations: string[];
}

interface QuizResultsProps {
  results: GradingResults;
  onRetry: () => void;
  onNewQuiz: () => void;
}

export function QuizResults({ results, onRetry, onNewQuiz }: QuizResultsProps) {
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 80) return 'text-blue-500';
    if (percentage >= 70) return 'text-yellow-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeBg = (percentage: number) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-600';
    if (percentage >= 80) return 'from-blue-500 to-indigo-600';
    if (percentage >= 70) return 'from-yellow-500 to-amber-600';
    if (percentage >= 60) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 text-center"
      >
        <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getGradeBg(results.percentage)} flex items-center justify-center mb-4`}>
          <span className="text-4xl font-bold text-white">{results.grade}</span>
        </div>

        <h2 className="font-display text-2xl font-bold mb-2">
          {results.percentage >= 60 ? 'Parabéns!' : 'Continue tentando!'}
        </h2>

        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <p className={`text-3xl font-bold ${getGradeColor(results.percentage)}`}>
              {results.total_score}
            </p>
            <p className="text-sm text-muted-foreground">de {results.max_score} pontos</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <p className={`text-3xl font-bold ${getGradeColor(results.percentage)}`}>
              {results.percentage}%
            </p>
            <p className="text-sm text-muted-foreground">acerto</p>
          </div>
        </div>

        <Progress value={results.percentage} className="h-3 mb-4" />

        <p className="text-muted-foreground">{results.overall_feedback}</p>
      </motion.div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-semibold">Pontos Fortes</h3>
          </div>
          <ul className="space-y-2">
            {results.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-semibold">Áreas para Melhorar</h3>
          </div>
          <ul className="space-y-2">
            {results.areas_for_improvement.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Question Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="font-display text-lg font-semibold mb-4">Detalhes por Questão</h3>
        
        <div className="space-y-4">
          {results.question_results.map((qr, idx) => (
            <div
              key={qr.question_id}
              className={`p-4 rounded-xl border ${
                qr.correct
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Questão {idx + 1}</span>
                <div className="flex items-center gap-2">
                  {qr.correct ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {qr.points_earned}/{qr.max_points} pts
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Sua resposta:</strong> {qr.student_answer || 'Não respondida'}
              </p>
              
              {!qr.correct && (
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Resposta correta:</strong> {qr.correct_answer}
                </p>
              )}
              
              <p className="text-sm text-muted-foreground">{qr.feedback}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Study Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold">Recomendações de Estudo</h3>
        </div>
        
        <ul className="space-y-2">
          {results.study_recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">
                {idx + 1}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onRetry} className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refazer esta Prova
        </Button>
        <Button onClick={onNewQuiz} className="flex-1" variant="hero">
          <Trophy className="w-4 h-4 mr-2" />
          Gerar Nova Prova
        </Button>
      </div>
    </div>
  );
}
