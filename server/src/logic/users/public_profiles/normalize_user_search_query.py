def normalize_user_search_query(query: str) -> str:
    return query.strip().lower()[:20]
