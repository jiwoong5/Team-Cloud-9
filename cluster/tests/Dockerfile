FROM python:3.13-slim

RUN apt update && apt upgrade -y && apt install -y gcc stress curl && apt clean

RUN pip install --no-cache-dir fastapi uvicorn python-multipart

COPY test.py /app/main.py

WORKDIR /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
