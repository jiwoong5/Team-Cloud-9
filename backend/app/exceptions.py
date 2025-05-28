# app/exceptions.py

class EntityNotFound(Exception):
    """요청한 리소스가 존재하지 않을 때"""
    def __init__(self, entity: str, pk: int):
        self.entity = entity
        self.pk = pk
        super().__init__(f"{entity} with id={pk} not found")

class EntityAlreadyExists(Exception):
    """리소스 중복 생성 시도 시"""
    def __init__(self, entity: str, field: str, value: str):
        self.entity = entity
        self.field = field
        self.value = value
        super().__init__(f"{entity} where {field}={value} already exists")

class BadRequest(Exception):
    """잘못된 요청 데이터일 때"""
    def __init__(self, message: str):
        super().__init__(message)