import { Link } from 'react-router-dom';
import { ArrowRight, FileText, BrainCircuit, UserCheck, Database, History, Zap } from 'lucide-react';

export default function Overview() {
  const steps = [
    { name: 'Messy submission', icon: FileText },
    { name: 'Mock AI extraction', icon: BrainCircuit },
    { name: 'Human review', icon: UserCheck },
    { name: 'CRM ready', icon: Zap },
    { name: 'Simulated sync', icon: Database },
    { name: 'Audit log', icon: History },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Intake
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Intake turns messy lead emails, forms, and notes into CRM-ready records with mock AI extraction, duplicate risk signals, human review, and simulated CRM sync.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/submissions/new"
            className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-cyan-900/10 hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all"
          >
            Start demo / Create messy lead
          </Link>
          <Link
            to="/submissions"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
          >
            View submissions
          </Link>
        </div>
      </div>

      <div className="mt-16 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-8 text-center">The Intake Workflow</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
            {steps.map((step, index) => (
              <div key={step.name} className="flex flex-col items-center bg-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 ring-4 ring-white shadow-sm text-cyan-700 mb-3">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 text-center max-w-[80px]">
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-300 my-2 md:hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
