import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init';
import { Template, Flow } from '../types';

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const templates = await new Promise<Template[]>((resolve, reject) => {
      db.all('SELECT * FROM templates WHERE is_public = 1 ORDER BY created_at DESC', (err, rows: Template[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Parse flow_data for each template
    const templatesWithParsedData = templates.map(template => ({
      ...template,
      flow_data: JSON.parse(template.flow_data)
    }));

    res.json(templatesWithParsedData);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const template = await new Promise<Template | null>((resolve, reject) => {
      db.get('SELECT * FROM templates WHERE id = ? AND is_public = 1', [id], (err, row: Template) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Parse flow_data
    const templateWithParsedData = {
      ...template,
      flow_data: JSON.parse(template.flow_data)
    };

    res.json(templateWithParsedData);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const seedTemplates = async () => {
  const db = getDatabase();
  
  // Check if templates already exist
  const existingTemplates = await new Promise<Template[]>((resolve, reject) => {
    db.all('SELECT * FROM templates', (err, rows: Template[]) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  if (existingTemplates.length > 0) {
    console.log('Templates already seeded');
    return;
  }

  // Customer Support Bot Template
  const customerSupportFlow: Flow = {
    nodes: [
      {
        id: 'start',
        type: 'start' as any,
        position: { x: 100, y: 100 },
        data: {
          label: 'Welcome',
          content: 'Hello! Welcome to our customer support. How can I help you today?'
        }
      },
      {
        id: 'menu',
        type: 'question' as any,
        position: { x: 100, y: 250 },
        data: {
          label: 'Main Menu',
          content: 'Please select an option:',
          options: ['📞 Contact Support', '📋 FAQ', '📦 Order Status', '💬 Other']
        }
      },
      {
        id: 'support',
        type: 'message' as any,
        position: { x: 50, y: 400 },
        data: {
          label: 'Contact Support',
          content: 'Our support team will contact you shortly. Please provide your email address.'
        }
      },
      {
        id: 'faq',
        type: 'message' as any,
        position: { x: 150, y: 400 },
        data: {
          label: 'FAQ',
          content: 'Here are our most frequently asked questions:\n\n1. How to place an order?\n2. Shipping information\n3. Return policy\n\nFor more details, visit our website.'
        }
      },
      {
        id: 'order',
        type: 'message' as any,
        position: { x: 250, y: 400 },
        data: {
          label: 'Order Status',
          content: 'Please provide your order number and we\'ll check the status for you.'
        }
      },
      {
        id: 'other',
        type: 'message' as any,
        position: { x: 350, y: 400 },
        data: {
          label: 'Other Inquiries',
          content: 'Please describe your inquiry and our team will get back to you.'
        }
      }
    ],
    edges: [
      { id: 'start-menu', source: 'start', target: 'menu' },
      { id: 'menu-support', source: 'menu', target: 'support', label: '📞 Contact Support' },
      { id: 'menu-faq', source: 'menu', target: 'faq', label: '📋 FAQ' },
      { id: 'menu-order', source: 'menu', target: 'order', label: '📦 Order Status' },
      { id: 'menu-other', source: 'menu', target: 'other', label: '💬 Other' }
    ]
  };

  // Lead Generation Bot Template
  const leadGenFlow: Flow = {
    nodes: [
      {
        id: 'start',
        type: 'start' as any,
        position: { x: 100, y: 100 },
        data: {
          label: 'Welcome',
          content: 'Hi there! 👋 I\'m here to help you learn more about our services. Let\'s get started!'
        }
      },
      {
        id: 'intro',
        type: 'question' as any,
        position: { x: 100, y: 250 },
        data: {
          label: 'Introduction',
          content: 'What brings you here today?',
          options: ['🔍 Learn about services', '💼 Business inquiry', '📞 Schedule a call']
        }
      },
      {
        id: 'services',
        type: 'message' as any,
        position: { x: 50, y: 400 },
        data: {
          label: 'Our Services',
          content: 'We offer:\n• Web Development\n• Mobile Apps\n• Digital Marketing\n• Consulting\n\nWhich interests you most?'
        }
      },
      {
        id: 'business',
        type: 'message' as any,
        position: { x: 200, y: 400 },
        data: {
          label: 'Business Inquiry',
          content: 'Great! Let\'s discuss your business needs. Can you tell me more about your project?'
        }
      },
      {
        id: 'schedule',
        type: 'message' as any,
        position: { x: 350, y: 400 },
        data: {
          label: 'Schedule Call',
          content: 'Perfect! I\'ll connect you with our team. Please share your preferred time and contact information.'
        }
      }
    ],
    edges: [
      { id: 'start-intro', source: 'start', target: 'intro' },
      { id: 'intro-services', source: 'intro', target: 'services', label: '🔍 Learn about services' },
      { id: 'intro-business', source: 'intro', target: 'business', label: '💼 Business inquiry' },
      { id: 'intro-schedule', source: 'intro', target: 'schedule', label: '📞 Schedule a call' }
    ]
  };

  // Insert templates
  const templates = [
    {
      id: uuidv4(),
      name: 'Customer Support Bot',
      description: 'A comprehensive customer support bot with menu options for common inquiries',
      category: 'Support',
      flow_data: JSON.stringify(customerSupportFlow),
      is_public: true
    },
    {
      id: uuidv4(),
      name: 'Lead Generation Bot',
      description: 'Capture leads and qualify prospects with this interactive bot',
      category: 'Marketing',
      flow_data: JSON.stringify(leadGenFlow),
      is_public: true
    }
  ];

  for (const template of templates) {
    await new Promise<void>((resolve, reject) => {
      db.run(
        'INSERT INTO templates (id, name, description, category, flow_data, is_public) VALUES (?, ?, ?, ?, ?, ?)',
        [template.id, template.name, template.description, template.category, template.flow_data, template.is_public],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  console.log('Templates seeded successfully');
};