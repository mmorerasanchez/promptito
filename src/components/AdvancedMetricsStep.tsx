
import React from "react";
import { useCalculator } from "@/context/CalculatorContext";
import FormField from "@/components/FormField";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdvancedMetricsStep: React.FC = () => {
  const { data, updateData, nextStep, prevStep } = useCalculator();

  return (
    <div className="animate-fade-in transition-all duration-500">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Advanced Metrics</CardTitle>
          <CardDescription>
            Define additional metrics for LTV and CAC calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="churnRate"
              label="Monthly Churn Rate"
              value={data.churnRate}
              onChange={(value) => updateData({ churnRate: value })}
              tooltip="Percentage of customers who stop using your product each month."
              suffix="%"
              min={0}
              max={100}
              step={0.1}
            />
            <FormField
              id="grossMargin"
              label="Gross Margin"
              value={data.grossMargin}
              onChange={(value) => updateData({ grossMargin: value })}
              tooltip="Percentage of revenue retained after direct costs."
              suffix="%"
              min={0}
              max={100}
              step={0.1}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="marketingCosts"
              label="Monthly Marketing Costs"
              value={data.marketingCosts}
              onChange={(value) => updateData({ marketingCosts: value })}
              tooltip="Total monthly spending on marketing and advertising."
              prefix="€"
              min={0}
              step={100}
            />
            <FormField
              id="salesCosts"
              label="Monthly Sales Costs"
              value={data.salesCosts}
              onChange={(value) => updateData({ salesCosts: value })}
              tooltip="Total monthly spending on sales activities."
              prefix="€"
              min={0}
              step={100}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              onClick={prevStep} 
              variant="outline"
              className="group transition-all duration-300"
            >
              <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Previous
            </Button>
            <Button 
              onClick={nextStep}
              className="group transition-all duration-300"
            >
              View Results
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedMetricsStep;
