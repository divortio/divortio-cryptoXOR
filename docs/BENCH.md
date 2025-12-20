```shell

node ./divortio-cryptoXOR/bench/benchmark.node.mjs

================================================================================
BENCHMARK REPORT
================================================================================
Time:      2025-12-18T03:13:19.623Z
Node:      v24.10.0 (V8 13.6.233.10-node.28)
OS:        Darwin 21.6.0 (x64)
CPU:       Intel(R) Core(TM) i7-4870HQ CPU @ 2.50GHz (8 Cores)
RAM:       16.0 GB
Config:    50 Samples, Max Size 64 MB
================================================================================


--- Test Suite: 16 B ---
  Running sfc32-stream         ... Done. (218.79 MB/s)
  Running splitmix32-stream    ... Done. (220.54 MB/s)
  Running xoshiro128-stream    ... Done. (205.82 MB/s)
  Running sfc32 (core)         ... Done. (190.77 MB/s)
  Running splitmix32 (core)    ... Done. (126.57 MB/s)
  Running xoshiro128 (core)    ... Done. (133.24 MB/s)
  Running chacha20 (native)    ... Done. (14.98 MB/s)
  Running chacha20 (v8)        ... Done. (13.83 MB/s)

--- Test Suite: 64 B ---
  Running sfc32-stream         ... Done. (396.13 MB/s)
  Running splitmix32-stream    ... Done. (333.11 MB/s)
  Running xoshiro128-stream    ... Done. (447.14 MB/s)
  Running sfc32 (core)         ... Done. (184.89 MB/s)
  Running splitmix32 (core)    ... Done. (177.24 MB/s)
  Running xoshiro128 (core)    ... Done. (201.19 MB/s)
  Running chacha20 (native)    ... Done. (57.18 MB/s)
  Running chacha20 (v8)        ... Done. (44.40 MB/s)

--- Test Suite: 512 B ---
  Running sfc32-stream         ... Done. (532.69 MB/s)
  Running splitmix32-stream    ... Done. (578.81 MB/s)
  Running xoshiro128-stream    ... Done. (657.05 MB/s)
  Running sfc32 (core)         ... Done. (216.85 MB/s)
  Running splitmix32 (core)    ... Done. (212.47 MB/s)
  Running xoshiro128 (core)    ... Done. (231.90 MB/s)
  Running chacha20 (native)    ... Done. (326.97 MB/s)
  Running chacha20 (v8)        ... Done. (57.02 MB/s)

--- Test Suite: 1 KB ---
  Running sfc32-stream         ... Done. (550.10 MB/s)
  Running splitmix32-stream    ... Done. (594.51 MB/s)
  Running xoshiro128-stream    ... Done. (684.40 MB/s)
  Running sfc32 (core)         ... Done. (227.35 MB/s)
  Running splitmix32 (core)    ... Done. (220.81 MB/s)
  Running xoshiro128 (core)    ... Done. (235.69 MB/s)
  Running chacha20 (native)    ... Done. (568.10 MB/s)
  Running chacha20 (v8)        ... Done. (57.86 MB/s)

--- Test Suite: 4 KB ---
  Running sfc32-stream         ... Done. (555.48 MB/s)
  Running splitmix32-stream    ... Done. (607.86 MB/s)
  Running xoshiro128-stream    ... Done. (711.83 MB/s)
  Running sfc32 (core)         ... Done. (229.31 MB/s)
  Running splitmix32 (core)    ... Done. (201.38 MB/s)
  Running xoshiro128 (core)    ... Done. (216.80 MB/s)
  Running chacha20 (native)    ... Done. (1075.25 MB/s)
  Running chacha20 (v8)        ... Done. (57.75 MB/s)

--- Test Suite: 16 KB ---
  Running sfc32-stream         ... Done. (555.34 MB/s)
  Running splitmix32-stream    ... Done. (613.26 MB/s)
  Running xoshiro128-stream    ... Done. (679.35 MB/s)
  Running sfc32 (core)         ... Done. (226.04 MB/s)
  Running splitmix32 (core)    ... Done. (222.57 MB/s)
  Running xoshiro128 (core)    ... Done. (236.33 MB/s)
  Running chacha20 (native)    ... Done. (1327.98 MB/s)
  Running chacha20 (v8)        ... Done. (59.88 MB/s)

--- Test Suite: 64 KB ---
  Running sfc32-stream         ... Done. (535.16 MB/s)
  Running splitmix32-stream    ... Done. (612.89 MB/s)
  Running xoshiro128-stream    ... Done. (695.88 MB/s)
  Running sfc32 (core)         ... Done. (221.05 MB/s)
  Running splitmix32 (core)    ... Done. (210.84 MB/s)
  Running xoshiro128 (core)    ... Done. (226.85 MB/s)
  Running chacha20 (native)    ... Done. (1053.99 MB/s)
  Running chacha20 (v8)        ... Done. (59.67 MB/s)

--- Test Suite: 512 KB ---
  Running sfc32-stream         ... Done. (533.36 MB/s)
  Running splitmix32-stream    ... Done. (614.79 MB/s)
  Running xoshiro128-stream    ... Done. (721.97 MB/s)
  Running sfc32 (core)         ... Done. (226.30 MB/s)
  Running splitmix32 (core)    ... Done. (218.73 MB/s)
  Running xoshiro128 (core)    ... Done. (237.32 MB/s)
  Running chacha20 (native)    ... Done. (1203.21 MB/s)
  Running chacha20 (v8)        ... Done. (58.96 MB/s)

--- Test Suite: 1 MB ---
  Running sfc32-stream         ... Done. (567.54 MB/s)
  Running splitmix32-stream    ... Done. (609.44 MB/s)
  Running xoshiro128-stream    ... Done. (699.84 MB/s)
  Running sfc32 (core)         ... Done. (227.94 MB/s)
  Running splitmix32 (core)    ... Done. (215.56 MB/s)
  Running xoshiro128 (core)    ... Done. (235.28 MB/s)
  Running chacha20 (native)    ... Done. (1240.33 MB/s)
  Running chacha20 (v8)        ... Done. (59.14 MB/s)

--- Test Suite: 16 MB ---
  Running sfc32-stream         ... Done. (554.30 MB/s)
  Running splitmix32-stream    ... Done. (608.72 MB/s)
  Running xoshiro128-stream    ... Done. (710.89 MB/s)
  Running sfc32 (core)         ... Done. (222.38 MB/s)
  Running splitmix32 (core)    ... Done. (219.85 MB/s)
  Running xoshiro128 (core)    ... Done. (231.10 MB/s)
  Running chacha20 (native)    ... Done. (1571.47 MB/s)
  Running chacha20 (v8)        ... Done. (59.37 MB/s)

--- Test Suite: 64 MB ---
  Running sfc32-stream         ... Done. (555.85 MB/s)
  Running splitmix32-stream    ... Done. (609.93 MB/s)
  Running xoshiro128-stream    ... Done. (712.05 MB/s)
  Running sfc32 (core)         ... Done. (221.03 MB/s)
  Running splitmix32 (core)    ... Done. (216.80 MB/s)
  Running xoshiro128 (core)    ... Done. (234.51 MB/s)
  Running chacha20 (native)    ... Done. (1438.71 MB/s)
  Running chacha20 (v8)        ... Done. (59.45 MB/s)


================================================================================
FINAL RESULTS: THROUGHPUT (MB/s)
================================================================================
┌───────────────────┬──────────┬──────────┬──────────┬──────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬──────────┐
│ (index)           │ 16 B     │ 64 B     │ 512 B    │ 1 KB     │ 4 KB      │ 16 KB     │ 64 KB     │ 512 KB    │ 1 MB      │ 16 MB     │ 64 MB     │ AVG      │
├───────────────────┼──────────┼──────────┼──────────┼──────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┼──────────┤
│ chacha20 (native) │ '14.98'  │ '57.18'  │ '326.97' │ '568.10' │ '1075.25' │ '1327.98' │ '1053.99' │ '1203.21' │ '1240.33' │ '1571.47' │ '1438.71' │ '898.02' │
│ xoshiro128-stream │ '205.82' │ '447.14' │ '657.05' │ '684.40' │ '711.83'  │ '679.35'  │ '695.88'  │ '721.97'  │ '699.84'  │ '710.89'  │ '712.05'  │ '629.66' │
│ splitmix32-stream │ '220.54' │ '333.11' │ '578.81' │ '594.51' │ '607.86'  │ '613.26'  │ '612.89'  │ '614.79'  │ '609.44'  │ '608.72'  │ '609.93'  │ '545.81' │
│ sfc32-stream      │ '218.79' │ '396.13' │ '532.69' │ '550.10' │ '555.48'  │ '555.34'  │ '535.16'  │ '533.36'  │ '567.54'  │ '554.30'  │ '555.85'  │ '504.98' │
│ xoshiro128 (core) │ '133.24' │ '201.19' │ '231.90' │ '235.69' │ '216.80'  │ '236.33'  │ '226.85'  │ '237.32'  │ '235.28'  │ '231.10'  │ '234.51'  │ '220.02' │
│ sfc32 (core)      │ '190.77' │ '184.89' │ '216.85' │ '227.35' │ '229.31'  │ '226.04'  │ '221.05'  │ '226.30'  │ '227.94'  │ '222.38'  │ '221.03'  │ '217.63' │
│ splitmix32 (core) │ '126.57' │ '177.24' │ '212.47' │ '220.81' │ '201.38'  │ '222.57'  │ '210.84'  │ '218.73'  │ '215.56'  │ '219.85'  │ '216.80'  │ '203.89' │
│ chacha20 (v8)     │ '13.83'  │ '44.40'  │ '57.02'  │ '57.86'  │ '57.75'   │ '59.88'   │ '59.67'   │ '58.96'   │ '59.14'   │ '59.37'   │ '59.45'   │ '53.39'  │
└───────────────────┴──────────┴──────────┴──────────┴──────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴──────────┘

================================================================================
LEADERBOARD: Operations Per Second (at 1 KB)
================================================================================
┌─────────┬─────────────────────┬───────────┬────────────┬───────────────┐
│ (index) │ Algorithm           │ Ops/Sec   │ Latency    │ Throughput    │
├─────────┼─────────────────────┼───────────┼────────────┼───────────────┤
│ 0       │ 'xoshiro128-stream' │ '700,830' │ '1.43 µs'  │ '684.40 MB/s' │
│ 1       │ 'splitmix32-stream' │ '608,775' │ '1.64 µs'  │ '594.51 MB/s' │
│ 2       │ 'chacha20 (native)' │ '581,736' │ '1.72 µs'  │ '568.10 MB/s' │
│ 3       │ 'sfc32-stream'      │ '563,299' │ '1.78 µs'  │ '550.10 MB/s' │
│ 4       │ 'xoshiro128 (core)' │ '241,343' │ '4.14 µs'  │ '235.69 MB/s' │
│ 5       │ 'sfc32 (core)'      │ '232,806' │ '4.30 µs'  │ '227.35 MB/s' │
│ 6       │ 'splitmix32 (core)' │ '226,106' │ '4.42 µs'  │ '220.81 MB/s' │
│ 7       │ 'chacha20 (v8)'     │ '59,254'  │ '16.88 µs' │ '57.86 MB/s'  │
└─────────┴─────────────────────┴───────────┴────────────┴───────────────┘

Process finished with exit code 0





```