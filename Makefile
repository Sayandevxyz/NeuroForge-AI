.PHONY: setup dev api web test clean docker-up docker-down

setup:
	pip install -r apps/api/requirements.txt
	cd apps/web && npm install

dev-api:
	cd apps/api && python -m uvicorn app.main:app --reload --port 8000

dev-web:
	cd apps/web && npm run dev

test:
	pytest apps/api/tests -v

docker-up:
	docker compose up --build

docker-down:
	docker compose down

clean:
	rm -f neuroforge.db
