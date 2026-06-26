import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken, getRealmId } from '@/lib/quickbooks';

// ─── HELPER: Extract value from a row ─────────────────────────────────
function extractValue(row: any): number {
  if (row?.Cols?.[1]?.value !== undefined) {
    return parseFloat(row.Cols[1].value) || 0;
  }
  if (row?.ColData?.[1]?.value !== undefined) {
    return parseFloat(row.ColData[1].value) || 0;
  }
  return 0;
}

// ─── HELPER: Find a row by title pattern ─────────────────────────────
function findRowByTitle(rows: any[], titlePattern: string | RegExp): any {
  for (const row of rows) {
    const title = row?.Header?.ColData?.[0]?.value || 
                  row?.Header?.value || 
                  row?.Summary?.ColData?.[0]?.value || 
                  row?.ColData?.[0]?.value || 
                  '';
    if (typeof titlePattern === 'string' && title.toLowerCase().includes(titlePattern.toLowerCase())) {
      return row;
    }
    if (titlePattern instanceof RegExp && titlePattern.test(title)) {
      return row;
    }
    if (row?.Rows?.Row) {
      const found = findRowByTitle(row.Rows.Row, titlePattern);
      if (found) return found;
    }
  }
  return null;
}

// ─── PARSE BALANCE SHEET ──────────────────────────────────────────────
function parseBalanceSheet(data: any) {
  const rows = data?.Rows?.Row || [];
  
  let cash = 0, ar = 0, inventory = 0, undeposited = 0, fixedAssets = 0;
  let currentLiabilities = 0, longTermDebt = 0, shortTermDebt = 0;

  // Bank Accounts (Checking + Savings)
  const bankRow = findRowByTitle(rows, /Bank Accounts/i);
  if (bankRow && bankRow.Rows?.Row) {
    for (const subRow of bankRow.Rows.Row) {
      const accountName = subRow?.ColData?.[0]?.value || '';
      const amount = parseFloat(subRow?.ColData?.[1]?.value || '0');
      if (accountName.includes('Checking') || accountName.includes('Savings')) {
        cash += amount;
      }
    }
  }

  // Accounts Receivable
  const arRow = findRowByTitle(rows, /Accounts Receivable/i);
  if (arRow) {
    const arValue = extractValue(arRow);
    if (arValue !== 0) {
      ar = arValue;
    } else if (arRow.Summary) {
      ar = parseFloat(arRow.Summary.ColData?.[1]?.value || '0');
    } else if (arRow.Rows?.Row) {
      for (const subRow of arRow.Rows.Row) {
        ar += extractValue(subRow);
      }
    }
  }

  // Inventory
  const invRow = findRowByTitle(rows, /Inventory Asset/i);
  if (invRow) {
    inventory = extractValue(invRow);
    if (inventory === 0 && invRow.Summary) {
      inventory = parseFloat(invRow.Summary.ColData?.[1]?.value || '0');
    }
  }

  // Undeposited Funds
  const undepRow = findRowByTitle(rows, /Undeposited Funds/i);
  if (undepRow) {
    undeposited = extractValue(undepRow);
    if (undeposited === 0 && undepRow.Summary) {
      undeposited = parseFloat(undepRow.Summary.ColData?.[1]?.value || '0');
    }
  }

  // Fixed Assets (Truck)
  const faRow = findRowByTitle(rows, /Truck|Fixed Assets/i);
  if (faRow) {
    fixedAssets = extractValue(faRow);
    if (fixedAssets === 0 && faRow.Summary) {
      fixedAssets = parseFloat(faRow.Summary.ColData?.[1]?.value || '0');
    }
  }

  // Current Liabilities
  const clRow = findRowByTitle(rows, /Current Liabilities/i);
  if (clRow && clRow.Summary) {
    currentLiabilities = parseFloat(clRow.Summary.ColData?.[1]?.value || '0');
  }

  // Long Term Debt
  const ltdRow = findRowByTitle(rows, /Long Term Debt|Notes Payable/i);
  if (ltdRow && ltdRow.Summary) {
    longTermDebt = parseFloat(ltdRow.Summary.ColData?.[1]?.value || '0');
  }

  // Short Term Debt
  const stdRow = findRowByTitle(rows, /Short Term Debt|Current Portion/i);
  if (stdRow && stdRow.Summary) {
    shortTermDebt = parseFloat(stdRow.Summary.ColData?.[1]?.value || '0');
  }

  return { cash, ar, inventory, undeposited, fixedAssets, currentLiabilities, longTermDebt, shortTermDebt };
}

