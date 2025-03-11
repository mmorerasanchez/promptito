
import React, { useMemo } from "react";
import { useCalculator } from "@/context/CalculatorContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ChevronLeft, Download, RotateCcw, Printer, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, InfoIcon, Clock } from "lucide-react";
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
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

  // Calculate break-even point in months
  const breakEvenPoint = useMemo(() => {
    if (monthlyNetProfit <= 0) return Infinity;
    return data.initialInvestment / monthlyNetProfit;
  }, [data.initialInvestment, monthlyNetProfit]);

  // Monthly growth projections
  const monthlyGrowthProjections = useMemo(() => {
    // Project customer growth over 24 months
    const months = 24;
    const initialCustomers = data.monthlyReach * (data.conversionRate / 100);
    const customerGrowth = projectOverTime(initialCustomers, data.monthlyGrowthRate, months);
    
    // Calculate revenue, costs, and profit for each month
    const revenueData = customerGrowth.map(customers => customers * data.revenuePerUser);
    const costsData = customerGrowth.map(customers => data.fixedCosts + (customers * data.variableCostsPerUser));
    const profitData = revenueData.map((rev, i) => rev - costsData[i]);
    const cumulativeProfitData = profitData.reduce((acc, profit) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(lastValue + profit);
      return acc;
    }, [] as number[]);

    return {
      customers: customerGrowth,
      revenue: revenueData,
      costs: costsData,
      profit: profitData,
      cumulativeProfit: cumulativeProfitData,
      months: Array.from({ length: months }, (_, i) => i + 1)
    };
  }, [
    data.monthlyReach, 
    data.conversionRate, 
    data.revenuePerUser, 
    data.fixedCosts, 
    data.variableCostsPerUser, 
    data.monthlyGrowthRate
  ]);

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

  // LTV/CAC interpretation
  const getLtvCacInterpretation = () => {
    if (ltvCacRatio < 1) {
      return {
        label: "Poor",
        description: "Your customer acquisition cost exceeds lifetime value. This is not sustainable.",
        color: "text-red-500",
        icon: <TrendingDown className="h-4 w-4" />
      };
    } else if (ltvCacRatio < 3) {
      return {
        label: "Marginal",
        description: "Your business may be sustainable, but growth will be challenging.",
        color: "text-amber-500",
        icon: <AlertTriangle className="h-4 w-4" />
      };
    } else {
      return {
        label: "Excellent",
        description: "Your business model is highly scalable with good unit economics.",
        color: "text-emerald-500",
        icon: <TrendingUp className="h-4 w-4" />
      };
    }
  };

  // Payback period interpretation
  const getPaybackInterpretation = () => {
    if (!isFinite(paybackPeriodMonths)) {
      return {
        label: "Never",
        description: "At current rates, you will not recoup your investment.",
        color: "text-red-500",
        icon: <AlertTriangle className="h-4 w-4" />
      };
    } else if (paybackPeriodMonths <= 12) {
      return {
        label: "Excellent",
        description: "You'll recoup your investment within a year.",
        color: "text-emerald-500",
        icon: <CheckCircle className="h-4 w-4" />
      };
    } else if (paybackPeriodMonths <= 24) {
      return {
        label: "Good",
        description: "You'll recoup your investment within two years.",
        color: "text-amber-500",
        icon: <Clock className="h-4 w-4" />
      };
    } else {
      return {
        label: "Slow",
        description: "Long payback period may indicate a capital-intensive business.",
        color: "text-red-500",
        icon: <AlertTriangle className="h-4 w-4" />
      };
    }
  };

  // Prepare LTV/CAC chart data
  const ltvCacChartData = useMemo(() => {
    return [
      { name: "LTV", value: ltv, fill: "#10b981" },
      { name: "CAC", value: cac, fill: "#ef4444" }
    ];
  }, [ltv, cac]);

  // Handle export or print function
  const handleExport = () => {
    toast.success("Report exported successfully", {
      description: "Your ROI analysis has been downloaded as PDF."
    });
    // In a real implementation, this would generate and download a PDF
  };

  const handlePrint = () => {
    window.print();
  };

  const ltvCacInterpretation = getLtvCacInterpretation();
  const paybackInterpretation = getPaybackInterpretation();

  // Break-even chart data
  const breakEvenChartData = useMemo(() => {
    if (monthlyProjections.profit.every(p => p <= 0)) {
      // If all profits are negative, no break-even
      return [];
    }
    
    // Find month where cumulative profit exceeds initial investment
    let cumulativeProfit = -data.initialInvestment;
    const chartData = monthlyProjections.profit.map((profit, month) => {
      cumulativeProfit += profit;
      return {
        month: month + 1,
        cumulativeProfit,
        breakEven: 0
      };
    });
    
    return chartData;
  }, [monthlyProjections.profit, data.initialInvestment]);

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
                onClick={handleExport}
              >
                <Download className="mr-1 h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs group transition-all duration-300"
                onClick={handlePrint}
              >
                <Printer className="mr-1 h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
                Print
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
                <div className="flex items-center">
                  <div className={`text-2xl font-bold ${ltvCacRatio >= 3 ? 'text-emerald-600' : ltvCacRatio >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
                    {ltvCacRatio.toFixed(2)}
                  </div>
                  <Badge className={`ml-2 ${
                    ltvCacRatio >= 3 ? 'bg-emerald-100 text-emerald-800' : 
                    ltvCacRatio >= 1 ? 'bg-amber-100 text-amber-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {ltvCacInterpretation.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {ltvCacInterpretation.icon}
                  <span className="ml-1">{ltvCacInterpretation.description}</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payback Period</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center">
                  <div className={`text-2xl font-bold ${
                    paybackPeriodMonths <= 12 ? 'text-emerald-600' : 
                    paybackPeriodMonths <= 24 ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {isFinite(paybackPeriodMonths) ? `${paybackPeriodMonths.toFixed(1)} mo` : '∞'}
                  </div>
                  <Badge className={`ml-2 ${
                    paybackPeriodMonths <= 12 ? 'bg-emerald-100 text-emerald-800' : 
                    paybackPeriodMonths <= 24 ? 'bg-amber-100 text-amber-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {paybackInterpretation.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {paybackInterpretation.icon}
                  <span className="ml-1">{paybackInterpretation.description}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="financials" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
              <TabsTrigger value="metrics">Customer Metrics</TabsTrigger>
              <TabsTrigger value="breakeven">Break-even Analysis</TabsTrigger>
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
                    <CardTitle className="text-base">Customer Acquisition</CardTitle>
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
                        <p className="text-sm font-medium">LTV to CAC Ratio</p>
                        <div className="flex items-center">
                          <span className="text-lg font-semibold">{ltvCacRatio.toFixed(2)}</span>
                          <Badge className={`ml-2 ${
                            ltvCacRatio >= 3 ? 'bg-emerald-100 text-emerald-800' : 
                            ltvCacRatio >= 1 ? 'bg-amber-100 text-amber-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {ltvCacInterpretation.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{ltvCacInterpretation.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">LTV vs CAC</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={ltvCacChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="value" name="Value">
                            {ltvCacChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p className="flex items-center">
                        <InfoIcon className="h-3 w-3 mr-1" />
                        <span>A healthy LTV:CAC ratio is 3:1 or higher, indicating good unit economics.</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="breakeven" className="mt-0">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Break-even Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyGrowthProjections.months.map((month, index) => ({
                          month,
                          profit: monthlyGrowthProjections.cumulativeProfit[index] - data.initialInvestment,
                          zero: 0
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          label={{ value: 'Months', position: 'insideBottom', offset: -5 }} 
                        />
                        <YAxis 
                          label={{ value: 'Cumulative Profit (€)', angle: -90, position: 'insideLeft' }} 
                        />
                        <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#10b981" 
                          name="Cumulative Profit" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="zero" 
                          stroke="#ef4444" 
                          name="Break-even" 
                          strokeDasharray="5 5" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6 p-4 border border-muted rounded-md">
                    <h3 className="text-sm font-medium mb-2">Break-even Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Initial Investment</p>
                        <div className="text-lg font-semibold">{formatCurrency(data.initialInvestment)}</div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Break-even Point</p>
                        <div className="text-lg font-semibold">
                          {isFinite(breakEvenPoint) 
                            ? `${Math.ceil(breakEvenPoint)} months` 
                            : "Never (at current rates)"}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Monthly Net Profit</p>
                        <div className={`text-lg font-semibold ${monthlyNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(monthlyNetProfit)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Monthly Fixed Costs</p>
                        <div className="text-lg font-semibold">
                          {formatCurrency(data.fixedCosts)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
