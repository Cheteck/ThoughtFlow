import React, { useState } from 'react';
import { UserProfile, PlanType } from '../types';
import { 
  X, 
  Check, 
  Zap, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Brain, 
  ArrowRight,
  BarChart,
  Lock,
  Star
} from 'lucide-react';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgradePlan: (plan: PlanType, interval: 'monthly' | 'yearly') => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradePlan
}) => {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPlan, setSuccessPlan] = useState<PlanType | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: PlanType) => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpgradePlan(plan, billingInterval);
      setIsProcessing(false);
      setSuccessPlan(plan);
      setTimeout(() => {
        setSuccessPlan(null);
      }, 2000);
    }, 600);
  };

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Free Starter',
      badge: 'Prototypage',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Pour découvrir la capture d\'idées structurée et tester l\'agent.',
      features: [
        '50 analyses d\'idées IA / mois',
        'Jusqu\'à 3 projets actifs',
        'Placement automatique en Inbox',
        'Synthèse de base du Cerveau de Projet',
        'Exportation JSON standard'
      ],
      popular: false,
      cta: 'Plan Gratuit'
    },
    {
      id: 'pro' as PlanType,
      name: 'Pro Agent',
      badge: 'Le plus populaire',
      priceMonthly: 19,
      priceYearly: 15,
      description: 'Pour les créateurs, fondateurs et chercheurs gérant plusieurs projets en parallèle.',
      features: [
        '2 000 analyses d\'idées IA / mois',
        'Jusqu\'à 50 projets actifs',
        'Cerveau de Projet Synthétique Évolutif',
        'Détection automatique des contradictions',
        'Historique & Journal des Pivots de Vision',
        'Graphe des relations & Connexions Masquées',
        'Accès aux modèles Gemini 3.8 Flash & Pro',
        'Support prioritaire par email'
      ],
      popular: true,
      cta: 'Passer à Pro Agent'
    },
    {
      id: 'team' as PlanType,
      name: 'Team Brain',
      badge: 'Équipes & Scale-up',
      priceMonthly: 49,
      priceYearly: 39,
      description: 'Pour les équipes produit et startups partageant un espace de pensée unifié.',
      features: [
        'Analyses IA & Projets ILLIMITÉS',
        'Jusqu\'à 25 membres d\'équipe',
        'Espaces de pensée collaboratifs partagés',
        'Clé API personnalisée (BYOK) incluse',
        'Alerte immédiate par webhook & Slack',
        'Gestion avancée des droits & accès',
        'Account Manager dédié'
      ],
      popular: false,
      cta: 'Choisir Team Brain'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl">
                <Crown className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Espace Tarifs & Forfaits SaaS</h2>
            </div>
            <p className="text-slate-400 text-xs">
              Libérez tout le potentiel du Cerveau de Projet et gérez vos idées sans contrainte de quota.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successPlan && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Votre abonnement a été mis à jour vers le forfait {successPlan.toUpperCase()} !</span>
          </div>
        )}

        {/* Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${billingInterval === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Facturation Mensuelle
            </span>
            
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-7 bg-slate-950 border border-slate-800 rounded-full p-1 relative transition-colors"
            >
              <div
                className={`w-5 h-5 bg-indigo-500 rounded-full transition-transform duration-200 ${
                  billingInterval === 'yearly' ? 'translate-x-7 bg-amber-500' : 'translate-x-0'
                }`}
              ></div>
            </button>

            <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingInterval === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              <span>Facturation Annuelle</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-full">
                -20% de réduction
              </span>
            </span>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isCurrent = user.plan === p.id;
              const price = billingInterval === 'yearly' ? p.priceYearly : p.priceMonthly;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-6 border flex flex-col justify-between transition-all relative ${
                    p.popular
                      ? 'bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500/60 shadow-xl ring-1 ring-indigo-500/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-lg">
                      {p.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{p.name}</h3>
                      {!p.popular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">{price}€</span>
                      <span className="text-xs text-slate-400">/ mois</span>
                      {billingInterval === 'yearly' && price > 0 && (
                        <span className="text-[10px] text-slate-500 ml-1">facturé annuellement</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 min-h-[36px]">{p.description}</p>

                    <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                      <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Inclus :</span>
                      {p.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60">
                    <button
                      disabled={isCurrent || isProcessing}
                      onClick={() => handleSelectPlan(p.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                          : p.popular
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Abonnement Actuel</span>
                        </>
                      ) : (
                        <>
                          <span>{p.cta}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee & Security Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block">Paiement sécurisé Stripe & Garantie 14 jours</span>
                <span>Changez ou annulez votre formule à tout moment en 1 clic sans frais.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
              <Lock className="w-3.5 h-3.5" />
              <span>Cryptage SSL 256 bits</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
