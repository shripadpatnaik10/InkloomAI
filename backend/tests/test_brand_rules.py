def test_brand_rule_crud(client):
    user = client.post("/api/v1/auth/register", json={"name": "Admin", "email": "admin@example.com", "password": "secret", "role": "admin"})
    assert user.status_code == 201
    token = client.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "secret"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Brand voice",
        "category": "voice",
        "description": "Professional tone",
        "severity": "medium",
        "status": "active",
    }
    created = client.post("/api/v1/brand-rules", json=payload, headers=headers)
    assert created.status_code == 201
    rule_id = created.json()["id"]

    listed = client.get("/api/v1/brand-rules", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    fetched = client.get(f"/api/v1/brand-rules/{rule_id}", headers=headers)
    assert fetched.status_code == 200

    updated = client.patch(f"/api/v1/brand-rules/{rule_id}", json={"status": "inactive"}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["status"] == "inactive"

    deleted = client.delete(f"/api/v1/brand-rules/{rule_id}", headers=headers)
    assert deleted.status_code == 204

    missing = client.get(f"/api/v1/brand-rules/{rule_id}", headers=headers)
    assert missing.status_code == 404