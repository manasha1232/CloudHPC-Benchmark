import time
import multiprocessing
from concurrent.futures import ProcessPoolExecutor
from backend.benchmark.hasher import execute_algorithm_benchmark, ALGORITHM_MAP

def _worker_chunk_task(args):
    algorithm, chunk_ops = args
    return execute_algorithm_benchmark(algorithm, chunk_ops)

def run_sequential_benchmark(algorithm: str, operations: int) -> dict:
    start_time = time.perf_counter()
    res = execute_algorithm_benchmark(algorithm, operations)
    elapsed = time.perf_counter() - start_time
    return {
        "algorithm": algorithm,
        "mode": "sequential",
        "operations": operations,
        "elapsed_seconds": round(elapsed, 4),
        "hashes_per_second": round(operations / elapsed if elapsed > 0 else 0, 2)
    }

def run_parallel_benchmark(algorithm: str, operations: int, workers: int) -> dict:
    workers = max(1, workers)
    # Split operations across workers
    base_ops = operations // workers
    remainder = operations % workers
    chunks = [base_ops + (1 if i < remainder else 0) for i in range(workers)]
    tasks = [(algorithm, chunk_ops) for chunk_ops in chunks if chunk_ops > 0]

    start_time = time.perf_counter()
    with ProcessPoolExecutor(max_workers=workers) as executor:
        results = list(executor.map(_worker_chunk_task, tasks))
    
    elapsed = time.perf_counter() - start_time
    total_ops_completed = sum(r["operations"] for r in results)
    
    return {
        "algorithm": algorithm,
        "mode": "parallel",
        "workers": workers,
        "operations": total_ops_completed,
        "elapsed_seconds": round(elapsed, 4),
        "hashes_per_second": round(total_ops_completed / elapsed if elapsed > 0 else 0, 2)
    }

def run_full_benchmark_suite(algorithms: list[str], operations_map: dict[str, int], workers: int) -> dict:
    """
    Runs both sequential and parallel benchmarks for specified algorithms
    and computes speedup, efficiency, and comparative metrics.
    """
    suite_results = []
    total_seq_time = 0.0
    total_par_time = 0.0

    for algo in algorithms:
        ops = operations_map.get(algo, 1000)
        
        # Sequential benchmark
        seq_res = run_sequential_benchmark(algo, ops)
        
        # Parallel benchmark
        par_res = run_parallel_benchmark(algo, ops, workers)

        seq_time = seq_res["elapsed_seconds"]
        par_time = par_res["elapsed_seconds"]

        speedup = round(seq_time / par_time, 2) if par_time > 0 else 1.0
        efficiency = round((speedup / workers) * 100, 1) if workers > 0 else 100.0

        total_seq_time += seq_time
        total_par_time += par_time

        suite_results.append({
            "algorithm": algo,
            "operations": ops,
            "sequential_seconds": seq_time,
            "parallel_seconds": par_time,
            "sequential_hps": seq_res["hashes_per_second"],
            "parallel_hps": par_res["hashes_per_second"],
            "speedup": speedup,
            "efficiency_percent": efficiency
        })

    overall_speedup = round(total_seq_time / total_par_time, 2) if total_par_time > 0 else 1.0
    overall_efficiency = round((overall_speedup / workers) * 100, 1) if workers > 0 else 100.0

    return {
        "workers": workers,
        "total_sequential_seconds": round(total_seq_time, 4),
        "total_parallel_seconds": round(total_par_time, 4),
        "overall_speedup": overall_speedup,
        "overall_efficiency_percent": overall_efficiency,
        "algorithm_results": suite_results
    }
