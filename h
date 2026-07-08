[33mcommit 5ae2a10ecc2bb8804f6f1b2d6ed48c9f4a433d94[m[33m ([m[1;36mHEAD -> [m[1;32mmain[m[33m)[m
Author: Sai Charan <saicharannutheti@gmail.com>
Date:   Tue Jun 23 21:41:56 2026 +0530

    Phase 2-4: resume/JD pipelines, Claude analysis, evidence-based scoring with checklist caching

 backend/checklist_cache/4b84798d84f4f333.json      |   1 [32m+[m
 backend/checklist_cache/7a421f6a09d6e8f8.json      |   1 [32m+[m
 backend/checklist_cache/ae857ea5aaffd6cc.json      |   1 [32m+[m
 backend/checklist_cache/cfbaf28c1bed2527.json      |   1 [32m+[m
 .../__pycache__/claude_analyser.cpython-312.pyc    | Bin [31m0[m -> [32m10855[m bytes
 backend/pipelines/claude_analyser.py               | 204 [32m+++++++++++++++++++++[m
 .../routers/__pycache__/analyse.cpython-312.pyc    | Bin [31m1976[m -> [32m2024[m bytes
 backend/routers/analyse.py                         |  13 [32m+[m[31m-[m
 8 files changed, 216 insertions(+), 5 deletions(-)
