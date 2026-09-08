import pytest
from backend.benchmark.hasher import (
    benchmark_sha256,
    benchmark_sha512,
    benchmark_bcrypt,
    benchmark_pbkdf2,
    benchmark_argon2,
    execute_algorithm_benchmark
)

def test_benchmark_sha256():
    res = benchmark_sha256(operations=100)
    assert res["algorithm"] == "SHA-256"
    assert res["operations"] == 100
    assert res["elapsed_seconds"] >= 0
    assert res["hashes_per_second"] >= 0

def test_benchmark_sha512():
    res = benchmark_sha512(operations=100)
    assert res["algorithm"] == "SHA-512"
    assert res["operations"] == 100

def test_benchmark_bcrypt():
    res = benchmark_bcrypt(operations=2, rounds=4)
    assert res["algorithm"] == "bcrypt"
    assert res["operations"] == 2

def test_benchmark_pbkdf2():
    res = benchmark_pbkdf2(operations=5, iterations=1000)
    assert res["algorithm"] == "PBKDF2"
    assert res["operations"] == 5

def test_benchmark_argon2():
    res = benchmark_argon2(operations=2)
    assert res["algorithm"] == "Argon2"
    assert res["operations"] == 2

def test_execute_algorithm_benchmark_invalid():
    with pytest.raises(ValueError):
        execute_algorithm_benchmark("NON_EXISTENT_ALGO", 10)
