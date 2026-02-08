# ISDN Backend

## Database Setup Commands

### 1. Generate Prisma Client

```bash
npx prisma generate
```

Or with yarn:

```bash
yarn prisma generate
```

### 2. Create Database and Run Migrations

```bash
npx prisma migrate dev
```

Or with yarn:

```bash
yarn prisma:migrate
```

### 3. Seed Database with Initial Data

```bash
npx prisma db seed
```

Or with yarn:

```bash
yarn prisma:seed
```

Or run directly:

```bash
npx ts-node prisma/seed.ts
```

### Complete Setup Workflow (Run in Order)

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Or with yarn:

```bash
yarn prisma generate
yarn prisma:migrate
yarn prisma:seed
```

### Other Useful Commands

**Check migration status:**

```bash
npx prisma migrate status
```

**Deploy migrations (production):**

```bash
npx prisma migrate deploy
```

**Open Prisma Studio (Database GUI):**

```bash
npx prisma studio
```

**Reset database (development only):**

```bash
npx prisma migrate reset
```

## Default Admin Credentials

After seeding, you can login with:

- **Email:** superadmin@gmail.com
- **Password:** superadmin
