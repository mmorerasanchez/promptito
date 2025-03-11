
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the calculator data structure
export interface CalculatorData {
  // Market & Demand
  tam: number; // Total Addressable Market size
  sam: number; // Serviceable Addressable Market size
  som: number; // Serviceable Obtainable Market size
  monthlyReach: number; // Monthly user reach
  conversionRate: number; // Conversion rate (percentage)
  
  // Business Model
  revenuePerUser: number; // Average revenue per user
  fixedCosts: number; // Monthly fixed costs
  variableCostsPerUser: number; // Variable costs per user
  initialInvestment: number; // Initial investment
  businessModel: "subscription" | "one-time"; // Business model type
  
  // Growth & Advanced
  monthlyGrowthRate: number; // Monthly growth rate (percentage)
  churnRate: number; // Monthly churn rate (percentage)
  grossMargin: number; // Gross margin (percentage)
  marketingCosts: number; // Monthly marketing costs
  salesCosts: number; // Monthly sales costs
}

// Define the calculator context
interface CalculatorContextType {
  data: CalculatorData;
  updateData: (updatedData: Partial<CalculatorData>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Default initial values
const defaultCalculatorData: CalculatorData = {
  tam: 1000000,
  sam: 500000,
  som: 100000,
  monthlyReach: 10000,
  conversionRate: 5,
  revenuePerUser: 50,
  fixedCosts: 5000,
  variableCostsPerUser: 10,
  initialInvestment: 100000,
  businessModel: "subscription",
  monthlyGrowthRate: 5,
  churnRate: 5,
  grossMargin: 70,
  marketingCosts: 5000,
  salesCosts: 3000,
};

// Create context
const CalculatorContext = createContext<CalculatorContextType | undefined>(
  undefined
);

// Provider component
export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<CalculatorData>(defaultCalculatorData);
  const [currentStep, setCurrentStep] = useState(0);

  const updateData = (updatedData: Partial<CalculatorData>) => {
    // Ensure all numeric fields are properly converted to numbers
    const processedData: Partial<CalculatorData> = {};
    
    Object.entries(updatedData).forEach(([key, value]) => {
      const numericKeys = [
        'tam', 'sam', 'som', 'monthlyReach', 'conversionRate',
        'revenuePerUser', 'fixedCosts', 'variableCostsPerUser', 'initialInvestment',
        'monthlyGrowthRate', 'churnRate', 'grossMargin', 'marketingCosts', 'salesCosts'
      ];
      
      if (numericKeys.includes(key) && typeof value === 'string') {
        processedData[key as keyof CalculatorData] = parseFloat(value as string) || 0;
      } else {
        processedData[key as keyof CalculatorData] = value as any;
      }
    });
    
    setData((prev) => ({ ...prev, ...processedData }));
  };

  const resetData = () => {
    setData(defaultCalculatorData);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3)); // Max step is 3 (0-based index)
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0)); // Min step is 0
  };

  return (
    <CalculatorContext.Provider
      value={{
        data,
        updateData,
        resetData,
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

// Custom hook to use the calculator context
export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
};
