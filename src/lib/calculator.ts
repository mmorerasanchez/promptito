
// Financial calculation utilities

/**
 * Calculate ROI as a percentage
 * @param netProfit - Total profit
 * @param initialInvestment - Initial investment amount
 * @returns ROI as a percentage
 */
export const calculateROI = (netProfit: number, initialInvestment: number): number => {
  if (initialInvestment === 0) return 0;
  return (netProfit / initialInvestment) * 100;
};

/**
 * Calculate Net Profit
 * @param totalRevenue - Total revenue
 * @param totalCosts - Total costs
 * @returns Net profit
 */
export const calculateNetProfit = (totalRevenue: number, totalCosts: number): number => {
  return totalRevenue - totalCosts;
};

/**
 * Calculate monthly revenue
 * @param reach - Monthly user reach
 * @param conversionRate - Conversion rate as a decimal (e.g., 0.05 for 5%)
 * @param avgRevenuePerUser - Average revenue per user
 * @returns Monthly revenue
 */
export const calculateMonthlyRevenue = (
  reach: number,
  conversionRate: number,
  avgRevenuePerUser: number
): number => {
  return reach * (conversionRate / 100) * avgRevenuePerUser;
};

/**
 * Project values over time, accounting for growth rate
 * @param initialValue - Starting value
 * @param monthlyGrowthRate - Monthly growth rate as a decimal
 * @param months - Number of months to project
 * @returns Array of monthly values
 */
export const projectOverTime = (
  initialValue: number,
  monthlyGrowthRate: number,
  months: number
): number[] => {
  const projections: number[] = [];
  let currentValue = initialValue;

  for (let i = 0; i < months; i++) {
    projections.push(currentValue);
    currentValue = currentValue * (1 + monthlyGrowthRate / 100);
  }

  return projections;
};

/**
 * Calculate Customer Acquisition Cost (CAC)
 * @param marketingCosts - Total marketing costs
 * @param salesCosts - Total sales costs
 * @param newCustomers - Number of new customers acquired
 * @returns CAC value
 */
export const calculateCAC = (
  marketingCosts: number,
  salesCosts: number,
  newCustomers: number
): number => {
  if (newCustomers === 0) return 0;
  return (marketingCosts + salesCosts) / newCustomers;
};

/**
 * Calculate Customer Lifetime Value (LTV)
 * @param avgMonthlyRevenue - Average monthly revenue per customer
 * @param grossMargin - Gross margin as a decimal (e.g., 0.7 for 70%)
 * @param churnRate - Monthly churn rate as a decimal (e.g., 0.05 for 5%)
 * @returns LTV value
 */
export const calculateLTV = (
  avgMonthlyRevenue: number,
  grossMargin: number,
  churnRate: number
): number => {
  if (churnRate === 0) return 0; // Avoid division by zero
  return (avgMonthlyRevenue * grossMargin) / (churnRate / 100);
};

/**
 * Format number as currency
 * @param value - Number to format
 * @param currency - Currency symbol, defaults to €
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = "€"): string => {
  return `${currency}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format number as percentage
 * @param value - Number to format
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

/**
 * Aggregate monthly projections into yearly summaries
 * @param monthlyValues - Array of monthly values
 * @returns Object containing 1-year, 3-year, and 5-year totals
 */
export const aggregateYearlyProjections = (monthlyValues: number[]): {
  year1: number;
  year3: number;
  year5: number;
} => {
  const year1 = monthlyValues.slice(0, 12).reduce((sum, value) => sum + value, 0);
  const year3 = monthlyValues.slice(0, 36).reduce((sum, value) => sum + value, 0);
  const year5 = monthlyValues.slice(0, 60).reduce((sum, value) => sum + value, 0);

  return { year1, year3, year5 };
};
