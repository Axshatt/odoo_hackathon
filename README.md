# Brightloop

A responsive subscription-management frontend built with Next.js App Router, React, TypeScript, Tailwind CSS and Framer Motion.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` creates the production build; `npm start` serves it. `npm run typecheck` and `npm test` verify types and billing rules.

## Demo walkthrough

1. Choose Admin in the header and create a subscription.
2. Open the subscription and advance Draft → Quotation → Confirmed → Active.
3. Generate an invoice, review its discount and tax, and confirm it.
4. Record a full payment. The invoice becomes Paid, collected revenue updates, and the subscription advances to its next billing period.
5. Switch to Customer to see only Linear Studio's subscriptions and invoices. Browse plans to add a subscription; pause, resume or close existing subscriptions.
6. Switch to Staff to access operations without admin plan creation, billing defaults or team management.

Other features: searchable subscriptions and invoices, status filters, CSV invoice export, printable invoices, plan creation, staff entries, account-screen previews, persisted light/dark appearance, and browser-local persistence.

## Architecture

- `app/page.tsx`: server-rendered entry point.
- `app/layout.tsx`: metadata and global stylesheet.
- `app/globals.css`: design tokens, layouts, responsive breakpoints and reduced-motion handling.
- `components/workspace.tsx`: interactive workspace, reusable dialog, fields, status badges, metrics and chart.
- `lib/billing.ts`: typed records, seed data, invoice calculation and calendar-safe renewals.
- `lib/billing.test.ts`: billing and renewal regression checks.

## Design choices

Near-black text, off-white canvas, white surfaces and one interactive accent (#0071e3). Restrained sage and amber distinguish operational status. Native system typography avoids external font requests. Headlines use tight tracking; tables use tabular numerals. Radii vary from 10–12 px controls to 22–26 px panels and dialogs. Hairline borders and low-opacity shadows keep depth quiet.

UI springs: stiffness 340, damping 32, mass 1. Page transitions use 12 px travel over 250 ms. Plan cards lift 4 px on hover. Reduced motion is honored by MotionConfig and CSS. Glass is limited to the sticky header. Billing pages intentionally use smaller headlines than marketing pages to preserve information density.

## Scope and honest limitations

This is a frontend demonstration, not a production billing or authentication service. Demo data is stored in localStorage under `brightloop-v1`. Roles are UI previews, not security boundaries. Password/signup/reset forms demonstrate validation but do not create accounts or send email. Payments do not charge money. Historical chart points are illustrative and labeled; current metrics come from demo records.

The broader problem statement's product variants, quotation templates, daily/weekly plans, scheduled billing workers, plan-specific lifecycle permissions, full discount eligibility/expiry/use limits, partial payments, email delivery, real identity and backend authorization are not implemented. The existing demo focuses on the agreed subscription-to-payment presentation flow. Thousands-of-record performance has not been benchmarked.

Replace local state with authenticated API services before connecting real customer or payment data. Browser data can be reset by clearing this site's storage.
