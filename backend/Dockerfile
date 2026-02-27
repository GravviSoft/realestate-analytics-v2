FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7000

# CMD ["gunicorn", "-b", "0.0.0.0:7000", "app:app"]
CMD ["gunicorn", "-b", "0.0.0.0:7000", "--workers", "2", "--threads", "4", "app:app"]
