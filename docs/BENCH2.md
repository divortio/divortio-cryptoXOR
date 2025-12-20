```shell

/Users/moe/.nvm/versions/node/v24.10.0/bin/node /Users/moe/projects/divortio-cryptoXOR/bench/benchmark.node.mjs

================================================================================
NODE.JS CRYPTO BENCHMARK (V8 vs NATIVE vs REAL WORLD)
================================================================================
Time:      2025-12-20T10:52:46.542Z
Node:      v24.10.0 (V8 13.6.233.10-node.28)
CPU:       Intel(R) Core(TM) i7-4870HQ CPU @ 2.50GHz (8 Cores)
RAM:       16.0 GB
Config:    10 Samples, Max Size 64 MB
================================================================================


--- Test Suite: 16 B ---
  Running sfc32-stream (Func)       ... Done. (232.53 MB/s)
  Running SFC32-Pure (Class)        ... Done. (36.00 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (35.27 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (34.22 MB/s)
  Running SFC32-ECC (Class)         ... Done. (35.57 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (31.92 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (28.96 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (30.46 MB/s)
  Running ChaCha20 (V8)             ... Done. (13.16 MB/s)
  Running RC4 (V8)                  ... Done. (150.31 MB/s)
  Running Rabbit (V8)               ... Done. (9.99 MB/s)
  Running Salsa20 (V8)              ... Done. (33.33 MB/s)
  Running AES-128-Table (V8)        ... Done. (21.96 MB/s)
  Running ChaCha20 (Node)           ... Done. (14.10 MB/s)
  Running AES-128-CTR (Node)        ... Done. (15.05 MB/s)
  Running AES-256-CTR (Node)        ... Done. (15.17 MB/s)
  Running AES-128-CBC (Node)        ... Done. (14.52 MB/s)
  Running AES-256-CBC (Node)        ... Done. (7.86 MB/s)
  Running AES-128-GCM (Node)        ... Done. (11.79 MB/s)
  Running AES-256-GCM (Node)        ... Done. (13.62 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (13.46 MB/s)
  Running 3DES (Node)               ... Done. (9.18 MB/s)
  Running Camellia-128 (Node)       ... Done. (9.27 MB/s)

--- Test Suite: 64 B ---
  Running sfc32-stream (Func)       ... Done. (401.03 MB/s)
  Running SFC32-Pure (Class)        ... Done. (137.83 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (139.06 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (135.62 MB/s)
  Running SFC32-ECC (Class)         ... Done. (127.78 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (122.22 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (111.80 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (120.88 MB/s)
  Running ChaCha20 (V8)             ... Done. (39.46 MB/s)
  Running RC4 (V8)                  ... Done. (210.60 MB/s)
  Running Rabbit (V8)               ... Done. (12.01 MB/s)
  Running Salsa20 (V8)              ... Done. (65.41 MB/s)
  Running AES-128-Table (V8)        ... Done. (39.45 MB/s)
  Running ChaCha20 (Node)           ... Done. (49.85 MB/s)
  Running AES-128-CTR (Node)        ... Done. (52.91 MB/s)
  Running AES-256-CTR (Node)        ... Done. (52.22 MB/s)
  Running AES-128-CBC (Node)        ... Done. (50.86 MB/s)
  Running AES-256-CBC (Node)        ... Done. (48.66 MB/s)
  Running AES-128-GCM (Node)        ... Done. (49.93 MB/s)
  Running AES-256-GCM (Node)        ... Done. (49.23 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (47.29 MB/s)
  Running 3DES (Node)               ... Done. (16.80 MB/s)
  Running Camellia-128 (Node)       ... Done. (36.32 MB/s)

--- Test Suite: 512 B ---
  Running sfc32-stream (Func)       ... Done. (492.93 MB/s)
  Running SFC32-Pure (Class)        ... Done. (551.66 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (543.08 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (509.61 MB/s)
  Running SFC32-ECC (Class)         ... Done. (529.41 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (531.79 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (489.16 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (519.33 MB/s)
  Running ChaCha20 (V8)             ... Done. (45.19 MB/s)
  Running RC4 (V8)                  ... Done. (215.17 MB/s)
  Running Rabbit (V8)               ... Done. (11.40 MB/s)
  Running Salsa20 (V8)              ... Done. (121.12 MB/s)
  Running AES-128-Table (V8)        ... Done. (56.63 MB/s)
  Running ChaCha20 (Node)           ... Done. (300.21 MB/s)
  Running AES-128-CTR (Node)        ... Done. (287.50 MB/s)
  Running AES-256-CTR (Node)        ... Done. (301.95 MB/s)
  Running AES-128-CBC (Node)        ... Done. (224.18 MB/s)
  Running AES-256-CBC (Node)        ... Done. (179.23 MB/s)
  Running AES-128-GCM (Node)        ... Done. (267.21 MB/s)
  Running AES-256-GCM (Node)        ... Done. (231.03 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (249.84 MB/s)
  Running 3DES (Node)               ... Done. (17.75 MB/s)
  Running Camellia-128 (Node)       ... Done. (90.38 MB/s)

--- Test Suite: 1 KB ---
  Running sfc32-stream (Func)       ... Done. (409.29 MB/s)
  Running SFC32-Pure (Class)        ... Done. (887.32 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (792.29 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (688.70 MB/s)
  Running SFC32-ECC (Class)         ... Done. (751.76 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (813.53 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (793.56 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (790.10 MB/s)
  Running ChaCha20 (V8)             ... Done. (53.16 MB/s)
  Running RC4 (V8)                  ... Done. (219.02 MB/s)
  Running Rabbit (V8)               ... Done. (13.03 MB/s)
  Running Salsa20 (V8)              ... Done. (118.36 MB/s)
  Running AES-128-Table (V8)        ... Done. (47.63 MB/s)
  Running ChaCha20 (Node)           ... Done. (468.90 MB/s)
  Running AES-128-CTR (Node)        ... Done. (572.61 MB/s)
  Running AES-256-CTR (Node)        ... Done. (536.58 MB/s)
  Running AES-128-CBC (Node)        ... Done. (313.69 MB/s)
  Running AES-256-CBC (Node)        ... Done. (264.69 MB/s)
  Running AES-128-GCM (Node)        ... Done. (476.38 MB/s)
  Running AES-256-GCM (Node)        ... Done. (418.01 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (438.78 MB/s)
  Running 3DES (Node)               ... Done. (20.07 MB/s)
  Running Camellia-128 (Node)       ... Done. (119.39 MB/s)

--- Test Suite: 4 KB ---
  Running sfc32-stream (Func)       ... Done. (480.77 MB/s)
  Running SFC32-Pure (Class)        ... Done. (1003.43 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (1081.34 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (967.60 MB/s)
  Running SFC32-ECC (Class)         ... Done. (1111.72 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (984.92 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (914.41 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (974.72 MB/s)
  Running ChaCha20 (V8)             ... Done. (43.80 MB/s)
  Running RC4 (V8)                  ... Done. (209.26 MB/s)
  Running Rabbit (V8)               ... Done. (11.21 MB/s)
  Running Salsa20 (V8)              ... Done. (142.96 MB/s)
  Running AES-128-Table (V8)        ... Done. (51.03 MB/s)
  Running ChaCha20 (Node)           ... Done. (884.01 MB/s)
  Running AES-128-CTR (Node)        ... Done. (1142.77 MB/s)
  Running AES-256-CTR (Node)        ... Done. (973.78 MB/s)
  Running AES-128-CBC (Node)        ... Done. (439.69 MB/s)
  Running AES-256-CBC (Node)        ... Done. (345.70 MB/s)
  Running AES-128-GCM (Node)        ... Done. (891.24 MB/s)
  Running AES-256-GCM (Node)        ... Done. (866.01 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (582.91 MB/s)
  Running 3DES (Node)               ... Done. (20.20 MB/s)
  Running Camellia-128 (Node)       ... Done. (140.71 MB/s)

--- Test Suite: 16 KB ---
  Running sfc32-stream (Func)       ... Done. (402.30 MB/s)
  Running SFC32-Pure (Class)        ... Done. (1031.85 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (1165.37 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (849.66 MB/s)
  Running SFC32-ECC (Class)         ... Done. (1271.19 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (1384.07 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (1055.08 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (1312.37 MB/s)
  Running ChaCha20 (V8)             ... Done. (31.67 MB/s)
  Running RC4 (V8)                  ... Done. (207.81 MB/s)
  Running Rabbit (V8)               ... Done. (10.22 MB/s)
  Running Salsa20 (V8)              ... Done. (142.96 MB/s)
  Running AES-128-Table (V8)        ... Done. (65.19 MB/s)
  Running ChaCha20 (Node)           ... Done. (1376.00 MB/s)
  Running AES-128-CTR (Node)        ... Done. (1776.67 MB/s)
  Running AES-256-CTR (Node)        ... Done. (1699.21 MB/s)
  Running AES-128-CBC (Node)        ... Done. (597.05 MB/s)
  Running AES-256-CBC (Node)        ... Done. (458.53 MB/s)
  Running AES-128-GCM (Node)        ... Done. (1536.44 MB/s)
  Running AES-256-GCM (Node)        ... Done. (1312.02 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (1079.01 MB/s)
  Running 3DES (Node)               ... Done. (27.52 MB/s)
  Running Camellia-128 (Node)       ... Done. (176.45 MB/s)

--- Test Suite: 64 KB ---
  Running sfc32-stream (Func)       ... Done. (466.03 MB/s)
  Running SFC32-Pure (Class)        ... Done. (966.94 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (1008.04 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (870.01 MB/s)
  Running SFC32-ECC (Class)         ... Done. (977.43 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (1051.27 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (955.40 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (1058.28 MB/s)
  Running ChaCha20 (V8)             ... Done. (60.29 MB/s)
  Running RC4 (V8)                  ... Done. (285.81 MB/s)
  Running Rabbit (V8)               ... Done. (13.01 MB/s)
  Running Salsa20 (V8)              ... Done. (153.37 MB/s)
  Running AES-128-Table (V8)        ... Done. (67.72 MB/s)
  Running ChaCha20 (Node)           ... Done. (1068.39 MB/s)
  Running AES-128-CTR (Node)        ... Done. (1344.01 MB/s)
  Running AES-256-CTR (Node)        ... Done. (1196.30 MB/s)
  Running AES-128-CBC (Node)        ... Done. (530.10 MB/s)
  Running AES-256-CBC (Node)        ... Done. (416.24 MB/s)
  Running AES-128-GCM (Node)        ... Done. (1157.48 MB/s)
  Running AES-256-GCM (Node)        ... Done. (1029.91 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (844.22 MB/s)
  Running 3DES (Node)               ... Done. (26.77 MB/s)
  Running Camellia-128 (Node)       ... Done. (169.20 MB/s)

--- Test Suite: 512 KB ---
  Running sfc32-stream (Func)       ... Done. (567.50 MB/s)
  Running SFC32-Pure (Class)        ... Done. (1146.39 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (1179.87 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (994.21 MB/s)
  Running SFC32-ECC (Class)         ... Done. (1184.90 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (1212.33 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (990.24 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (1174.93 MB/s)
  Running ChaCha20 (V8)             ... Done. (61.77 MB/s)
  Running RC4 (V8)                  ... Done. (280.64 MB/s)
  Running Rabbit (V8)               ... Done. (13.82 MB/s)
  Running Salsa20 (V8)              ... Done. (168.67 MB/s)
  Running AES-128-Table (V8)        ... Done. (66.76 MB/s)
  Running ChaCha20 (Node)           ... Done. (1229.07 MB/s)
  Running AES-128-CTR (Node)        ... Done. (1570.91 MB/s)
  Running AES-256-CTR (Node)        ... Done. (1395.27 MB/s)
  Running AES-128-CBC (Node)        ... Done. (560.01 MB/s)
  Running AES-256-CBC (Node)        ... Done. (443.38 MB/s)
  Running AES-128-GCM (Node)        ... Done. (1305.83 MB/s)
  Running AES-256-GCM (Node)        ... Done. (1189.63 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (923.60 MB/s)
  Running 3DES (Node)               ... Done. (27.02 MB/s)
  Running Camellia-128 (Node)       ... Done. (172.60 MB/s)

--- Test Suite: 1 MB ---
  Running sfc32-stream (Func)       ... Done. (555.55 MB/s)
  Running SFC32-Pure (Class)        ... Done. (1217.22 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (1209.18 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (1036.40 MB/s)
  Running SFC32-ECC (Class)         ... Done. (1199.12 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (1218.12 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (1054.88 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (1190.24 MB/s)
  Running ChaCha20 (V8)             ... Done. (56.52 MB/s)
  Running RC4 (V8)                  ... Done. (292.84 MB/s)
  Running Rabbit (V8)               ... Done. (13.62 MB/s)
  Running Salsa20 (V8)              ... Done. (156.68 MB/s)
  Running AES-128-Table (V8)        ... Done. (66.48 MB/s)
  Running ChaCha20 (Node)           ... Done. (1297.02 MB/s)
  Running AES-128-CTR (Node)        ... Done. (1664.32 MB/s)
  Running AES-256-CTR (Node)        ... Done. (1465.25 MB/s)
  Running AES-128-CBC (Node)        ... Done. (582.86 MB/s)
  Running AES-256-CBC (Node)        ... Done. (432.25 MB/s)
  Running AES-128-GCM (Node)        ... Done. (1405.10 MB/s)
  Running AES-256-GCM (Node)        ... Done. (1232.15 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (1007.72 MB/s)
  Running 3DES (Node)               ... Done. (26.05 MB/s)
  Running Camellia-128 (Node)       ... Done. (176.68 MB/s)

--- Test Suite: 16 MB ---
  Running sfc32-stream (Func)       ... Done. (511.51 MB/s)
  Running SFC32-Pure (Class)        ... Done. (1686.30 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (1716.25 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (1382.32 MB/s)
  Running SFC32-ECC (Class)         ... Done. (1682.87 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (1774.78 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (1375.64 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (1698.20 MB/s)
  Running ChaCha20 (V8)             ... Done. (59.04 MB/s)
  Running RC4 (V8)                  ... Done. (308.56 MB/s)
  Running Rabbit (V8)               ... Done. (14.71 MB/s)
  Running Salsa20 (V8)              ... Done. (158.00 MB/s)
  Running AES-128-Table (V8)        ... Done. (69.71 MB/s)
  Running ChaCha20 (Node)           ... Done. (1629.18 MB/s)
  Running AES-128-CTR (Node)        ... Done. (2269.66 MB/s)
  Running AES-256-CTR (Node)        ... Done. (1956.60 MB/s)
  Running AES-128-CBC (Node)        ... Done. (621.29 MB/s)
  Running AES-256-CBC (Node)        ... Done. (479.24 MB/s)
  Running AES-128-GCM (Node)        ... Done. (1814.08 MB/s)
  Running AES-256-GCM (Node)        ... Done. (1582.24 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (1132.63 MB/s)
  Running 3DES (Node)               ... Done. (26.75 MB/s)
  Running Camellia-128 (Node)       ... Done. (173.34 MB/s)

--- Test Suite: 64 MB ---
  Running sfc32-stream (Func)       ... Done. (542.20 MB/s)
  Running SFC32-Pure (Class)        ... Done. (1491.24 MB/s)
  Running SplitMix32-Pure (Class)   ... Done. (1618.45 MB/s)
  Running Xoshiro128-Pure (Class)   ... Done. (1253.52 MB/s)
  Running SFC32-ECC (Class)         ... Done. (1615.27 MB/s)
  Running SplitMix32-ECC (Class)    ... Done. (1647.30 MB/s)
  Running Xoshiro128-ECC (Class)    ... Done. (1267.61 MB/s)
  Running SFC32-Chaskey (Class)     ... Done. (1604.05 MB/s)
  Running ChaCha20 (V8)             ... Done. (57.73 MB/s)
  Running RC4 (V8)                  ... Done. (310.66 MB/s)
  Running Rabbit (V8)               ... Done. (14.69 MB/s)
  Running Salsa20 (V8)              ... Done. (162.58 MB/s)
  Running AES-128-Table (V8)        ... Done. (68.20 MB/s)
  Running ChaCha20 (Node)           ... Done. (1375.34 MB/s)
  Running AES-128-CTR (Node)        ... Done. (2011.60 MB/s)
  Running AES-256-CTR (Node)        ... Done. (1712.84 MB/s)
  Running AES-128-CBC (Node)        ... Done. (616.75 MB/s)
  Running AES-256-CBC (Node)        ... Done. (452.82 MB/s)
  Running AES-128-GCM (Node)        ... Done. (1537.84 MB/s)
  Running AES-256-GCM (Node)        ... Done. (1332.13 MB/s)
  Running ChaCha20-Poly1305 (Node)  ... Done. (928.55 MB/s)
  Running 3DES (Node)               ... Done. (26.09 MB/s)
  Running Camellia-128 (Node)       ... Done. (175.26 MB/s)


================================================================================
FINAL RESULTS: THROUGHPUT (MB/s)
================================================================================
┌──────────────────────────┬──────────┬──────────┬──────────┬──────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
│ (index)                  │ 16 B     │ 64 B     │ 512 B    │ 1 KB     │ 4 KB      │ 16 KB     │ 64 KB     │ 512 KB    │ 1 MB      │ 16 MB     │ 64 MB     │ AVG       │
├──────────────────────────┼──────────┼──────────┼──────────┼──────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┤
│ AES-128-CTR (Node)       │ '15.05'  │ '52.91'  │ '287.50' │ '572.61' │ '1142.77' │ '1776.67' │ '1344.01' │ '1570.91' │ '1664.32' │ '2269.66' │ '2011.60' │ '1155.27' │
│ AES-256-CTR (Node)       │ '15.17'  │ '52.22'  │ '301.95' │ '536.58' │ '973.78'  │ '1699.21' │ '1196.30' │ '1395.27' │ '1465.25' │ '1956.60' │ '1712.84' │ '1027.74' │
│ SplitMix32-ECC (Class)   │ '31.92'  │ '122.22' │ '531.79' │ '813.53' │ '984.92'  │ '1384.07' │ '1051.27' │ '1212.33' │ '1218.12' │ '1774.78' │ '1647.30' │ '979.30'  │
│ SplitMix32-Pure (Class)  │ '35.27'  │ '139.06' │ '543.08' │ '792.29' │ '1081.34' │ '1165.37' │ '1008.04' │ '1179.87' │ '1209.18' │ '1716.25' │ '1618.45' │ '953.47'  │
│ SFC32-ECC (Class)        │ '35.57'  │ '127.78' │ '529.41' │ '751.76' │ '1111.72' │ '1271.19' │ '977.43'  │ '1184.90' │ '1199.12' │ '1682.87' │ '1615.27' │ '953.37'  │
│ SFC32-Chaskey (Class)    │ '30.46'  │ '120.88' │ '519.33' │ '790.10' │ '974.72'  │ '1312.37' │ '1058.28' │ '1174.93' │ '1190.24' │ '1698.20' │ '1604.05' │ '952.14'  │
│ AES-128-GCM (Node)       │ '11.79'  │ '49.93'  │ '267.21' │ '476.38' │ '891.24'  │ '1536.44' │ '1157.48' │ '1305.83' │ '1405.10' │ '1814.08' │ '1537.84' │ '950.30'  │
│ SFC32-Pure (Class)       │ '36.00'  │ '137.83' │ '551.66' │ '887.32' │ '1003.43' │ '1031.85' │ '966.94'  │ '1146.39' │ '1217.22' │ '1686.30' │ '1491.24' │ '923.29'  │
│ ChaCha20 (Node)          │ '14.10'  │ '49.85'  │ '300.21' │ '468.90' │ '884.01'  │ '1376.00' │ '1068.39' │ '1229.07' │ '1297.02' │ '1629.18' │ '1375.34' │ '881.10'  │
│ AES-256-GCM (Node)       │ '13.62'  │ '49.23'  │ '231.03' │ '418.01' │ '866.01'  │ '1312.02' │ '1029.91' │ '1189.63' │ '1232.15' │ '1582.24' │ '1332.13' │ '841.45'  │
│ Xoshiro128-ECC (Class)   │ '28.96'  │ '111.80' │ '489.16' │ '793.56' │ '914.41'  │ '1055.08' │ '955.40'  │ '990.24'  │ '1054.88' │ '1375.64' │ '1267.61' │ '821.52'  │
│ Xoshiro128-Pure (Class)  │ '34.22'  │ '135.62' │ '509.61' │ '688.70' │ '967.60'  │ '849.66'  │ '870.01'  │ '994.21'  │ '1036.40' │ '1382.32' │ '1253.52' │ '792.90'  │
│ ChaCha20-Poly1305 (Node) │ '13.46'  │ '47.29'  │ '249.84' │ '438.78' │ '582.91'  │ '1079.01' │ '844.22'  │ '923.60'  │ '1007.72' │ '1132.63' │ '928.55'  │ '658.91'  │
│ AES-128-CBC (Node)       │ '14.52'  │ '50.86'  │ '224.18' │ '313.69' │ '439.69'  │ '597.05'  │ '530.10'  │ '560.01'  │ '582.86'  │ '621.29'  │ '616.75'  │ '413.73'  │
│ sfc32-stream (Func)      │ '232.53' │ '401.03' │ '492.93' │ '409.29' │ '480.77'  │ '402.30'  │ '466.03'  │ '567.50'  │ '555.55'  │ '511.51'  │ '542.20'  │ '460.15'  │
│ AES-256-CBC (Node)       │ '7.86'   │ '48.66'  │ '179.23' │ '264.69' │ '345.70'  │ '458.53'  │ '416.24'  │ '443.38'  │ '432.25'  │ '479.24'  │ '452.82'  │ '320.78'  │
│ RC4 (V8)                 │ '150.31' │ '210.60' │ '215.17' │ '219.02' │ '209.26'  │ '207.81'  │ '285.81'  │ '280.64'  │ '292.84'  │ '308.56'  │ '310.66'  │ '244.61'  │
│ Camellia-128 (Node)      │ '9.27'   │ '36.32'  │ '90.38'  │ '119.39' │ '140.71'  │ '176.45'  │ '169.20'  │ '172.60'  │ '176.68'  │ '173.34'  │ '175.26'  │ '130.87'  │
│ Salsa20 (V8)             │ '33.33'  │ '65.41'  │ '121.12' │ '118.36' │ '142.96'  │ '142.96'  │ '153.37'  │ '168.67'  │ '156.68'  │ '158.00'  │ '162.58'  │ '129.40'  │
│ AES-128-Table (V8)       │ '21.96'  │ '39.45'  │ '56.63'  │ '47.63'  │ '51.03'   │ '65.19'   │ '67.72'   │ '66.76'   │ '66.48'   │ '69.71'   │ '68.20'   │ '56.43'   │
│ ChaCha20 (V8)            │ '13.16'  │ '39.46'  │ '45.19'  │ '53.16'  │ '43.80'   │ '31.67'   │ '60.29'   │ '61.77'   │ '56.52'   │ '59.04'   │ '57.73'   │ '47.44'   │
│ 3DES (Node)              │ '9.18'   │ '16.80'  │ '17.75'  │ '20.07'  │ '20.20'   │ '27.52'   │ '26.77'   │ '27.02'   │ '26.05'   │ '26.75'   │ '26.09'   │ '22.20'   │
│ Rabbit (V8)              │ '9.99'   │ '12.01'  │ '11.40'  │ '13.03'  │ '11.21'   │ '10.22'   │ '13.01'   │ '13.82'   │ '13.62'   │ '14.71'   │ '14.69'   │ '12.52'   │
└──────────────────────────┴──────────┴──────────┴──────────┴──────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘

Process finished with exit code 0



```