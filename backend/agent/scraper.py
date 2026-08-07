from duckduckgo_search import DDGS
import datetime

def get_latest_interview_context(company: str, round_type: str) -> str:
    """
    Searches the live web for recent interview questions for a specific company and round.
    Returns a concatenated string of search result snippets to serve as context for the LLM.
    """
    current_year = datetime.datetime.now().year
    
    # Formulate a targeted search query
    query = f"{company} {round_type} interview questions {current_year} leetcode glassdoor"
    print(f"[Scraper] Scraping live web for: '{query}'")
    
    context_snippets = []
    try:
        with DDGS() as ddgs:
            # Fetch top 3 results to keep context window small
            results = list(ddgs.text(query, max_results=3))
            
            if not results:
                return "No recent live web data found."
                
            for res in results:
                snippet = res.get("body", "")
                if snippet:
                    context_snippets.append(snippet)
                    
        if context_snippets:
            full_context = " | ".join(context_snippets)
            return full_context[:1000]
        else:
            return "No recent live web data found."
            
    except Exception as e:
        print(f"[Scraper] Web scraping failed: {e}")
        return "Live web search unavailable at the moment."
