import os
import psycopg2
from urllib.parse import urlparse

def check_migrations(connection_string):
    try:
        url = urlparse(connection_string)
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        cur = conn.cursor()
        cur.execute("SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;")
        migrations = cur.fetchall()
        cur.close()
        conn.close()
        return migrations
    except Exception as e:
        return f"Error connecting to database or querying migrations: {e}"

if __name__ == "__main__":
    connection_string = os.getenv("DATABASE_URL")
    if not connection_string:
        print("Error: DATABASE_URL environment variable not set.")
    else:
        result = check_migrations(connection_string)
        if isinstance(result, str):
            print(result)
        else:
            if result:
                print("Migrations already run:")
                for migration in result:
                    print(f"  Version: {migration[0]}, Applied At: {migration[1]}")
            else:
                print("No migrations found in supabase_migrations.schema_migrations table.")
