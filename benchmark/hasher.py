import hashlib
import time
import secrets
import string
import bcrypt
import argon2

def generate_synthetic_inputs(count: int, length: int = 16) -> list[str]:
    """Generates synthetic random test strings for benchmarking purposes only."""
    alphabet = string.ascii_letters + string.digits
    return [''.join(secrets.choice(alphabet) for _ in range(length)) for _ in range(count)]

def benchmark_sha256(operations: int) -> dict:
    inputs = generate_synthetic_inputs(operations)
    start_time = time.perf_counter()
    for item in inputs:
        _ = hashlib.sha256(item.encode('utf-8')).hexdigest()
    elapsed = time.perf_counter() - start_time
    hashes_per_sec = operations / elapsed if elapsed > 0 else 0
    return {
        "algorithm": "SHA-256",
        "operations": operations,
        "elapsed_seconds": round(elapsed, 4),
        "hashes_per_second": round(hashes_per_sec, 2)
    }

def benchmark_sha512(operations: int) -> dict:
    inputs = generate_synthetic_inputs(operations)
    start_time = time.perf_counter()
    for item in inputs:
        _ = hashlib.sha512(item.encode('utf-8')).hexdigest()
    elapsed = time.perf_counter() - start_time
    hashes_per_sec = operations / elapsed if elapsed > 0 else 0
    return {
        "algorithm": "SHA-512",
        "operations": operations,
        "elapsed_seconds": round(elapsed, 4),
        "hashes_per_second": round(hashes_per_sec, 2)
    }

def benchmark_bcrypt(operations: int, rounds: int = 10) -> dict:
    inputs = generate_synthetic_inputs(operations)
    salt = bcrypt.gensalt(rounds=rounds)
    start_time = time.perf_counter()
    for item in inputs:
        _ = bcrypt.hashpw(item.encode('utf-8'), salt)
    elapsed = time.perf_counter() - start_time
    hashes_per_sec = operations / elapsed if elapsed > 0 else 0
    return {
        "algorithm": "bcrypt",
        "operations": operations,
        "elapsed_seconds": round(elapsed, 4),
        "hashes_per_second": round(hashes_per_sec, 2)
    }

def benchmark_pbkdf2(operations: int, iterations: int = 10000) -> dict:
    inputs = generate_synthetic_inputs(operations)
    salt = b'cloudhpc_benchmark_salt'
    start_time = time.perf_counter()
    for item in inputs:
        _ = hashlib.pbkdf2_hmac('sha256', item.encode('utf-8'), salt, iterations)
    elapsed = time.perf_counter() - start_time
    hashes_per_sec = operations / elapsed if elapsed > 0 else 0
    return {
        "algorithm": "PBKDF2",
        "operations": operations,
        "elapsed_seconds": round(elapsed, 4),
        "hashes_per_second": round(hashes_per_sec, 2)
    }

def benchmark_argon2(operations: int) -> dict:
    inputs = generate_synthetic_inputs(operations)
    ph = argon2.PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
    start_time = time.perf_counter()
    for item in inputs:
        _ = ph.hash(item)
    elapsed = time.perf_counter() - start_time
    hashes_per_sec = operations / elapsed if elapsed > 0 else 0
    return {
        "algorithm": "Argon2",
        "operations": operations,
        "elapsed_seconds": round(elapsed, 4),
        "hashes_per_second": round(hashes_per_sec, 2)
    }

ALGORITHM_MAP = {
    "SHA-256": benchmark_sha256,
    "SHA-512": benchmark_sha512,
    "bcrypt": benchmark_bcrypt,
    "PBKDF2": benchmark_pbkdf2,
    "Argon2": benchmark_argon2
}

def execute_algorithm_benchmark(algorithm: str, operations: int) -> dict:
    if algorithm not in ALGORITHM_MAP:
        raise ValueError(f"Unsupported algorithm: {algorithm}. Supported: {list(ALGORITHM_MAP.keys())}")
    return ALGORITHM_MAP[algorithm](operations)
