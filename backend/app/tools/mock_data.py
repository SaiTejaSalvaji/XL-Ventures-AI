import random

# Deterministic mock database for demo and test reliability
MOCK_COMPANIES = [
    {
        "name": "Synthetix AI",
        "domain": "synthetix.ai",
        "industry": "AI Software & Enterprise SaaS",
        "company_size": "50-150 employees",
        "location": "London, United Kingdom",
        "tech_stack": "React, Python, PyTorch, AWS, FastAPI, PostgreSQL",
        "funding_status": "Series A - $8.5M (raised 3 months ago from Sequoia)",
        "hiring_status": "Hiring 3x Senior AI Engineers, 1x Technical Recruiter",
        "website_text": "Synthetix AI builds enterprise automation agents. We are scaling our engineering team in London. Currently looking for senior machine learning professionals who understand transformers and LLM deployment. Core stack: React, Python, FastAPI, PyTorch.",
        "decision_makers": [
            {
                "name": "Sarah Jenkins",
                "role": "Chief Technology Officer (CTO)",
                "email": "sarah.jenkins@synthetix.ai",
                "linkedin": "linkedin.com/in/sarah-jenkins-synthetix"
            },
            {
                "name": "James Henderson",
                "role": "VP of Engineering",
                "email": "j.henderson@synthetix.ai",
                "linkedin": "linkedin.com/in/j-henderson-tech"
            }
        ]
    },
    {
        "name": "Veloce Labs",
        "domain": "velocelabs.co",
        "industry": "IT Consulting & Recruitment Platforms",
        "company_size": "20-50 employees",
        "location": "New York, USA",
        "tech_stack": "Next.js, Node.js, TailwindCSS, MongoDB, Docker, GCP",
        "funding_status": "Seed - $2.2M (raised 6 months ago from Y Combinator)",
        "hiring_status": "Hiring 2x Frontend Engineers, 1x Lead Recruiter",
        "website_text": "Veloce Labs is redefining tech staffing. We provide automated pipelines for vetting software talent. Active openings for Next.js engineers and recruiting coordinators to manage enterprise client projects.",
        "decision_makers": [
            {
                "name": "Alex Mercer",
                "role": "Founder & CEO",
                "email": "alex@velocelabs.co",
                "linkedin": "linkedin.com/in/alex-mercer-veloce"
            },
            {
                "name": "David Kim",
                "role": "Head of Talent Acquisition",
                "email": "david.kim@velocelabs.co",
                "linkedin": "linkedin.com/in/david-kim-recruiter"
            }
        ]
    },
    {
        "name": "Quantum Recruiters",
        "domain": "quantumrecruiters.com",
        "industry": "Staffing & Recruiting",
        "company_size": "200-500 employees",
        "location": "San Francisco, USA",
        "tech_stack": "React, Ruby on Rails, PostgreSQL, Azure, Redis",
        "funding_status": "Series B - $25M (raised 1 year ago)",
        "hiring_status": "Hiring 5x Talent Consultants, 2x Full-Stack AI Engineers",
        "website_text": "Quantum Recruiters matches premier tech talent with Fortune 500 enterprises. We are integrating agentic AI workflow nodes to automate screening and sourcing. Recruiting full stack engineers to build our internal pilot tools.",
        "decision_makers": [
            {
                "name": "Michael Chang",
                "role": "VP of Engineering",
                "email": "m.chang@quantumrecruiters.com",
                "linkedin": "linkedin.com/in/michael-chang-quantum"
            },
            {
                "name": "Emma Watson",
                "role": "Director of Talent Acquisition",
                "email": "emma.watson@quantumrecruiters.com",
                "linkedin": "linkedin.com/in/emma-watson-recruitment"
            }
        ]
    },
    {
        "name": "Apex Staffing Solutions",
        "domain": "apexstaffing.io",
        "industry": "Staffing & Recruitment Solutions",
        "company_size": "100-250 employees",
        "location": "Toronto, Canada",
        "tech_stack": "Vue.js, Django, PostgreSQL, AWS, Celery",
        "funding_status": "Bootstrapped - $15M Annual Revenue",
        "hiring_status": "Hiring 1x Product Manager, 2x AI Agents Developer",
        "website_text": "Apex Staffing provides global talent solutions. We specialize in software developer placements. We are building an AI-powered talent match platform and need developers skilled in LangChain and FastAPI.",
        "decision_makers": [
            {
                "name": "Robert Miller",
                "role": "Chief Operating Officer",
                "email": "r.miller@apexstaffing.io",
                "linkedin": "linkedin.com/in/robert-miller-apex"
            },
            {
                "name": "Jessica Albright",
                "role": "Chief Tech Recruiter",
                "email": "jessica.a@apexstaffing.io",
                "linkedin": "linkedin.com/in/jessica-albright-talent"
            }
        ]
    },
    {
        "name": "Cognitive Nexus",
        "domain": "cognitivenexus.com",
        "industry": "AI & Robotic Process Automation",
        "company_size": "10-20 employees",
        "location": "London, United Kingdom",
        "tech_stack": "React, Python, FastAPI, PyTorch, Kubernetes",
        "funding_status": "Pre-seed - $800K (raised 1 month ago)",
        "hiring_status": "Hiring 2x Deep Learning Engineers",
        "website_text": "Cognitive Nexus builds automation tools for executive staffing. We are hiring machine learning engineers with experience in embedding search, vector indexing and Agent systems.",
        "decision_makers": [
            {
                "name": "Oliver Thorn",
                "role": "Co-Founder & CTO",
                "email": "oliver@cognitivenexus.com",
                "linkedin": "linkedin.com/in/oliver-thorn-cog"
            }
        ]
    }
]

