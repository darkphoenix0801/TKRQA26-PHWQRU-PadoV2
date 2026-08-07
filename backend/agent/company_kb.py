COMPANY_INTERVIEW_LOOPS = {
    "Google": {
        "rounds": 4,
        "structure": [
            {"name": "Phone Screen", "type": "DSA", "focus": "Arrays, Strings, Hash Maps"},
            {"name": "Onsite 1", "type": "DSA", "focus": "Graphs, Trees, Dynamic Programming"},
            {"name": "Onsite 2", "type": "System Design", "focus": "High Scalability, Distributed Systems"},
            {"name": "Onsite 3", "type": "Behavioral", "focus": "Googlyness, Leadership, Ambiguity"}
        ]
    },
    "Amazon": {
        "rounds": 4,
        "structure": [
            {"name": "Online Assessment", "type": "DSA", "focus": "Arrays, Priority Queues, Sliding Window"},
            {"name": "Onsite 1", "type": "DSA & LP", "focus": "Trees, Graphs + Leadership Principles"},
            {"name": "Onsite 2", "type": "System Design", "focus": "Microservices, AWS architecture"},
            {"name": "Onsite 3 (Bar Raiser)", "type": "Behavioral", "focus": "Deep dive into past projects, Conflict Resolution"}
        ]
    },
    "Meta": {
        "rounds": 4,
        "structure": [
            {"name": "Phone Screen", "type": "DSA", "focus": "Arrays, Two Pointers (High Speed Expected)"},
            {"name": "Onsite 1 (Ninja)", "type": "DSA", "focus": "Trees, Graphs, Recursion"},
            {"name": "Onsite 2 (Pirate)", "type": "System Design", "focus": "News Feed, Messenger, Heavy Read/Write"},
            {"name": "Onsite 3 (Jedi)", "type": "Behavioral", "focus": "Resolving conflicts, Fast-paced execution"}
        ]
    },
    "Microsoft": {
        "rounds": 4,
        "structure": [
            {"name": "Phone Screen", "type": "DSA", "focus": "Strings, Linked Lists"},
            {"name": "Onsite 1", "type": "DSA", "focus": "Trees, System-level programming logic"},
            {"name": "Onsite 2", "type": "System Design", "focus": "Object Oriented Design, Cloud scaling"},
            {"name": "Onsite 3", "type": "Behavioral", "focus": "Growth mindset, Cross-team collaboration"}
        ]
    },
    "Netflix": {
        "rounds": 4,
        "structure": [
            {"name": "Screening", "type": "Core Subjects", "focus": "Deep dive into language internals, Concurrency"},
            {"name": "Onsite 1", "type": "DSA", "focus": "Advanced algorithms, Performance tuning"},
            {"name": "Onsite 2", "type": "System Design", "focus": "High availability streaming, CDN architecture"},
            {"name": "Onsite 3", "type": "Behavioral", "focus": "Netflix Culture Deck, Radical Candor"}
        ]
    },
    # Fallback for any other company
    "Default": {
        "rounds": 3,
        "structure": [
            {"name": "Technical Screen", "type": "DSA", "focus": "General Data Structures and Algorithms"},
            {"name": "Onsite Technical", "type": "System Design", "focus": "Architecture and Core Subjects"},
            {"name": "HR/Behavioral", "type": "Behavioral", "focus": "Past experience and culture fit"}
        ]
    }
}

def get_company_loop(company_name: str):
    """Returns the interview loop structure for the given company, or a default loop."""
    if not company_name:
        return COMPANY_INTERVIEW_LOOPS["Default"]
        
    # Try exact match, otherwise try to find a substring match
    if company_name in COMPANY_INTERVIEW_LOOPS:
        return COMPANY_INTERVIEW_LOOPS[company_name]
        
    for key in COMPANY_INTERVIEW_LOOPS:
        if key.lower() in company_name.lower() and key != "Default":
            return COMPANY_INTERVIEW_LOOPS[key]
            
    return COMPANY_INTERVIEW_LOOPS["Default"]
