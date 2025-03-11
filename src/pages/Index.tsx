
import React from "react";
import { CalculatorProvider } from "@/context/CalculatorContext";
import RoiCalculator from "@/components/RoiCalculator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight animate-fade-in">ROI Calculator</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Calculate and visualize key financial metrics for your business model,
              including ROI, Net Profit, Customer Acquisition Cost, and Lifetime Value.
            </p>
          </div>
        </div>
      </header>
      
      <main className="pb-16">
        <CalculatorProvider>
          <RoiCalculator />
        </CalculatorProvider>
      </main>
      
      <footer className="py-6 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>ROI Calculator - Make informed business decisions</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
