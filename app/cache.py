from flask import current_app
from cachetools import TTLCache
import threading

# Thread-local storage for cache instances
_local = threading.local()

def get_cache():
    """Get or create a thread-local cache instance."""
    if not hasattr(_local, 'cache'):
        # Create a cache with 1000 max items and 300 seconds (5 minutes) TTL
        _local.cache = TTLCache(maxsize=1000, ttl=300)
    return _local.cache

def cache_get(key):
    """Get a value from the cache."""
    cache = get_cache()
    return cache.get(key)

def cache_set(key, value):
    """Set a value in the cache."""
    cache = get_cache()
    cache[key] = value

def cache_clear():
    """Clear all cached items."""
    cache = get_cache()
    cache.clear()