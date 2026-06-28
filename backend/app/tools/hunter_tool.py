"""Contact/email generation tool."""


def _compute_confidence(name: str, domain: str) -> int:
    score = 30
    if name and name != "Unknown":
        score += 20
    if len(name.lower().split()) >= 2:
        score += 15
    if domain and domain != "company.com":
        score += 20
    if domain and "." in domain:
        score += 15
    return min(score, 100)


def generate_contact(name: str, domain: str) -> dict:
    parts = name.lower().split()
    if len(parts) >= 2:
        email = f"{parts[0]}.{parts[-1]}@{domain}"
    else:
        email = f"{parts[0]}@{domain}" if parts else f"contact@{domain}"

    return {
        "email": email,
        "confidence_score": _compute_confidence(name, domain),
        "linkedin_url": f"https://linkedin.com/in/{name.lower().replace(' ', '-')}",
        "phone": None,
        "source": "generated",
    }
