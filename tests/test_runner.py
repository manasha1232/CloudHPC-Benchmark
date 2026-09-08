from backend.benchmark.runner import (
    run_sequential_benchmark,
    run_parallel_benchmark,
    run_full_benchmark_suite
)

def test_sequential_and_parallel_runner():
    algo = "SHA-256"
    ops = 5000
    workers = 2

    seq = run_sequential_benchmark(algo, ops)
    assert seq["mode"] == "sequential"
    assert seq["operations"] == ops

    par = run_parallel_benchmark(algo, ops, workers)
    assert par["mode"] == "parallel"
    assert par["workers"] == workers
    assert par["operations"] == ops

def test_full_benchmark_suite():
    algorithms = ["SHA-256", "PBKDF2"]
    ops_map = {"SHA-256": 5000, "PBKDF2": 10}
    workers = 2

    res = run_full_benchmark_suite(algorithms, ops_map, workers)
    assert res["workers"] == workers
    assert "overall_speedup" in res
    assert "overall_efficiency_percent" in res
    assert len(res["algorithm_results"]) == 2
