/**
 * Sample Exhibit Data — Coffee Wars Case
 *
 * Hardcoded realistic data for all 14 exhibits in the CCD vs Starbucks case study.
 */

import type { Exhibit } from './types';

const BURGUNDY = '#8B1A4A';
const BURGUNDY_LIGHT = '#C2185B';
const GOLD = '#D4A843';
const STEEL_BLUE = '#4682B4';
const TEAL = '#2A9D8F';

export const coffeeWarsExhibits: Exhibit[] = [
  {
    id: 'exhibit-1',
    exhibitNumber: 1,
    title: "India's Coffee Market",
    type: 'table',
    description: 'Coffee production, exports, and domestic consumption in India (2010–2015)',
    data: {
      columns: ['Year', 'Production (tons)', 'Exports (tons)', 'Domestic (tons)', 'Export Share (%)'],
      rows: [
        { 'Year': '2010', 'Production (tons)': 302000, 'Exports (tons)': 215000, 'Domestic (tons)': 87000, 'Export Share (%)': 71.2 },
        { 'Year': '2011', 'Production (tons)': 314000, 'Exports (tons)': 220000, 'Domestic (tons)': 94000, 'Export Share (%)': 70.1 },
        { 'Year': '2012', 'Production (tons)': 285000, 'Exports (tons)': 198000, 'Domestic (tons)': 87000, 'Export Share (%)': 69.5 },
        { 'Year': '2013', 'Production (tons)': 297000, 'Exports (tons)': 210000, 'Domestic (tons)': 87000, 'Export Share (%)': 70.7 },
        { 'Year': '2014', 'Production (tons)': 310000, 'Exports (tons)': 218000, 'Domestic (tons)': 92000, 'Export Share (%)': 70.3 },
        { 'Year': '2015', 'Production (tons)': 320000, 'Exports (tons)': 225000, 'Domestic (tons)': 95000, 'Export Share (%)': 70.3 },
      ],
    },
    caption: 'Coffee production in India has grown steadily, with exports accounting for ~70% of total output.',
    source: 'National Coffee Promotion Council, India',
  },
  {
    id: 'exhibit-2',
    exhibitNumber: 2,
    title: "India's Specialist Coffee Chains",
    type: 'table',
    description: 'Major specialist coffee chains operating in India as of 2010',
    data: {
      columns: ['Brand', 'Origin', 'Stores (India)', 'Year Entered India', 'Positioning'],
      rows: [
        { 'Brand': 'Coffee Day (CCD)', 'Origin': 'India', 'Stores (India)': 1500, 'Year Entered India': 1996, 'Positioning': 'Mass market / value' },
        { 'Brand': 'Starbucks', 'Origin': 'USA', 'Stores (India)': 12, 'Year Entered India': 2012, 'Positioning': 'Premium / experience' },
        { 'Brand': 'Barista', 'Origin': 'India', 'Stores (India)': 80, 'Year Entered India': 2002, 'Positioning': 'Mid-premium' },
        { 'Brand': 'Third Wave', 'Origin': 'India', 'Stores (India)': 15, 'Year Entered India': 2008, 'Positioning': 'Specialty / artisan' },
        { 'Brand': 'Blue Token', 'Origin': 'India', 'Stores (India)': 25, 'Year Entered India': 2007, 'Positioning': 'Mid-market' },
        { 'Brand': 'Coffee Bean', 'Origin': 'India', 'Stores (India)': 10, 'Year Entered India': 2009, 'Positioning': 'Premium' },
      ],
    },
    caption: 'CCD dominates the Indian specialist coffee market with 1,500 stores, while Starbucks is a new entrant.',
    source: 'Company filings and industry reports',
  },
  {
    id: 'exhibit-3',
    exhibitNumber: 3,
    title: 'Global Coffee Market Overview',
    type: 'table',
    description: 'Global coffee consumption by region',
    data: {
      columns: ['Region', 'Consumption (M bags)', 'Growth Rate (%)', 'Per Capita (kg/yr)'],
      rows: [
        { 'Region': 'Europe', 'Consumption (M bags)': 29.5, 'Growth Rate (%)': 0.8, 'Per Capita (kg/yr)': 5.8 },
        { 'Region': 'North America', 'Consumption (M bags)': 13.2, 'Growth Rate (%)': 1.2, 'Per Capita (kg/yr)': 9.9 },
        { 'Region': 'Asia-Pacific', 'Consumption (M bags)': 5.1, 'Growth Rate (%)': 4.5, 'Per Capita (kg/yr)': 0.4 },
        { 'Region': 'Latin America', 'Consumption (M bags)': 7.8, 'Growth Rate (%)': 1.5, 'Per Capita (kg/yr)': 2.1 },
        { 'Region': 'Middle East & Africa', 'Consumption (M bags)': 1.9, 'Growth Rate (%)': 2.0, 'Per Capita (kg/yr)': 0.5 },
      ],
    },
    caption: 'Asia-Pacific shows the highest growth rate at 4.5%, driven by urbanization in India and China.',
    source: 'International Coffee Organization',
  },
  {
    id: 'exhibit-4',
    exhibitNumber: 4,
    title: 'Economics of a CCD Café',
    type: 'table',
    description: 'P&L breakdown for a typical CCD café in India',
    data: {
      columns: ['Item', 'Annual (₹ lakhs)', '% of Revenue'],
      rows: [
        { 'Item': 'Revenue', 'Annual (₹ lakhs)': 180, '% of Revenue': 100.0 },
        { 'Item': '  Coffee & food COGS', 'Annual (₹ lakhs)': -54, '% of Revenue': -30.0 },
        { 'Item': '  Gross Profit', 'Annual (₹ lakhs)': 126, '% of Revenue': 70.0 },
        { 'Item': '  Rent', 'Annual (₹ lakhs)': -36, '% of Revenue': -20.0 },
        { 'Item': '  Labor', 'Annual (₹ lakhs)': -32, '% of Revenue': -18.0 },
        { 'Item': '  Utilities', 'Annual (₹ lakhs)': -9, '% of Revenue': -5.0 },
        { 'Item': '  Marketing', 'Annual (₹ lakhs)': -5.4, '% of Revenue': -3.0 },
        { 'Item': '  Depreciation', 'Annual (₹ lakhs)': -7.2, '% of Revenue': -4.0 },
        { 'Item': '  Other expenses', 'Annual (₹ lakhs)': -5.4, '% of Revenue': -3.0 },
        { 'Item': 'EBITDA', 'Annual (₹ lakhs)': 31, '% of Revenue': 17.2 },
      ],
    },
    caption: 'A typical CCD café generates ₹180 lakhs in annual revenue with 17.2% EBITDA margins.',
    source: 'Coffee Day Enterprises internal data',
  },
  {
    id: 'exhibit-5',
    exhibitNumber: 5,
    title: 'A CCD Lounge',
    type: 'photo',
    description: 'Interior photograph of a typical CCD Lounge format store',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
    caption: 'CCD Lounge format offers a premium seating experience with comfortable sofas and ambient lighting.',
    source: 'Coffee Day Enterprises',
  },
  {
    id: 'exhibit-6',
    exhibitNumber: 6,
    title: 'CCD Square',
    type: 'photo',
    description: 'Exterior view of a CCD Square format outlet',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
    caption: 'CCD Square is a compact, high-traffic format designed for mall and airport locations.',
    source: 'Coffee Day Enterprises',
  },
  {
    id: 'exhibit-7',
    exhibitNumber: 7,
    title: "CCD's Service Formats",
    type: 'table',
    description: 'Comparison of CCD store formats',
    data: {
      columns: ['Format', 'Size (sq ft)', 'Avg. Daily Cups', 'Avg. Ticket (₹)', 'Setup Cost (₹L)'],
      rows: [
        { 'Format': 'CCD Lounge', 'Size (sq ft)': 3500, 'Avg. Daily Cups': 350, 'Avg. Ticket (₹)': 180, 'Setup Cost (₹L)': 45 },
        { 'Format': 'CCD Square', 'Size (sq ft)': 1200, 'Avg. Daily Cups': 250, 'Avg. Ticket (₹)': 150, 'Setup Cost (₹L)': 20 },
        { 'Format': 'CCD Express', 'Size (sq ft)': 500, 'Avg. Daily Cups': 200, 'Avg. Ticket (₹)': 120, 'Setup Cost (₹L)': 10 },
        { 'Format': 'CCD Kiosk', 'Size (sq ft)': 200, 'Avg. Daily Cups': 150, 'Avg. Ticket (₹)': 100, 'Setup Cost (₹L)': 5 },
      ],
    },
    caption: 'CCD operates four formats ranging from full-service lounges to compact kiosks.',
    source: 'Coffee Day Enterprises',
  },
  {
    id: 'exhibit-8',
    exhibitNumber: 8,
    title: "Starbucks' Global Store Count",
    type: 'table',
    description: 'Starbucks store count by region (fiscal year 2012)',
    data: {
      columns: ['Region', 'Company-Operated', 'Licensed', 'Total', 'YoY Growth (%)'],
      rows: [
        { 'Region': 'United States', 'Company-Operated': 6133, 'Licensed': 0, 'Total': 6133, 'YoY Growth (%)': 3.2 },
        { 'Region': 'China (mainland)', 'Company-Operated': 0, 'Licensed': 1152, 'Total': 1152, 'YoY Growth (%)': 35.3 },
        { 'Region': 'Japan', 'Company-Operated': 0, 'Licensed': 906, 'Total': 906, 'YoY Growth (%)': 10.2 },
        { 'Region': 'Canada', 'Company-Operated': 723, 'Licensed': 0, 'Total': 723, 'YoY Growth (%)': 4.1 },
        { 'Region': 'UK', 'Company-Operated': 426, 'Licensed': 0, 'Total': 426, 'YoY Growth (%)': 15.7 },
        { 'Region': 'South Korea', 'Company-Operated': 0, 'Licensed': 314, 'Total': 314, 'YoY Growth (%)': 23.5 },
        { 'Region': 'Other International', 'Company-Operated': 389, 'Licensed': 1197, 'Total': 1586, 'YoY Growth (%)': 12.8 },
        { 'Region': 'Total', 'Company-Operated': 7671, 'Licensed': 3569, 'Total': 11240, 'YoY Growth (%)': 8.4 },
      ],
    },
    caption: 'Starbucks operated 11,240 stores globally in FY2012, with strong growth in China and emerging markets.',
    source: 'Starbucks Corporation Annual Report 2012',
  },
  {
    id: 'exhibit-9',
    exhibitNumber: 9,
    title: 'Starbucks Financial Data',
    type: 'table',
    description: 'Starbucks revenue and operating income (fiscal years 2008–2012)',
    data: {
      columns: ['FY', 'Revenue ($M)', 'Operating Income ($M)', 'Op. Margin (%)', 'Net Income ($M)', 'EPS ($)'],
      rows: [
        { 'FY': '2008', 'Revenue ($M)': 14012, 'Operating Income ($M)': 1013, 'Op. Margin (%)': 7.2, 'Net Income ($M)': 477, 'EPS ($)': 0.72 },
        { 'FY': '2009', 'Revenue ($M)': 14140, 'Operating Income ($M)': 1428, 'Op. Margin (%)': 10.1, 'Net Income ($M)': 840, 'EPS ($)': 1.23 },
        { 'FY': '2010', 'Revenue ($M)': 15387, 'Operating Income ($M)': 1806, 'Op. Margin (%)': 11.7, 'Net Income ($M)': 1105, 'EPS ($)': 1.57 },
        { 'FY': '2011', 'Revenue ($M)': 16105, 'Operating Income ($M)': 2093, 'Op. Margin (%)': 13.0, 'Net Income ($M)': 1393, 'EPS ($)': 1.93 },
        { 'FY': '2012', 'Revenue ($M)': 16137, 'Operating Income ($M)': 2315, 'Op. Margin (%)': 14.3, 'Net Income ($M)': 1412, 'EPS ($)': 1.94 },
      ],
    },
    caption: 'Starbucks has consistently improved operating margins from 7.2% in FY2008 to 14.3% in FY2012.',
    source: 'Starbucks Corporation Annual Reports',
  },
  {
    id: 'exhibit-10',
    exhibitNumber: 10,
    title: 'Starbucks Revenue Breakdown',
    type: 'chart',
    description: 'Revenue by segment for fiscal year 2012',
    data: {
      columns: ['Segment', 'Revenue ($M)', 'Percentage (%)'],
      rows: [
        { 'Segment': 'Company-Operated Stores', 'Revenue ($M)': 11423, 'Percentage (%)': 70.8 },
        { 'Segment': 'Licensed Stores', 'Revenue ($M)': 2421, 'Percentage (%)': 15.0 },
        { 'Segment': 'Coffee & Tea Equipment', 'Revenue ($M)': 1049, 'Percentage (%)': 6.5 },
        { 'Segment': 'Consumer Products', 'Revenue ($M)': 726, 'Percentage (%)': 4.5 },
        { 'Segment': 'Other', 'Revenue ($M)': 518, 'Percentage (%)': 3.2 },
      ],
      chartType: 'pie',
      xKey: 'Segment',
      yKeys: ['Revenue ($M)'],
      colors: [BURGUNDY, BURGUNDY_LIGHT, GOLD, TEAL, STEEL_BLUE],
    },
    caption: 'Company-operated stores generate 70.8% of Starbucks revenue, with licensed stores contributing 15%.',
    source: 'Starbucks Corporation Annual Report 2012',
  },
  {
    id: 'exhibit-11',
    exhibitNumber: 11,
    title: "CCD and Starbucks' In-Store Sales Mix",
    type: 'table',
    description: 'Comparison of product category revenue mix',
    data: {
      columns: ['Category', 'CCD (%)', 'Starbucks (%)'],
      rows: [
        { 'Category': 'Hot Coffee', 'CCD (%)': 42, 'Starbucks (%)': 35 },
        { 'Category': 'Cold Beverages', 'CCD (%)': 18, 'Starbucks (%)': 25 },
        { 'Category': 'Tea & Other Drinks', 'CCD (%)': 10, 'Starbucks (%)': 10 },
        { 'Category': 'Food & Pastries', 'CCD (%)': 22, 'Starbucks (%)': 20 },
        { 'Category': 'Merchandise', 'CCD (%)': 8, 'Starbucks (%)': 10 },
      ],
    },
    caption: 'CCD has a higher proportion of hot coffee sales (42%) vs Starbucks (35%), reflecting different consumer preferences.',
    source: 'Industry analysis',
  },
  {
    id: 'exhibit-12',
    exhibitNumber: 12,
    title: "Tata Group's Hotel and Retail Properties",
    type: 'table',
    description: 'Key Tata properties that could host Starbucks outlets',
    data: {
      columns: ['Property', 'Type', 'Cities', 'Potential Stores'],
      rows: [
        { 'Property': 'Tata Hotels', 'Type': 'Hotels', 'Cities': 25, 'Potential Stores': 25 },
        { 'Property': 'Big Bazaar', 'Type': 'Hypermarkets', 'Cities': 60, 'Potential Stores': 60 },
        { 'Property': 'Westside', 'Type': 'Department Stores', 'Cities': 45, 'Potential Stores': 45 },
        { 'Property': 'Tata Power CFL', 'Type': 'Showrooms', 'Cities': 100, 'Potential Stores': 30 },
        { 'Property': 'Tata Group Airports', 'Type': 'Airports', 'Cities': 8, 'Potential Stores': 8 },
        { 'Property': 'Tata Group Malls', 'Type': 'Shopping Malls', 'Cities': 15, 'Potential Stores': 20 },
      ],
    },
    caption: 'Tata Group properties provide over 180 potential locations for Starbucks stores across India.',
    source: 'Tata Group annual reports and property listings',
  },
  {
    id: 'exhibit-13',
    exhibitNumber: 13,
    title: 'Starbucks India',
    type: 'photo',
    description: 'Interior of a Starbucks store in India',
    imageUrl: 'https://images.unsplash.com/photo-1559496417-e73224229177?w=800&h=600&fit=crop',
    caption: 'Starbucks stores in India blend global branding with local design elements.',
    source: 'Starbucks Corporation',
  },
  {
    id: 'exhibit-14',
    exhibitNumber: 14,
    title: 'Age Distribution of Indian Population',
    type: 'chart',
    description: 'Population pyramid showing age distribution (millions)',
    data: {
      columns: ['Age Group', 'Male (millions)', 'Female (millions)', 'Total (millions)'],
      rows: [
        { 'Age Group': '0-9', 'Male (millions)': 120, 'Female (millions)': 112, 'Total (millions)': 232 },
        { 'Age Group': '10-19', 'Male (millions)': 125, 'Female (millions)': 118, 'Total (millions)': 243 },
        { 'Age Group': '20-29', 'Male (millions)': 130, 'Female (millions)': 122, 'Total (millions)': 252 },
        { 'Age Group': '30-39', 'Male (millions)': 115, 'Female (millions)': 108, 'Total (millions)': 223 },
        { 'Age Group': '40-49', 'Male (millions)': 85, 'Female (millions)': 80, 'Total (millions)': 165 },
        { 'Age Group': '50-59', 'Male (millions)': 55, 'Female (millions)': 52, 'Total (millions)': 107 },
        { 'Age Group': '60-69', 'Male (millions)': 30, 'Female (millions)': 28, 'Total (millions)': 58 },
        { 'Age Group': '70+', 'Male (millions)': 15, 'Female (millions)': 14, 'Total (millions)': 29 },
      ],
      chartType: 'bar',
      xKey: 'Age Group',
      yKeys: ['Male (millions)', 'Female (millions)'],
      colors: [STEEL_BLUE, BURGUNDY_LIGHT],
    },
    caption: 'India has a young population with 727 million people aged 0-29, representing a large addressable market.',
    source: 'Census of India 2011, projected',
  },
];

export function getExhibitsForCase(caseId: string): Exhibit[] {
  if (caseId === 'coffee-wars' || caseId === 'default') {
    return coffeeWarsExhibits;
  }
  return [];
}
