// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
// @ts-ignore
import { jStat } from 'https://esm.sh/jstat@1.9.6';
import { getCorsHeaders } from '../_shared/cors.js' // Using shared CORS utility

// Helper function to calculate mean
function calculateMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Helper function to calculate standard deviation
function calculateStdDev(arr: number[], mean: number): number {
  if (arr.length < 2) return 0; // Need at least 2 for sample std dev
  const sumOfSquares = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  return Math.sqrt(sumOfSquares / (arr.length - 1));
}

// Independent Samples T-test
function independentTTest(data1: number[], data2: number[]) {
  const n1 = data1.length;
  const n2 = data2.length;

  if (n1 < 2 || n2 < 2) {
    throw new Error("Each group must have at least 2 data points for t-test.");
  }

  const mean1 = calculateMean(data1);
  const mean2 = calculateMean(data2);
  const stdDev1 = calculateStdDev(data1, mean1);
  const stdDev2 = calculateStdDev(data2, mean2);

  const pooledVariance = ((n1 - 1) * Math.pow(stdDev1, 2) + (n2 - 1) * Math.pow(stdDev2, 2)) / (n1 + n2 - 2);
  const pooledStdDev = Math.sqrt(pooledVariance);

  const tStatistic = (mean1 - mean2) / (pooledStdDev * Math.sqrt(1 / n1 + 1 / n2));
  const df = n1 + n2 - 2;

  const pValue = 2 * jStat.studentt.cdf(-Math.abs(tStatistic), df); // Two-tailed p-value

  return { tStatistic, df, pValue, mean1, mean2, stdDev1, stdDev2 };
}

// Pearson Correlation
function pearsonCorrelation(dataX: number[], dataY: number[]) {
  if (dataX.length !== dataY.length || dataX.length < 2) {
    throw new Error("Both datasets must have the same length and at least 2 data points for correlation.");
  }

  const n = dataX.length;
  const meanX = calculateMean(dataX);
  const meanY = calculateMean(dataY);

  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const devX = dataX[i] - meanX;
    const devY = dataY[i] - meanY;
    sumXY += devX * devY;
    sumX2 += Math.pow(devX, 2);
    sumY2 += Math.pow(devY, 2);
  }

  const r = sumXY / (Math.sqrt(sumX2) * Math.sqrt(sumY2));

  // Calculate t-statistic for significance of r
  const tStatistic = r * Math.sqrt((n - 2) / (1 - Math.pow(r, 2)));
  const df = n - 2;
  const pValue = 2 * jStat.studentt.cdf(-Math.abs(tStatistic), df); // Two-tailed p-value

  return { r, tStatistic, df, pValue };
}

// Chi-Square Test for Independence (2x2 contingency table)
function chiSquareTest(observed: number[][]) {
  if (observed.length !== 2 || observed[0].length !== 2 || observed[1].length !== 2) {
    throw new Error("Chi-Square test currently supports only 2x2 contingency tables.");
  }

  const rowSums = [observed[0][0] + observed[0][1], observed[1][0] + observed[1][1]];
  const colSums = [observed[0][0] + observed[1][0], observed[0][1] + observed[1][1]];
  const total = rowSums[0] + rowSums[1];

  if (total === 0) {
    throw new Error("Total observations cannot be zero.");
  }

  const expected = [
    [(rowSums[0] * colSums[0]) / total, (rowSums[0] * colSums[1]) / total],
    [(rowSums[1] * colSums[0]) / total, (rowSums[1] * colSums[1]) / total],
  ];

  let chi2Statistic = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      if (expected[i][j] === 0) {
        // Handle cases where expected frequency is zero to avoid division by zero
        // This might indicate a problem with the data or that the test is not appropriate.
        // For simplicity, we'll treat it as contributing 0 to chi2 if observed is also 0.
        // A more robust solution might raise an error or add a small constant.
        if (observed[i][j] !== 0) {
          throw new Error("Expected frequency is zero but observed is not. Chi-square cannot be calculated.");
        }
        continue;
      }
      chi2Statistic += Math.pow(observed[i][j] - expected[i][j], 2) / expected[i][j];
    }
  }

  const df = (observed.length - 1) * (observed[0].length - 1);
  const pValue = jStat.chisquare.cdf(chi2Statistic, df); // jStat.chisquare.cdf gives P(X <= x), we need P(X >= x) = 1 - cdf

  return { chi2Statistic, df, pValue: 1 - pValue, expected };
}


serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('Invalid JWT')

    const { data, iv, dv, testType } = await req.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Data is required for analysis.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!iv || !dv || !testType) {
      return new Response(JSON.stringify({ error: 'Independent variable, dependent variable, and test type are required.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let analysisResult: any;
    let interpretationTemplate = "";

    switch (testType) {
      case "independent-t-test": {
        // Assuming IV is categorical (e.g., "Group A", "Group B") and DV is numerical
        const groups: { [key: string]: number[] } = {};
        data.forEach((row: any) => {
          const groupName = String(row[iv]);
          const value = parseFloat(row[dv]);
          if (!isNaN(value)) {
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(value);
          }
        });

        const groupNames = Object.keys(groups);
        if (groupNames.length !== 2) {
          throw new Error("Independent t-test requires exactly two groups in the independent variable.");
        }

        const data1 = groups[groupNames[0]];
        const data2 = groups[groupNames[1]];
        
        const { tStatistic, df, pValue, mean1, mean2 } = independentTTest(data1, data2);
        
        analysisResult = {
          test: "Independent Samples T-test",
          statistic: `t(${df}) = ${tStatistic.toFixed(2)}`,
          p_value: pValue,
          details: {
            [`Mean ${groupNames[0]}`]: mean1.toFixed(2),
            [`Mean ${groupNames[1]}`]: mean2.toFixed(2),
            [`N ${groupNames[0]}`]: data1.length,
            [`N ${groupNames[1]}`]: data2.length,
          },
        };
        interpretationTemplate = `An independent samples t-test was conducted to compare the mean ${dv} between ${groupNames[0]} (M=${mean1.toFixed(2)}, SD=${calculateStdDev(data1, mean1).toFixed(2)}) and ${groupNames[1]} (M=${mean2.toFixed(2)}, SD=${calculateStdDev(data2, mean2).toFixed(2)}). The results indicated ${pValue < 0.05 ? 'a statistically significant difference' : 'no statistically significant difference'} in ${dv} between the two groups.`;
        break;
      }
      case "pearson-correlation": {
        // Assuming both IV and DV are numerical
        const dataX: number[] = [];
        const dataY: number[] = [];
        data.forEach((row: any) => {
          const valX = parseFloat(row[iv]);
          const valY = parseFloat(row[dv]);
          if (!isNaN(valX) && !isNaN(valY)) {
            dataX.push(valX);
            dataY.push(valY);
          }
        });

        const { r, tStatistic, df, pValue } = pearsonCorrelation(dataX, dataY);
        
        analysisResult = {
          test: "Pearson Correlation",
          statistic: `r(${df}) = ${r.toFixed(2)}`,
          p_value: pValue,
          details: {
            'Correlation Coefficient (r)': r.toFixed(2),
            'R-squared (R²)': Math.pow(r, 2).toFixed(2),
            'Sample Size (N)': dataX.length,
          },
        };
        interpretationTemplate = `A Pearson product-moment correlation was computed to assess the relationship between ${iv} and ${dv}. The results indicated ${pValue < 0.05 ? 'a statistically significant' : 'no statistically significant'} ${r > 0 ? 'positive' : 'negative'} linear relationship between ${iv} and ${dv}.`;
        break;
      }
      case "chi-square": {
        // Assuming both IV and DV are categorical
        // This implementation assumes a 2x2 table for simplicity.
        // For a more general case, a contingency table builder would be needed.
        const categoriesIV = Array.from(new Set(data.map((row: any) => String(row[iv]))));
        const categoriesDV = Array.from(new Set(data.map((row: any) => String(row[dv]))));

        if (categoriesIV.length !== 2 || categoriesDV.length !== 2) {
          throw new Error("Chi-Square test currently supports only 2x2 categorical variables.");
        }

        const observedCounts = [[0, 0], [0, 0]];
        data.forEach((row: any) => {
          const ivCat = String(row[iv]);
          const dvCat = String(row[dv]);
          const ivIndex = categoriesIV.indexOf(ivCat);
          const dvIndex = categoriesDV.indexOf(dvCat);
          if (ivIndex !== -1 && dvIndex !== -1) {
            observedCounts[ivIndex][dvIndex]++;
          }
        });

        const { chi2Statistic, df, pValue, expected } = chiSquareTest(observedCounts);

        analysisResult = {
          test: "Chi-Square Test",
          statistic: `χ²(${df}) = ${chi2Statistic.toFixed(2)}`,
          p_value: pValue,
          details: {
            'Observed Counts': observedCounts,
            'Expected Counts': expected.map(row => row.map(val => val.toFixed(2))),
          },
        };
        interpretationTemplate = `A Chi-Square test for independence was performed to examine the relationship between ${iv} and ${dv}. The results indicated ${pValue < 0.05 ? 'a statistically significant association' : 'no statistically significant association'} between ${iv} and ${dv}.`;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Unsupported statistical test.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    analysisResult.interpretation = interpretationTemplate;

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in run-statistical-analysis function:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred."
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});