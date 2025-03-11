
import React, { useMemo } from "react";
import { useCalculator } from "@/context/CalculatorContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ChevronLeft, DownloadIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  calculateNetProfit, 
  calculateROI, 
  calculateMonthlyRevenue,
  calculateCAC,
  calculateLTV,
  formatCurrency,
  formatPercentage,
  projectOverTime,
  aggregateYearlyProjections
} from "@/lib/calculator";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ResultsDashboard: React.FC = () => {
  const { data, prevStep, resetData } = useCalculator();

  // Calculate key metrics
  const monthlyRevenue = useMemo(() => {
    return calculateMonthlyRevenue(
      data.monthlyReach, 
      data.conversionRate, 
      data.revenuePerUser
    );
  }, [data.monthlyReach, data.conversionRate, data.revenuePerUser]);

  const monthlyCosts = useMemo(() => {
    const customerCount = data.monthlyReach * (data.conversionRate / 100);
    return data.fixedCosts + (customerCount * data.variableCostsPerUser);
  }, [data.monthlyReach, data.conversionRate, data.fixedCosts, data.variableCostsPerUser]);

  const monthlyNetProfit = useMemo(() => {
    return calculateNetProfit(monthlyRevenue, monthlyCosts);
  }, [monthlyRevenue, monthlyCosts]);

  const roi = useMemo(() => {
    // Calculate ROI for one year
    const annualNetProfit = monthlyNetProfit * 12;
    return calculateROI(annualNetProfit, data.initialInvestment);
  }, [monthlyNetProfit, data.initialInvestment]);

  const cac = useMemo(() => {
    const newCustomers = data.monthlyReach * (data.conversionRate / 100);
    return calculateCAC(data.marketingCosts, data.salesCosts, newCustomers);
  }, [data.monthlyReach, data.conversionRate, data.marketingCosts, data.salesCosts]);

  const ltv = useMemo(() => {
    return calculateLTV(data.revenuePerUser, data.grossMargin / 100, data.churnRate);
  }, [data.revenuePerUser, data.grossMargin, data.churnRate]);

  const ltvCacRatio = useMemo(() => {
    if (cac === 0) return 0;
    return ltv / cac;
  }, [ltv, cac]);

  const paybackPeriodMonths = useMemo(() => {
    if (monthlyNetProfit <= 0) return Infinity;
    return data.initialInvestment / monthlyNetProfit;
  }, [data.initialInvestment, monthlyNetProfit]);

  // Project revenue, costs, and profit over 5 years (60 months)
  const monthlyProjections = useMemo(() => {
    const revenueProjections = projectOverTime(monthlyRevenue, data.monthlyGrowthRate, 60);
    
    // Calculate customer count for each month
    const customerCountProjections = projectOverTime(
      data.monthlyReach * (data.conversionRate / 100), 
      data.monthlyGrowthRate, 
      60
    );
    
    // Calculate costs based on fixed costs and variable costs per customer
    const costProjections = customerCountProjections.map(
      (customerCount) => data.fixedCosts + (customerCount * data.variableCostsPerUser)
    );
    
    // Calculate profit as revenue - costs
    const profitProjections = revenueProjections.map(
      (revenue, index) => revenue - costProjections[index]
    );
    
    return {
      revenue: revenueProjections,
      costs: costProjections,
      profit: profitProjections,
    };
  }, [
    monthlyRevenue, 
    data.monthlyGrowthRate, 
    data.monthlyReach, 
    data.conversionRate, 
    data.fixedCosts, 
    data.variableCostsPerUser
  ]);

  // Aggregate yearly totals
  const yearlyProjections = useMemo(() => {
    return {
      revenue: aggregateYearlyProjections(monthlyProjections.revenue),
      costs: aggregateYearlyProjections(monthlyProjections.costs),
      profit: aggregateYearlyProjections(monthlyProjections.profit),
    };
  }, [monthlyProjections]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return [
      {
        name: '1 Year',
        Revenue: yearlyProjections.revenue.year1,
        Costs: yearlyProjections.costs.year1,
        Profit: yearlyProjections.profit.year1
      },
      {
        name: '3 Years',
        Revenue: yearlyProjections.revenue.year3,
        Costs: yearlyProjections.costs.year3,
        Profit: yearlyProjections.profit.year3
      },
      {
        name: '5 Years',
        Revenue: yearlyProjections.revenue.year5,
        Costs: yearlyProjections.costs.year5,
        Profit: yearlyProjections.profit.year5
      }
    ];
  }, [yearlyProjections]);

  const keyMetricsChart = useMemo(() => {
    return [
      {
        name: 'Monthly',
        Revenue: monthlyRevenue,
        Costs: monthlyCosts,
        Profit: monthlyNetProfit
      },
      {
        name: 'Yearly',
        Revenue: monthlyRevenue * 12,
        Costs: monthlyCosts * 12,
        Profit: monthlyNetProfit * 12
      }
    ];
  }, [monthlyRevenue, monthlyCosts, monthlyNetProfit]);

  return (
    <div className="animate-fade-in transition-all duration-500 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-medium">Results Dashboard</CardTitle>
              <CardDescription>
                Financial projections and key metrics
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetData}
                className="text-xs group transition-all duration-300"
              >
                <RotateCcw className="mr-1 h-3 w-3 group-hover:rotate-90 transition-transform" />
                Reset
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs group transition-all duration-300"
              >
                <DownloadIcon className="mr-1 h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className={`text-2xl font-bold ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPercentage(roi)}
                </div>
                <p className="text-xs text-muted-foreground">Annual return on investment</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Profit</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className={`text-2xl font-bold ${monthlyNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlyNetProfit)}
                </div>
                <p className="text-xs text-muted-foreground">Per month net profit</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">LTV/CAC Ratio</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className={`text-2xl font-bold ${ltvCacRatio >= 3 ? 'text-emerald-600' : ltvCacRatio >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
                  {ltvCacRatio.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Customer value to acquisition cost</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payback Period</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className={`text-2xl font-bold ${
                  paybackPeriodMonths <= 12 ? 'text-emerald-600' : 
                  paybackPeriodMonths <= 24 ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  {isFinite(paybackPeriodMonths) ? `${paybackPeriodMonths.toFixed(1)} mo` : '∞'}
                </div>
                <p className="text-xs text-muted-foreground">Months to recoup investment</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="financials" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="financials" className="mt-0">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Monthly Financials</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={keyMetricsChart}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="Revenue" fill="#3b82f6" name="Revenue" />
                        <Bar dataKey="Costs" fill="#ef4444" name="Costs" />
                        <Bar dataKey="Profit" fill="#10b981" name="Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projections" className="mt-0">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Long-term Projections</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="Revenue" fill="#3b82f6" name="Revenue" />
                        <Bar dataKey="Costs" fill="#ef4444" name="Costs" />
                        <Bar dataKey="Profit" fill="#10b981" name="Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metrics" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Customer Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Customer Acquisition Cost (CAC)</p>
                        <div className="text-lg font-semibold">{formatCurrency(cac)}</div>
                        <p className="text-xs text-muted-foreground">Cost to acquire one customer</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Customer Lifetime Value (LTV)</p>
                        <div className="text-lg font-semibold">{formatCurrency(ltv)}</div>
                        <p className="text-xs text-muted-foreground">Revenue from customer over lifetime</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Monthly Churn Rate</p>
                        <div className="text-lg font-semibold">{formatPercentage(data.churnRate)}</div>
                        <p className="text-xs text-muted-foreground">Customer attrition per month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Monthly Users</p>
                        <div className="text-lg font-semibold">
                          {Math.round(data.monthlyReach * (data.conversionRate / 100)).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Paying customers per month</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">{data.businessModel === "subscription" ? "Monthly Revenue/User" : "Revenue/User"}</p>
                        <div className="text-lg font-semibold">{formatCurrency(data.revenuePerUser)}</div>
                        <p className="text-xs text-muted-foreground">Average revenue per customer</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Gross Margin</p>
                        <div className="text-lg font-semibold">{formatPercentage(data.grossMargin)}</div>
                        <p className="text-xs text-muted-foreground">Revenue after direct costs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4">
            <Button 
              onClick={prevStep} 
              variant="outline"
              className="group transition-all duration-300"
            >
              <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Advanced Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
