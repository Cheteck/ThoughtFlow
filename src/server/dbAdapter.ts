import fs from 'fs';
import path from 'path';
import { AppDatabase } from './store.js';

export interface IDatabaseAdapter {
  load(): AppDatabase;
  save(data: AppDatabase): void;
}

export class JSONFileAdapter implements IDatabaseAdapter {
  private dataDir: string;
  private dbFile: string;

  constructor(dataDir?: string, dbFile?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data');
    this.dbFile = dbFile || path.join(this.dataDir, 'thoughtflow_db.json');
  }

  public load(): AppDatabase {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    if (fs.existsSync(this.dbFile)) {
      const raw = fs.readFileSync(this.dbFile, 'utf-8');
      return JSON.parse(raw);
    }

    throw new Error('Database file does not exist yet');
  }

  public save(data: AppDatabase): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    const tempFile = `${this.dbFile}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, this.dbFile);
  }
}
