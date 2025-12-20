```shell
node ./divortio-cryptoXOR/bench/benchmark.integrity.node.mjs


================================================================================
CRYPTO INTEGRITY BENCHMARK
================================================================================
Time:      2025-12-18T02:56:59.454Z
Node:      v24.10.0
CPU:       Intel(R) Core(TM) i7-4870HQ CPU @ 2.50GHz (8 Cores)
RAM:       16.0 GB
Config:    50 Samples per test
================================================================================


--- Test Suite: 16 B ---
  Running HMAC-SHA256 (Node)   ... Done. (4.09 MB/s)
  Running AES-GMAC (Node)      ... Done. (2.74 MB/s)
  Running Poly1305 (Node)      ... Done. (2.86 MB/s)
  Running Chaskey (JS)         ... Done. (23.91 MB/s)
  Running Poly1305 (JS)        ... Done. (132.60 MB/s)
  Running SipHash-2-4 (JS)     ... Done. (53.26 MB/s)
  Running Ascon-Mac (JS)       ... Done. (10.61 MB/s)

--- Test Suite: 64 B ---
  Running HMAC-SHA256 (Node)   ... Done. (15.86 MB/s)
  Running AES-GMAC (Node)      ... Done. (11.47 MB/s)
  Running Poly1305 (Node)      ... Done. (11.70 MB/s)
  Running Chaskey (JS)         ... Done. (80.69 MB/s)
  Running Poly1305 (JS)        ... Done. (137.96 MB/s)
  Running SipHash-2-4 (JS)     ... Done. (58.01 MB/s)
  Running Ascon-Mac (JS)       ... Done. (29.58 MB/s)

--- Test Suite: 1 KB ---
  Running HMAC-SHA256 (Node)   ... Done. (164.43 MB/s)
  Running AES-GMAC (Node)      ... Done. (177.20 MB/s)
  Running Poly1305 (Node)      ... Done. (177.61 MB/s)
  Running Chaskey (JS)         ... Done. (434.24 MB/s)
  Running Poly1305 (JS)        ... Done. (151.23 MB/s)
  Running SipHash-2-4 (JS)     ... Done. (57.73 MB/s)
  Running Ascon-Mac (JS)       ... Done. (82.65 MB/s)

--- Test Suite: 16 KB ---
  Running HMAC-SHA256 (Node)   ... Done. (369.07 MB/s)
  Running AES-GMAC (Node)      ... Done. (1963.79 MB/s)
  Running Poly1305 (Node)      ... Done. (1666.16 MB/s)
  Running Chaskey (JS)         ... Done. (532.65 MB/s)
  Running Poly1305 (JS)        ... Done. (137.61 MB/s)
  Running SipHash-2-4 (JS)     ... Done. (55.28 MB/s)
  Running Ascon-Mac (JS)       ... Done. (87.87 MB/s)

--- Test Suite: 64 KB ---
  Running HMAC-SHA256 (Node)   ... Done. (377.12 MB/s)
  Running AES-GMAC (Node)      ... Done. (4006.74 MB/s)
  Running Poly1305 (Node)      ... Done. (3236.87 MB/s)
  Running Chaskey (JS)         ... Done. (578.03 MB/s)
  Running Poly1305 (JS)        ... Done. (155.66 MB/s)
  Running SipHash-2-4 (JS)     ... Done. (60.12 MB/s)
  Running Ascon-Mac (JS)       ... Done. (91.74 MB/s)


================================================================================
FINAL RESULTS: THROUGHPUT (MB/s)
================================================================================
┌────────────────────┬──────────┬──────────┬──────────┬───────────┬───────────┐
│ (index)            │ 16 B     │ 64 B     │ 1 KB     │ 16 KB     │ 64 KB     │
├────────────────────┼──────────┼──────────┼──────────┼───────────┼───────────┤
│ HMAC-SHA256 (Node) │ '4.09'   │ '15.86'  │ '164.43' │ '369.07'  │ '377.12'  │
│ AES-GMAC (Node)    │ '2.74'   │ '11.47'  │ '177.20' │ '1963.79' │ '4006.74' │
│ Poly1305 (Node)    │ '2.86'   │ '11.70'  │ '177.61' │ '1666.16' │ '3236.87' │
│ Chaskey (JS)       │ '23.91'  │ '80.69'  │ '434.24' │ '532.65'  │ '578.03'  │
│ Poly1305 (JS)      │ '132.60' │ '137.96' │ '151.23' │ '137.61'  │ '155.66'  │
│ SipHash-2-4 (JS)   │ '53.26'  │ '58.01'  │ '57.73'  │ '55.28'   │ '60.12'   │
│ Ascon-Mac (JS)     │ '10.61'  │ '29.58'  │ '82.65'  │ '87.87'   │ '91.74'   │
└────────────────────┴──────────┴──────────┴──────────┴───────────┴───────────┘

================================================================================
LEADERBOARD: Small Packet Latency (64 Bytes)
================================================================================
┌─────────┬──────────────────────┬─────────────┬───────────┬───────────────┐
│ (index) │ Algorithm            │ Ops/Sec     │ Latency   │ Speed         │
├─────────┼──────────────────────┼─────────────┼───────────┼───────────────┤
│ 0       │ 'Poly1305 (JS)'      │ '2,260,368' │ '0.44 µs' │ '137.96 MB/s' │
│ 1       │ 'Chaskey (JS)'       │ '1,322,050' │ '0.76 µs' │ '80.69 MB/s'  │
│ 2       │ 'SipHash-2-4 (JS)'   │ '950,473'   │ '1.05 µs' │ '58.01 MB/s'  │
│ 3       │ 'Ascon-Mac (JS)'     │ '484,669'   │ '2.06 µs' │ '29.58 MB/s'  │
│ 4       │ 'HMAC-SHA256 (Node)' │ '259,901'   │ '3.85 µs' │ '15.86 MB/s'  │
│ 5       │ 'Poly1305 (Node)'    │ '191,746'   │ '5.22 µs' │ '11.70 MB/s'  │
│ 6       │ 'AES-GMAC (Node)'    │ '187,906'   │ '5.32 µs' │ '11.47 MB/s'  │
└─────────┴──────────────────────┴─────────────┴───────────┴───────────────┘

Process finished with exit code 0



```