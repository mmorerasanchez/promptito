
import React from "react";
import { useCalculator } from "@/context/CalculatorContext";
import MarketDemandStep from "@/components/MarketDemandStep";
import BusinessModelStep from "@/components/BusinessModelStep";
import AdvancedMetricsStep from "@/components/AdvancedMetricsStep";
import ResultsDashboard from "@/components/ResultsDashboard";
import { Progress } from "@/components/ui/progress";

const RoiCalculator: React.FC = () => {
  const { currentStep } = useCalculator();
  
  const progressValue = ((currentStep + 1) / 4) * 100;
  
  const stepTitle = [
    "Market & Demand",
    "Business Model",
    "Advanced Metrics",
    "Results Dashboard"
  ][currentStep];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="space-y-2 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of 4: {stepTitle}
          </h2>
          <span className="text-sm text-muted-foreground">{progressValue.toFixed(0)}%</span>
        </div>
        <Progress value={progressValue} className="h-1" />
      </div>
      
      {currentStep === 0 && <MarketDemandStep />}
      {currentStep === 1 && <BusinessModelStep />}
      {currentStep === 2 && <AdvancedMetricsStep />}
      {currentStep === 3 && <ResultsDashboard />}
    </div>
  );
};

export default RoiCalculator;
