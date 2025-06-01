import logging

import psutil

log = logging.getLogger('uvicorn')


def get_cpu(interval: float = 1.0):
    log.info(f"First Call = {psutil.cpu_percent(interval=None)}")
    cpu_pct = psutil.cpu_percent(interval=interval)
    log.info(f"[{interval:.1f}s 동안] 전체 CPU 사용률: {cpu_pct}%")
    per_cpu = psutil.cpu_percent(interval=None, percpu=True)
    for idx, pct in enumerate(per_cpu):
        log.info(f"코어 {idx} 사용률: {pct}%")

def get_memory():
    virtual_memory = psutil.virtual_memory()
    log.info("=== 물리 메모리 (RAM) ===")
    log.info(f"전체: {virtual_memory.total / (1024 ** 3):.2f} GB")
    log.info(f"사용 중: {virtual_memory.used / (1024 ** 3):.2f} GB ({virtual_memory.percent}%)")
    log.info(f"여유: {virtual_memory.available / (1024 ** 3):.2f} GB")

    swap_memory = psutil.swap_memory()
    log.info("\n=== 스왑 메모리 ===")
    log.info(f"전체: {swap_memory.total / (1024 ** 3):.2f} GB")
    log.info(f"사용 중: {swap_memory.used / (1024 ** 3):.2f} GB ({swap_memory.percent}%)")
    log.info(f"여유: {(swap_memory.total - swap_memory.used) / (1024 ** 3):.2f} GB")
