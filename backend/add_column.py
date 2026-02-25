import asyncio
import uuid
from sqlalchemy import text
from app.db.session import engine

async def add_column():
    async with engine.begin() as conn:
        try:
            # Check if column already exists to be safe
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='consumptions' AND column_name='recorded_by_id'"
            ))
            if not result.scalar():
                print("Adding recorded_by_id column to consumptions table...")
                await conn.execute(text(
                    "ALTER TABLE consumptions ADD COLUMN recorded_by_id UUID "
                    "REFERENCES users(id) ON DELETE CASCADE"
                ))
                # Fill existing data with user_id
                await conn.execute(text(
                    "UPDATE consumptions SET recorded_by_id = user_id WHERE recorded_by_id IS NULL"
                ))
                print("Column added successfully.")
            else:
                print("Column recorded_by_id already exists.")
        except Exception as e:
            print(f"Error adding column: {e}")

if __name__ == "__main__":
    asyncio.run(add_column())
