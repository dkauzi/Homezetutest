# job-platform/backend/Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --retries=5 --default-timeout=100 -r requirements.txt
COPY . .
CMD ["flask", "run", "--host=0.0.0.0"]