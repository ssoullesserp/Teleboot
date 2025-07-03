import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init';
import { BotFlow, CreateFlowRequest, UpdateFlowRequest, Flow } from '../types';

export const getFlows = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { botId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDatabase();

    // First, verify the bot belongs to the user
    const bot = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM bots WHERE id = ? AND user_id = ?', [botId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const flows = await new Promise<BotFlow[]>((resolve, reject) => {
      db.all('SELECT * FROM bot_flows WHERE bot_id = ? ORDER BY created_at DESC', [botId], (err, rows: BotFlow[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json(flows);
  } catch (error) {
    console.error('Get flows error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFlow = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDatabase();

    // Get flow and verify ownership through bot
    const flowWithBot = await new Promise<any>((resolve, reject) => {
      db.get(`
        SELECT bf.*, b.user_id 
        FROM bot_flows bf 
        JOIN bots b ON bf.bot_id = b.id 
        WHERE bf.id = ? AND b.user_id = ?
      `, [id, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!flowWithBot) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    const { user_id, ...flow } = flowWithBot;
    
    // Parse flow_data back to object
    const flowData = {
      ...flow,
      flow_data: JSON.parse(flow.flow_data)
    };

    res.json(flowData);
  } catch (error) {
    console.error('Get flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createFlow = async (req: Request<{ botId: string }, BotFlow, CreateFlowRequest> & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { botId } = req.params;
    const { name, description, flow_data, is_main } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !flow_data) {
      return res.status(400).json({ error: 'Name and flow data are required' });
    }

    const db = getDatabase();

    // Verify bot ownership
    const bot = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM bots WHERE id = ? AND user_id = ?', [botId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const flowId = uuidv4();

    await new Promise<void>((resolve, reject) => {
      db.run(
        'INSERT INTO bot_flows (id, bot_id, name, description, flow_data, is_main) VALUES (?, ?, ?, ?, ?, ?)',
        [flowId, botId, name, description || null, JSON.stringify(flow_data), is_main || false],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const createdFlow = await new Promise<BotFlow>((resolve, reject) => {
      db.get('SELECT * FROM bot_flows WHERE id = ?', [flowId], (err, row: BotFlow) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Parse flow_data back to object for response
    const responseFlow = {
      ...createdFlow,
      flow_data: JSON.parse(createdFlow.flow_data)
    };

    res.status(201).json(responseFlow);
  } catch (error) {
    console.error('Create flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFlow = async (req: Request<{ id: string }, BotFlow, UpdateFlowRequest> & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, description, flow_data, is_main } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDatabase();

    // Verify ownership through bot
    const existingFlow = await new Promise<any>((resolve, reject) => {
      db.get(`
        SELECT bf.*, b.user_id 
        FROM bot_flows bf 
        JOIN bots b ON bf.bot_id = b.id 
        WHERE bf.id = ? AND b.user_id = ?
      `, [id, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!existingFlow) {
      return res.status(404).json({ error: 'Flow not found' });
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
    if (flow_data !== undefined) {
      updates.push('flow_data = ?');
      values.push(JSON.stringify(flow_data));
    }
    if (is_main !== undefined) {
      updates.push('is_main = ?');
      values.push(is_main);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE bot_flows SET ${updates.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const updatedFlow = await new Promise<BotFlow>((resolve, reject) => {
      db.get('SELECT * FROM bot_flows WHERE id = ?', [id], (err, row: BotFlow) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Parse flow_data back to object for response
    const responseFlow = {
      ...updatedFlow,
      flow_data: JSON.parse(updatedFlow.flow_data)
    };

    res.json(responseFlow);
  } catch (error) {
    console.error('Update flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFlow = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDatabase();

    // Verify ownership through bot
    const existingFlow = await new Promise<any>((resolve, reject) => {
      db.get(`
        SELECT bf.*, b.user_id 
        FROM bot_flows bf 
        JOIN bots b ON bf.bot_id = b.id 
        WHERE bf.id = ? AND b.user_id = ?
      `, [id, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!existingFlow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM bot_flows WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};