import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Keyboard, Settings, Maximize2, MousePointer } from 'lucide-react';
import { cn } from '../utils/cn';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content?: React.ReactNode;
}

interface OnboardingGuideProps {
  onComplete: () => void;
}

const getSteps = (): OnboardingStep[] => [
  {
    title: 'Welcome to FlowLint',
    description: 'FlowLint analyzes your n8n workflows for best practices and potential issues. Let\'s take a quick tour of the key features.',
    icon: <img src={chrome.runtime.getURL('icon-32.png')} className="w-8 h-8" alt="FlowLint" />,
  },
  {
    title: 'Widget Controls',
    description: 'Use the header buttons to control the widget:',
    icon: <MousePointer className="w-8 h-8 text-brand-500" />,
    content: (
      <div className="mt-4 space-y-3 text-left">
        <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Minimize / Maximize</div>
            <div className="text-xs text-zinc-500">Collapse widget to save space</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Expand View</div>
            <div className="text-xs text-zinc-500">Open full-screen results panel</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center">
            <X className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Close Widget</div>
            <div className="text-xs text-zinc-500">Hide widget (click floating button to reopen)</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Settings',
    description: 'Click the gear icon to access settings where you can:',
    icon: <Settings className="w-8 h-8 text-brand-500" />,
    content: (
      <ul className="mt-4 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
        <li className="flex items-start gap-2">
          <span className="text-brand-500 font-bold">•</span>
          <span>Enable/disable analysis globally</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-500 font-bold">•</span>
          <span>Toggle auto-analyze on paste</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-500 font-bold">•</span>
          <span>Choose theme (system/light/dark)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-500 font-bold">•</span>
          <span>Set widget position on screen</span>
        </li>
      </ul>
    ),
  },
  {
    title: 'Rule Configuration',
    description: 'In Settings, expand the "Rules" section to customize which rules to check:',
    icon: <Settings className="w-8 h-8 text-brand-500" />,
    content: (
      <ul className="mt-4 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
        <li className="flex items-start gap-2">
          <span className="text-brand-500 font-bold">•</span>
          <span>Toggle individual rules on/off</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-500 font-bold">•</span>
          <span>Use "All" or "None" for bulk selection</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-500 font-bold">•</span>
          <span>Changes trigger automatic re-analysis</span>
        </li>
      </ul>
    ),
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Speed up your workflow with these shortcuts:',
    icon: <Keyboard className="w-8 h-8 text-brand-500" />,
    content: (
      <div className="mt-4 space-y-3 text-left">
        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Close widget / exit expanded view</span>
          <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
            Escape
          </kbd>
        </div>
        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Toggle expanded view</span>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
              Ctrl+E
            </kbd>
            <span className="text-xs text-zinc-400">or</span>
            <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
              ⌘+E
            </kbd>
          </div>
        </div>
      </div>
    ),
  },
];

export const OnboardingGuide = ({ onComplete }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = getSteps();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const version = chrome.runtime.getManifest().version;
    chrome.storage.local.set({ onboardingCompletedVersion: version });
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="onboarding-overlay"
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Progress bar */}
        <div className="h-1 bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center border border-brand-100 dark:border-brand-800">
            {step.icon}
          </div>

          {/* Title & Description */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 text-center mb-2">
            {step.title}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center leading-relaxed">
            {step.description}
          </p>

          {/* Step-specific content */}
          {step.content}

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((_, index) => (
              <button
                key={index}
                data-testid="step-indicator"
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentStep
                    ? "bg-brand-500 w-6"
                    : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            aria-label="Skip"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-colors"
              aria-label={isLastStep ? 'Got it' : 'Next'}
            >
              {isLastStep ? 'Got it' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
