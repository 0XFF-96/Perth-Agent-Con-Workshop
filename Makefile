.PHONY: install install-backend install-frontend env dev dev-backend dev-frontend clean help

help:
	@echo "Targets:"
	@echo "  make install       Install backend + frontend dependencies and create backend/.env"
	@echo "  make dev           Run backend and frontend together (Ctrl+C stops both)"
	@echo "  make dev-backend   Run only the backend (http://localhost:4000)"
	@echo "  make dev-frontend  Run only the frontend (http://localhost:5176)"
	@echo "  make clean         Remove node_modules from backend and frontend"

install: install-backend install-frontend env
	@echo ""
	@echo "Done. Next steps:"
	@echo "  1. Edit backend/.env and set OPENAI_API_KEY"
	@echo "  2. Run: make dev"

install-backend:
	cd backend && npm install

install-frontend:
	cd frontend && npm install

env:
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "Created backend/.env from .env.example - edit it and set OPENAI_API_KEY"; \
	else \
		echo "backend/.env already exists, leaving it alone"; \
	fi

dev:
	@trap 'kill 0' INT TERM EXIT; \
	(cd backend && npm run dev) & \
	(cd frontend && npm run dev) & \
	wait

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

clean:
	rm -rf backend/node_modules frontend/node_modules
