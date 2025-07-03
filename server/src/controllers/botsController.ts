import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init';
import { Bot, CreateBotRequest, UpdateBotRequest } from '../types';

export const getBots = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDatabase();
    const bots = await new Promise<Bot[]>((resolve, reject) => {
      db.all('SELECT * FROM bots WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows: Bot[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json(bots);
  } catch (error) {
    console.error('Get bots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBot = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDatabase();
    const bot = await new Promise<Bot | null>((resolve, reject) => {
      db.get('SELECT * FROM bots WHERE id = ? AND user_id = ?', [id, userId], (err, row: Bot) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Get bot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBot = async (req: Request<{}, Bot, CreateBotRequest> & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { name, description, telegram_token } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Bot name is required' });
    }

    const db = getDatabase();
    const botId = uuidv4();

    await new Promise<void>((resolve, reject) => {
      db.run(
        'INSERT INTO bots (id, user_id, name, description, telegram_token) VALUES (?, ?, ?, ?, ?)',
        [botId, userId, name, description || null, telegram_token || null],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const bot = await new Promise<Bot>((resolve, reject) => {
      db.get('SELECT * FROM bots WHERE id = ?', [botId], (err, row: Bot) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(201).json(bot);
  } catch (error) {
    console.error('Create bot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBot = async (req: Request<{ id: string }, Bot, UpdateBotRequest> & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, description, telegram_token, is_active } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDatabase();

    // Check if bot exists and belongs to user
    const existingBot = await new Promise<Bot | null>((resolve, reject) => {
      db.get('SELECT * FROM bots WHERE id = ? AND user_id = ?', [id, userId], (err, row: Bot) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!existingBot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (telegram_token !== undefined) {
      updates.push('telegram_token = ?');
      values.push(telegram_token);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE bots SET ${updates.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const updatedBot = await new Promise<Bot>((resolve, reject) => {
      db.get('SELECT * FROM bots WHERE id = ?', [id], (err, row: Bot) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json(updatedBot);
  } catch (error) {
    console.error('Update bot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBot = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDatabase();

    // Check if bot exists and belongs to user
    const existingBot = await new Promise<Bot | null>((resolve, reject) => {
      db.get('SELECT * FROM bots WHERE id = ? AND user_id = ?', [id, userId], (err, row: Bot) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!existingBot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM bots WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete bot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};