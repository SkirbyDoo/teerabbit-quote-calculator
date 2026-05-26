# Google Sheets Setup Guide

Follow these steps to connect your own pricing data to the calculator.

---

## Step 1 — Create a new Google Sheet

Go to sheets.google.com and create a blank spreadsheet. Name it something like **TeeRabbit Pricing**.

---

## Step 2 — Create these 5 tabs (exact names don't matter, you'll use the GIDs)

### Tab 1: Garments
| id | name | brand | category | base_price |
|----|------|-------|----------|------------|
| g1 | Heavy Cotton Tee | Gildan | Standard | 3.50 |
| g2 | Unisex Jersey Tee | Bella+Canvas | Premium | 6.25 |
| g3 | CVC Crew Tee | Next Level | Premium | 6.75 |
| g4 | Essential Tee | Port & Company | Budget | 2.75 |
| g5 | Unisex Lightweight Hoodie | Bella+Canvas | Hoodie | 18.00 |
| g6 | Heavy Blend Hoodie | Gildan | Hoodie | 12.50 |

> `category` must be one of: **Budget**, **Standard**, **Premium**, **Hoodie**

---

### Tab 2: Screen Print Tiers
Price per shirt **per location** based on ink colors and quantity.
First column = `colors`, remaining columns = quantity breakpoints (header row must match exactly).

| colors | 36 | 48 | 72 | 144 | 250 | 500 | 1000 | 2500 | 5000 |
|--------|------|------|------|------|------|------|------|------|------|
| 1 | 5.78 | 3.75 | 2.45 | 2.07 | 1.91 | 1.73 | 1.61 | 1.49 | 1.41 |
| 2 | 8.72 | 5.33 | 3.69 | 2.83 | 2.26 | 2.03 | 1.83 | 1.65 | 1.49 |
| 3 | 11.66 | 6.93 | 4.91 | 3.47 | 2.77 | 2.33 | 2.05 | 1.80 | 1.59 |
| 4 | 14.60 | 8.55 | 6.14 | 4.25 | 3.15 | 2.64 | 2.27 | 1.94 | 1.68 |
| 5 | 17.56 | 10.14 | 7.33 | 4.87 | 3.52 | 2.94 | 2.51 | 2.11 | 1.77 |
| 6 | 20.49 | 11.71 | 8.47 | 5.62 | 4.00 | 3.22 | 2.72 | 2.25 | 1.85 |
| 7 | 23.44 | 13.33 | 9.69 | 6.28 | 4.39 | 3.54 | 2.94 | 2.41 | 1.93 |
| 8 | 26.38 | 14.94 | 10.90 | 7.03 | 4.76 | 3.85 | 3.15 | 2.55 | 2.04 |
| 9 | 29.32 | 16.55 | 12.13 | 7.67 | 5.15 | 4.16 | 3.38 | 2.69 | 2.13 |
| 10 | 32.26 | 18.14 | 13.35 | 8.44 | 5.64 | 4.45 | 3.61 | 2.85 | 2.21 |
| 11 | 35.21 | 19.75 | 14.48 | 9.08 | 6.02 | 4.75 | 3.82 | 2.99 | 2.29 |
| 12 | 38.15 | 21.35 | 15.71 | 9.85 | 6.41 | 5.06 | 4.06 | 3.15 | 2.40 |
| 13 | 41.10 | 22.95 | 16.91 | 10.47 | 6.89 | 5.34 | 4.26 | 3.29 | 2.49 |

> To add quantity tiers (e.g. 10000), just add a new column with that number as the header.  
> To add more color rows (e.g. 14), just add a new row. Update `screen_print_max_colors` in Settings accordingly.

---

### Tab 3: DTF Pricing
Price per print location per shirt (no setup fee).

| min_qty | max_qty | price_per_location |
|---------|---------|-------------------|
| 1 | 11 | 6.00 |
| 12 | 23 | 5.00 |
| 24 | 47 | 4.00 |
| 48 | 9999 | 3.50 |

---

### Tab 4: Size Upcharges
Extra cost per shirt for larger sizes.

| size | upcharge |
|------|----------|
| S | 0 |
| M | 0 |
| L | 0 |
| XL | 0 |
| 2XL | 2.00 |
| 3XL | 3.00 |
| 4XL | 4.00 |

---

### Tab 5: Settings
| key | value |
|-----|-------|
| screen_print_setup_fee_per_color | 25.00 |
| screen_print_min_qty | 12 |
| screen_print_min_order | 150.00 |

> `screen_print_setup_fee_per_color` — one-time fee per color per location  
> `screen_print_min_qty` — minimum pieces to use screen printing  
> `screen_print_min_order` — minimum order total (after shirt cost) to use screen printing

---

## Step 3 — Share the sheet publicly

1. Click **Share** (top right)
2. Click **Change to anyone with the link**
3. Set role to **Viewer**
4. Click **Done**

---

## Step 4 — Get the Sheet ID

Look at your browser URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit
```
Copy everything between `/d/` and `/edit`.

---

## Step 5 — Get each tab's GID

Click on each tab at the bottom of the sheet. Look at the URL:
```
https://docs.google.com/spreadsheets/d/.../edit#gid=123456789
```
The number after `gid=` is that tab's GID.

---

## Step 6 — Update config.js

Open `src/config.js` and replace the values:

```js
export const SHEET_ID = 'your-actual-sheet-id-here'

export const GIDS = {
  garments:      '0',        // ← replace with your Garments tab gid
  screenTiers:   '123456',   // ← replace with your Screen Print Tiers tab gid
  dtfPricing:    '234567',   // ← replace with your DTF Pricing tab gid
  sizeUpcharges: '345678',   // ← replace with your Size Upcharges tab gid
  settings:      '456789',   // ← replace with your Settings tab gid
}
```

Save the file. The calculator will reload automatically and pull live data from your sheet.
