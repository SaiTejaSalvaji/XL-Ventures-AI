"""Contact/email generation tool."""


def generate_contact(name: str, domain: str) -> dict:
    parts = name.lower().split()
    if len(parts) >= 2:
        email = f"{parts[0]}.{parts[-1]}@{domain}"
    else:
        email = f"{parts[0]}@{domain}" if parts else f"contact@{domain}"

    return {
        "email": email,
        "confidence_score": 65,
        "linkedin_url": f"https://linkedin.com/in/{name.lower().replace(' ', '-')}",
        "phone": None,
        "source": "generated",
    }
