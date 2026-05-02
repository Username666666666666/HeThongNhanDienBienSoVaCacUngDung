import { supabase } from '../utils/supabase';

export const executeQuery = async <T,>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const { data, error } = await queryFn();

    if (error) {
      console.error('Supabase Query Error:', error);
      return {
        data: null,
        error: new Error(error.message || 'Query execution failed'),
      };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected Query Error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};

export const fetchRecords = async <T,>(
  table: string,
  filters?: Record<string, any>
): Promise<{ data: T[] | null; error: Error | null }> => {
  return executeQuery(() => {
    let query = supabase.from(table).select('*');
    if (filters) {
      query = query.match(filters);
    }
    return query;
  });
};

export const insertRecord = async <T,>(
  table: string,
  data: T
): Promise<{ data: T | null; error: Error | null }> => {
  return executeQuery(() =>
    supabase.from(table).insert([data as any]).select('*').single()
  );
};

export const updateRecord = async <T,>(
  table: string,
  id: string,
  updates: Partial<T>
): Promise<{ data: T | null; error: Error | null }> => {
  return executeQuery(() =>
    supabase
      .from(table)
      .update(updates as any)
      .eq('id', id)
      .select('*')
      .single()
  );
};

export const deleteRecord = async (
  table: string,
  id: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      console.error('Delete Error:', error);
      return {
        error: new Error(error.message || 'Delete operation failed'),
      };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected Delete Error:', err);
    return {
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};
