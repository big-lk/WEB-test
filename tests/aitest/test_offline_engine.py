"""オフライン版の回帰テスト：python3 tests/aitest/test_offline_engine.py"""
import glob, random, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "tools/offline"))
from replay import load, run_session  # noqa: E402
from quality import check_session  # noqa: E402
import fuzz  # noqa: E402

fail = 0
for path in sorted(glob.glob(str(ROOT / "tools/offline/data/*.tsv"))):
    for row in load(path):
        for v in ("generic_unranked", "generic_embedded", "mixed_e1explicit", "mixed_e1content"):
            res = run_session(row, v)
            again = run_session(row, v)
            if [r["dialogue"] for r in res] != [r["dialogue"] for r in again]:
                print("FAIL 再現性", row["id"], v); fail += 1
            for k, code, msg in check_session(row, res):
                print("FAIL", row["id"], v, k, code, msg); fail += 1
            if not all(r["meta"]["requiredControlSentence"] in r["dialogue"] for r in res[2:4]):
                print("FAIL 刺激文なし", row["id"], v); fail += 1
rng = random.Random(1)
for i in range(300):
    row, res = fuzz.run(rng, i, "generic_unranked", 0.1)
    for k, code, msg in check_session(row, res):
        print("FAIL fuzz", i, k, code, msg); fail += 1
print(f"{fail} failure(s)")
sys.exit(1 if fail else 0)
