
import React from "react";
import { useCalculator } from "@/context/CalculatorContext";
import FormField from "@/components/FormField";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MarketDemandStep: React.FC = () => {
  const { data, updateData, nextStep } = useCalculator();

  return (
    <div className="animate-fade-in transition-all duration-500">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Market & Demand</CardTitle>
          <CardDescription>
            Define your market size and customer acquisition metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="tam"
              label="Total Addressable Market (TAM)"
              value={data.tam}
              onChange={(value) => updateData({ tam: value })}
              tooltip="The total market demand for your product or service."
              prefix="€"
              min={0}
              step={10000}
            />
            <FormField
              id="sam"
              label="Serviceable Addressable Market (SAM)"
              value={data.sam}
              onChange={(value) => updateData({ sam: value })}
              tooltip="The portion of TAM that your product can realistically serve."
              prefix="€"
              min={0}
              max={data.tam}
              step={10000}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="som"
              label="Serviceable Obtainable Market (SOM)"
              value={data.som}
              onChange={(value) => updateData({ som: value })}
              tooltip="The portion of SAM that you can realistically capture."
              prefix="€"
              min={0}
              max={data.sam}
              step={10000}
            />
            <FormField
              id="monthlyReach"
              label="Monthly User Reach"
              value={data.monthlyReach}
              onChange={(value) => updateData({ monthlyReach: value })}
              tooltip="The number of potential users you can reach monthly."
              min={0}
              step={100}
            />
          </div>

          <FormField
            id="conversionRate"
            label="Conversion Rate"
            value={data.conversionRate}
            onChange={(value) => updateData({ conversionRate: value })}
            tooltip="Percentage of reached users who become paying customers."
            suffix="%"
            min={0}
            max={100}
            step={0.1}
          />

          <div className="flex justify-end pt-4">
            <Button 
              onClick={nextStep} 
              className="group transition-all duration-300"
            >
              Next Step
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketDemandStep;
