# Strep Pneumo Titer

A small browser app for interpreting pneumococcal antibody titers.

## Features

- Counts positive titers across a 23-serotype panel.
- Supports age-based default cutoffs: 1.0 for ages 2-5 years old and 1.3 for patients older than 5 years.
- Allows manual cutoff adjustment.
- Calculates vaccine-specific percent positive for PCV13, PCV20, PCV21, and PPSV23 using measured serotypes in the panel.
- Supports pre/post vaccination entry with 2-fold rise ratio display.

## Run locally

Open `index.html` directly in a browser, or run:

```bash
node server.js
```

Then visit `http://localhost:3000`.

## Note

This tool is intended to assist with counting and display. It does not replace clinical judgment or local immunology guidance.
