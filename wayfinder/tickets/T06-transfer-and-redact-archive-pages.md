# T06 — Transfer and redact the archive report pages

Type: wayfinder:task (AFK, owner spot-check at end)
Status: closed (2026-07-13 — 36 shipped; 2 withheld for owner call)
Assignee: Claude (Wave 4 overnight session)
Blocked-by: T03, T05

## Question

Copy the 34 publish-as-is report pages from `UFA Analysis/analysis/reports/` into the location T05 fixes; apply the two mandatory redactions (agm-finance: strip R2 collection-mechanics + ghost finding from Findings AND Method; nq-5: strip the R4 k-core null tiles + finding) and whatever T03 decides for b-tb2 and a-tb1. Clearance table: `UFA Analysis/wayfinder/archive/publication-handoff/assets/T11-page-clearance-list.md`. Record what shipped, what was redacted, and the final page count. The 21 internal-only pages must never be copied.

## Resolution

Shipped on `wave-4-5-data-and-macros` (commit "T06: transfer archive reports"). Full redaction
log in `docs/frisbee-mv-wave-4-5-report.md`.

- **36 pages shipped** to `public/data/` = 34 publish-as-is + agm-finance & nq-5 (redacted as
  ordered) + b-tb2 & a-tb1 (as-is per T03) **minus oms-15 & b-tb1, withheld**: a full-set
  privacy sweep found both carry per-office centrality tables (President/Treasurer/VP/Secretary
  inbound-mention counts, ranks, percentiles) — role-tied load, contradicting their T11
  publish-as-is verdicts. **Owner call needed**; restore = copy the two files + re-add their
  index entries.
- The 21 internal-only pages were never copied (verified by filename sweep).
- Redacted strings verified absent set-wide by grep; no sponsor or personal names anywhere;
  visitor caveats confirmed number-free. Two borderline items shipped with flags: soc-4's
  opaque-id introducer counts (page labels them chat-derived proxy) and oms-6's "exactly one
  paid, zero-attendance patron" sentence.