// ─── PARSE PROFIT & LOSS ──────────────────────────────────────────────
function parseProfitAndLoss(data: any) {
  const rows = data?.Rows?.Row || [];
  
  let revenue = 0, netIncome = 0, depreciation = 0, operatingExpenses = 0, costOfGoodsSold = 0, interestExpense = 0;

  // Income
  const incomeRow = findRowByTitle(rows, /Income/i);
  if (incomeRow && incomeRow.Rows?.Row) {
    for (const subRow of incomeRow.Rows.Row) {
      if (subRow.type === 'Data') {
        const amount = parseFloat(subRow?.ColData?.[1]?.value || '0');
        revenue += amount;
      }
    }
  }

  // Net Income
  const niRow = findRowByTitle(rows, /Net Income/i);
  if (niRow) {
    netIncome = extractValue(niRow);
    if (netIncome === 0 && niRow.Summary) {
      netIncome = parseFloat(niRow.Summary.ColData?.[1]?.value || '0');
    }
  }

  // Depreciation
  const depRow = findRowByTitle(rows, /Depreciation/i);
  if (depRow) {
    depreciation = extractValue(depRow);
    if (depreciation === 0 && depRow.Summary) {
      depreciation = parseFloat(depRow.Summary.ColData?.[1]?.value || '0');
    }
  }

  // Operating Expenses
  const opexRow = findRowByTitle(rows, /Expenses|Operating Expenses/i);
  if (opexRow) {
    operatingExpenses = extractValue(opexRow);
    if (operatingExpenses === 0 && opexRow.Summary) {
      operatingExpenses = parseFloat(opexRow.Summary.ColData?.[1]?.value || '0');
    }
  }

  // Cost of Goods Sold
  const cogsRow = findRowByTitle(rows, /Cost of Goods Sold|COGS/i);
  if (cogsRow) {
    costOfGoodsSold = extractValue(cogsRow);
    if (costOfGoodsSold === 0 && cogsRow.Summary) {
      costOfGoodsSold = parseFloat(cogsRow.Summary.ColData?.[1]?.value || '0');
    }
  }

  // Interest Expense
  const intRow = findRowByTitle(rows, /Interest Expense|Interest/i);
  if (intRow) {
    interestExpense = extractValue(intRow);
    if (interestExpense === 0 && intRow.Summary) {
      interestExpense = parseFloat(intRow.Summary.ColData?.[1]?.value || '0');
    }
  }

  return { revenue, netIncome, depreciation, operatingExpenses, costOfGoodsSold, interestExpense };
}

// ─── HELPER: Get year-to-date range for a given as-of date ────────────
function getYearToDateRange(asOfDate: string): { startDate: string; endDate: string } {
  const date = new Date(asOfDate + 'T00:00:00');
  const year = date.getFullYear();
  const startDate = `${year}-01-01`;
  const endDate = asOfDate;
  return { startDate, endDate };
}

// ─── HELPER: Get prior year same-period range ─────────────────────────
function getPriorYearRange(asOfDate: string): { startDate: string; endDate: string } {
  const date = new Date(asOfDate + 'T00:00:00');
  const priorYear = date.getFullYear() - 1;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const startDate = `${priorYear}-01-01`;
  const endDate = `${priorYear}-${month}-${day}`;
  return { startDate, endDate };
}

