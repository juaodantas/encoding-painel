#! /bin/sh

echo "Starting database initialization..."

# Tenta criar o banco de dados
echo "Creating database..."
if npm run db:create > /dev/null 2>&1; then
  echo "Database created successfully."
else
  echo "Database already exists or could not be created."
fi

# Tenta rodar as migrações do Sequelize
echo "Running migrations..."
if npm run db:migrate > /dev/null 2>&1; then
  echo "Migrations completed successfully."
else
  echo "Error running migrations."
  exit 1
fi

# Tenta rodar as seeds do Sequelize
echo "Running seeds..."
if npm run db:seed:undo:all > /dev/null 2>&1 && npm run db:seed > /dev/null 2>&1; then
  echo "Seeds completed successfully."
else
  echo "Error when running the seeds."
  exit 1
fi

echo "Database initialization completed successfully!"