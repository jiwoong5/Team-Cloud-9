from starlette.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_read_course():
    response = client.get("/api/admin/courses/1")
    assert response.status_code == 200
    assert ((response.json()[0])['name']) == 'FastAPI 강의'
    assert True
