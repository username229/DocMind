import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, Send, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  correct_answer?: string | boolean;
  expected_answer?: string;
  expected_topics?: string[];
  points: number;
}

interface Quiz {
  title: string;
  description: string;
  questions: Question[];
  total_points: number;
  time_limit_minutes: number;
}

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (results: any) => void;
  onReset: () => void;
}

export function QuizTaker({ quiz, onComplete, onReset }: QuizTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const goToNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answeredCount < quiz.questions.length) {
      const confirmSubmit = window.confirm(
        `Você respondeu ${answeredCount} de ${quiz.questions.length} questões. Deseja enviar mesmo assim?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('grade-quiz', {
        body: { quiz, answers },
      });

      if (error) throw error;

      if (data?.results) {
        onComplete(data.results);
        toast.success('Prova corrigida com sucesso!');
      } else {
        throw new Error('No grading results received');
      }
    } catch (error) {
      console.error('Error grading quiz:', error);
      toast.error('Erro ao corrigir a prova');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold">{quiz.title}</h2>
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Nova Prova
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {quiz.time_limit_minutes} minutos
          </span>
          <span>{quiz.total_points} pontos</span>
          <span>{quiz.questions.length} questões</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progresso</span>
            <span>{answeredCount}/{quiz.questions.length} respondidas</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
            Questão {currentQuestion + 1}
          </span>
          <span>•</span>
          <span>{question.points} pontos</span>
          <span>•</span>
          <span className="capitalize">
            {question.type === 'multiple_choice' && 'Múltipla escolha'}
            {question.type === 'true_false' && 'Verdadeiro ou Falso'}
            {question.type === 'short_answer' && 'Resposta curta'}
            {question.type === 'essay' && 'Dissertativa'}
          </span>
        </div>

        <h3 className="text-lg font-medium mb-6">{question.question}</h3>

        {/* Multiple Choice */}
        {question.type === 'multiple_choice' && question.options && (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  answers[question.id] === option.charAt(0)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleAnswer(option.charAt(0))}
              >
                <RadioGroupItem value={option.charAt(0)} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* True/False */}
        {question.type === 'true_false' && (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {[
              { value: 'true', label: 'Verdadeiro' },
              { value: 'false', label: 'Falso' },
            ].map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  answers[question.id] === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Short Answer */}
        {question.type === 'short_answer' && (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Digite sua resposta aqui..."
            rows={3}
            className="resize-none"
          />
        )}

        {/* Essay */}
        {question.type === 'essay' && (
          <div className="space-y-4">
            <Textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Desenvolva sua resposta aqui..."
              rows={8}
              className="resize-none"
            />
            {question.expected_topics && (
              <p className="text-xs text-muted-foreground">
                Dica: Sua resposta deve abordar tópicos como: {question.expected_topics.join(', ')}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrev}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-1">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                idx === currentQuestion
                  ? 'bg-primary text-primary-foreground'
                  : answers[quiz.questions[idx].id]
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <Button onClick={goToNext}>
            Próxima
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="hero"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Corrigindo...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Prova
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
