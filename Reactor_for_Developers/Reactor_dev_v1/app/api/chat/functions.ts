
import { ChatCompletionCreateParams } from "openai/resources/chat/index";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL or SUPABASE_KEY is not set in the environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "add_code",
    description: "Adds code to the Supabase database.",
    parameters: {
      type: "object",
      properties: {
        fileName: {
          type: "string",
          description: "The name of the file.",
        },
        path: {
          type: "string",
          description: "The path of the file.",
        },
        code: {
          type: "string",
          description: "The content of the file.",
        },
      },
      required: ["fileName", "path", "code"],
    },
  },
  {
    name: "get_code",
    description: "Retrieves a code file entry from the Supabase database by providing the entry's ID.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The ID of the code file entry.",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "list_code_files",
    description: "Lists all code file entries in the Supabase database and returns the ID, fileName, and path of each entry.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

async function add_code_to_supabase({ fileName, path: filePath, code }: { fileName: string, path: string, code: string }) {
  
  const { error } = await supabase
    .from('codeStorage')
    .insert([
      { fileName: fileName, path: filePath, code: code },
    ]);

  if (error) {
    console.error('Fehler beim Hinzufügen des Codes:', error.message);
    return { error: error.message };
  } else {
    return new Promise(async (resolve, reject) => {
      
      const { data: latestData, error: latestError } = await supabase
        .from('codeStorage')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (latestError || !latestData || latestData.length === 0) {
        console.error('Fehler beim Abrufen der neuesten ID:', latestError?.message);
        reject({ error: latestError?.message || 'No data after code insertion' });
      }

      console.log(`Code erfolgreich zu ${filePath}/${fileName} hinzugefügt.`);
      resolve({ success: true, fileName, path: filePath, id: latestData[0].id, code });
    });
    
  }
}


async function get_code_from_supabase({ id }: { id: number }) {
  const { data, error } = await supabase
    .from('codeStorage')
    .select('fileName, path, code')
    .eq('id', id);

  if (error) {
    console.error('Fehler beim Abrufen des Codes:', error.message);
    return { error: error.message };
  } else if (data && data.length > 0) {
    console.log(`Code für ${data[0].path}/${data[0].fileName} abgerufen.`);
    return { fileName: data[0].fileName, path: data[0].path, code: data[0].code, id };
  } else {
    console.error('Code nicht gefunden für id:', id); 
    return { error: "Code not found" };
  }
}

// Funktion zum Auflisten aller Code-Dateien in Supabase
async function list_code_files_from_supabase() {
  const { data, error } = await supabase
    .from('codeStorage')
    .select('id, fileName, path');

  if (error) {
    console.error('Fehler beim Abrufen der Code-Dateiliste:', error.message);
    console.error(error)
    return { error: error.message };
  } else {
    console.log('Liste der Code-Dateien abgerufen:', data); 
    return { files: data };
  }
}

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "add_code":
      return await add_code_to_supabase(args);
    case "get_code":
      return await get_code_from_supabase(args);
    case "list_code_files":
      return await list_code_files_from_supabase();
    default:
      console.error('Unbekannte Funktion:', name); 
      return { error: "Function not found" };
  }
}