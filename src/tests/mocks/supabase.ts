export const createSupabaseMock = (initialData: any = {}) => {
  const db = { ...initialData };

  const from = (tableName: string) => {
    if (!db[tableName]) {
      db[tableName] = [];
    }

    const queryBuilder = {
      select: (columns = '*') => {
        let query = db[tableName];

        const self = {
          eq: (columnName: string, value: any) => {
            query = query.filter((item: any) => item[columnName] === value);
            return self;
          },
          order: (columnName: string, options: { ascending: boolean }) => {
            // The mock doesn't need to implement sorting for now
            // but it needs to return a promise
            return Promise.resolve({ data: query, error: null });
          },
        };
        // This is a bit of a hack to allow to return a promise
        // when no other method is called after select
        (self as any).then = (resolve: any) => resolve({ data: query, error: null });

        return self;
      },
      insert: (data: any) => {
        db[tableName].push(...data);
        return {
          select: () => Promise.resolve({ data, error: null })
        }
      },
      update: (data: any) => {
        const self = {
            eq: (columnName: string, value: any) => {
                db[tableName] = db[tableName].map((item: any) => {
                  if (item[columnName] === value) {
                    return { ...item, ...data };
                  }
                  return item;
                });
                return self;
            },
        };
        // This is a bit of a hack to allow to return a promise
        // when no other method is called after update
        (self as any).then = (resolve: any) => resolve({ error: null });

        return self;
      },
    };

    return queryBuilder;
  };

  return { from };
};