from datasets import load_dataset

try:
    print("Loading LeetCode...")
    ds_lc = load_dataset("kaysss/leetcode-problem-solutions", split="train")
    print(ds_lc[0].keys())
    print("Example:", ds_lc[0])
    
    print("Loading Behavioral...")
    ds_bh = load_dataset("Aiman1234/Interview-questions", split="train")
    print(ds_bh[0].keys())
    print("Example:", ds_bh[0])
except Exception as e:
    print(e)