// ─── FETCH BALANCE SHEET FOR A DATE RANGE ────────────────────────────
// CRITICAL: BalanceSheet requires BOTH start_date AND end_date.
// Passing only `date` is silently ignored by QBO and returns current YTD.
async function fetchBalanceSheet(token: string, realmId: string, startDate: string, endDate: string) {
  console.log(`📊 Fetching Balance Sheet for range: ${startDate} to ${endDate}`);
  
  const bsUrl = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/reports/BalanceSheet?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Total`;
  console.log(`📊 Balance Sheet URL: ${bsUrl}`);
  
  const bsResponse = await fetch(bsUrl, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  if (!bsResponse.ok) {
    const errorText = await bsResponse.text();
    console.error(`❌ Balance Sheet failed for ${startDate} to ${endDate}:`, errorText);
    return { cash: 0, ar: 0, inventory: 0, undeposited: 0, fixedAssets: 0, currentLiabilities: 0, longTermDebt: 0, shortTermDebt: 0 };
  }

  const bsData = await bsResponse.json();
  console.log(`✅ Balance Sheet fetched for ${startDate} to ${endDate}`);
  return parseBalanceSheet(bsData);
}

// ─── FETCH PROFIT & LOSS FOR A DATE RANGE ─────────────────────────────
async function fetchProfitAndLoss(token: string, realmId: string, startDate: string, endDate: string) {
  console.log(`📊 Fetching P&L for range: ${startDate} to ${endDate}`);
  
  const pnlUrl = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Total`;
  console.log(`📊 P&L URL: ${pnlUrl}`);
  
  const pnlResponse = await fetch(pnlUrl, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  if (!pnlResponse.ok) {
    const errorText = await pnlResponse.text();
    console.error(`❌ P&L failed for ${startDate} to ${endDate}:`, errorText);
    return { revenue: 0, netIncome: 0, depreciation: 0, operatingExpenses: 0, costOfGoodsSold: 0, interestExpense: 0 };
  }

  const pnlData = await pnlResponse.json();
  console.log(`✅ P&L fetched for ${startDate} to ${endDate}`);
  return parseProfitAndLoss(pnlData);
}

// ─── MAIN ROUTE ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const token = await getValidAccessToken();
    const realmId = getRealmId();

    if (!token || !realmId) {
      return NextResponse.json({ error: 'Not connected to QuickBooks' }, { status: 401 });
    }

    const url = new URL(req.url);
    const asOfDate = url.searchParams.get('asOfDate') || new Date().toISOString().split('T')[0];

    // Determine date ranges
    const currentRange = getYearToDateRange(asOfDate);
    const priorRange = getPriorYearRange(asOfDate);

    console.log(`\n📌 ===== FETCHING DATA =====`);
    console.log(`📌 Current period: ${currentRange.startDate} to ${currentRange.endDate}`);
    console.log(`📌 Prior period: ${priorRange.startDate} to ${priorRange.endDate}`);
    console.log(`📌 =========================\n`);

    // Fetch current year data (Balance Sheet YTD + P&L YTD)
    const [currentBalanceSheet, currentPnL] = await Promise.all([
      fetchBalanceSheet(token, realmId, currentRange.startDate, currentRange.endDate),
      fetchProfitAndLoss(token, realmId, currentRange.startDate, currentRange.endDate),
    ]);

    // Fetch prior year data (Balance Sheet same period + P&L same period)
    const [priorBalanceSheet, priorPnL] = await Promise.all([
      fetchBalanceSheet(token, realmId, priorRange.startDate, priorRange.endDate),
      fetchProfitAndLoss(token, realmId, priorRange.startDate, priorRange.endDate),
    ]);

    const currentData = { ...currentBalanceSheet, ...currentPnL };
    const priorData = { ...priorBalanceSheet, ...priorPnL };

    console.log(`\n📌 ===== RESULTS =====`);
    console.log(`📌 Current data:`, currentData);
    console.log(`📌 Prior data:`, priorData);
    console.log(`📌 ===================\n`);

    // Calculate monthly burn from current year operating expenses
    const monthlyBurn = currentData.operatingExpenses > 0 ? currentData.operatingExpenses / 12 : 0;

    const metrics = {
      Cash: { prior: priorData.cash || 0, current: currentData.cash || 0 },
      AccountsReceivable: { prior: priorData.ar || 0, current: currentData.ar || 0 },
      Inventory: { prior: priorData.inventory || 0, current: currentData.inventory || 0 },
      UndepositedFunds: { prior: priorData.undeposited || 0, current: currentData.undeposited || 0 },
      FixedAssets: { prior: priorData.fixedAssets || 0, current: currentData.fixedAssets || 0 },
      CurrentLiabilities: { prior: priorData.currentLiabilities || 0, current: currentData.currentLiabilities || 0 },
      LongTermDebt: { prior: priorData.longTermDebt || 0, current: currentData.longTermDebt || 0 },
      ShortTermDebt: { prior: priorData.shortTermDebt || 0, current: currentData.shortTermDebt || 0 },
      Revenue: { prior: priorData.revenue || 0, current: currentData.revenue || 0 },
      NetIncome: { prior: priorData.netIncome || 0, current: currentData.netIncome || 0 },
      Depreciation: { prior: priorData.depreciation || 0, current: currentData.depreciation || 0 },
      OperatingExpenses: { prior: priorData.operatingExpenses || 0, current: currentData.operatingExpenses || 0 },
      CostOfGoodsSold: { prior: priorData.costOfGoodsSold || 0, current: currentData.costOfGoodsSold || 0 },
      InterestExpense: { prior: priorData.interestExpense || 0, current: currentData.interestExpense || 0 },
      MonthlyBurn: monthlyBurn,
    };

    const syncInfo = {
      last_sync: new Date().toISOString(),
      as_of_date: asOfDate,
      current_period_start: currentRange.startDate,
      current_period_end: currentRange.endDate,
      prior_period_start: priorRange.startDate,
      prior_period_end: priorRange.endDate,
      source: 'live',
    };

    return NextResponse.json({
      metrics,
      sync_info: syncInfo,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}