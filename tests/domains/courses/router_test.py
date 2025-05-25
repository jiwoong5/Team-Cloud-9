from starlette.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_read_course():
    response = client.get("/api/admin/courses/1")
    assert response.status_code == 200
    assert ((response.json()[0])['name']) == 'FastAPI 강의'
    assert True


def test_get_register():

    assert False


def test_add_course():
    assert False


def test_read_course_by_department():
    assert True


def test_update_course():
    assert True


def test_delete_course():
    assert True