def search_mock_companies(query: str) -> list:
    query = query.lower()
    results = []
    for company in MOCK_COMPANIES:
        # Check matching fields
        if (query in company["name"].lower() or 
            query in company["industry"].lower() or 
            query in company["location"].lower() or 
            query in company["tech_stack"].lower() or 
            query in company["website_text"].lower()):
            results.append({
                "name": company["name"],
                "domain": company["domain"],
                "industry": company["industry"],
                "company_size": company["company_size"],
                "location": company["location"],
                "tech_stack": company["tech_stack"],
                "funding_status": company["funding_status"],
                "hiring_status": company["hiring_status"]
            })
    
    # If no matches, return some default companies that fit recruitment or AI engineering to keep demo functional
    if not results:
        results = [
            {
                "name": c["name"],
                "domain": c["domain"],
                "industry": c["industry"],
                "company_size": c["company_size"],
                "location": c["location"],
                "tech_stack": c["tech_stack"],
                "funding_status": c["funding_status"],
                "hiring_status": c["hiring_status"]
            } for c in MOCK_COMPANIES[:3]
        ]
    return results

def get_mock_enrichment(domain: str) -> dict:
    domain = domain.lower()
    for company in MOCK_COMPANIES:
        if company["domain"] in domain or domain in company["domain"]:
            return company
    # Return generated company if not found
    name = domain.split(".")[0].capitalize()
    return {
        "name": f"{name} Systems",
        "domain": domain,
        "industry": "IT Software Development",
        "company_size": "50-100 employees",
        "location": "London, UK",
        "tech_stack": "React, Node.js, Python, PostgreSQL, Docker",
        "funding_status": "Series A - $5M (Estimated)",
        "hiring_status": "Hiring 1x Full Stack Engineer",
        "website_text": f"Welcome to {name} Systems. We build digital products and recruit talent. Now looking for engineering professionals.",
        "decision_makers": [
            {
                "name": "Jane Smith",
                "role": "CTO",
                "email": f"jane.smith@{domain}",
                "linkedin": f"linkedin.com/in/jane-smith-{name.lower()}"
            }
        ]
    }
