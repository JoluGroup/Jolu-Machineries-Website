# M2 integration release candidate: evidence

Branch `integration/m2-machineries-release` = main 6244d87 + PR #11 (6c792d0, contains PR #9 f4639f4) + PR #10 (4504a51).

Integration-specific commits: merge conflict resolution (ResponsiveImage in ProductList, unified test script),
Header/Footer on /products, hero failed-image fix, integration tests.

- `scripts/` Playwright harnesses (hero adversarial, catalogue acceptance, screenshots, route sweep, perf).
- `perf-integration-candidate.txt` median-of-3 throttled mobile run (412x823 @2x, 1.6 Mbps, 150 ms RTT, 4x CPU).
- `screenshots/` desktop + mobile visual package. Owner visual approval has NOT been given.

Not deployed. Do not merge without explicit owner authorization.
